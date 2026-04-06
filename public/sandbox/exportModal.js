import {convertColor} from '/shared/utils/colorConversion.js';
import {ColorFormat} from '/shared/utils/constants.js';

/**
 * createExportModal(): { open: Function, close: Function, setActiveTab: Function }
 * Sets up the export modal by caching its DOM elements, wiring up events,
 * and returning the public controls used by the page.
 * Handles tab switching, CSS export generation, copy/download actions,
 * and basic open/close modal behavior.
 * @author Ian Timchak
 * @returns {{open: Function, close: Function, setActiveTab: Function}} The modal control methods.
 */
export function createExportModal() {
  const overlay = document.getElementById('export-modal-overlay');
  const closeBtn = document.getElementById('export-modal-close-btn');
  const cancelBtn = document.getElementById('export-cancel-btn');
  const copyBtn = document.getElementById('export-copy-btn');
  const downloadBtn = document.getElementById('export-download-btn');
  const subtitle = document.getElementById('export-modal-subtitle');
  const palettePreview = document.getElementById('export-palette-preview');
  const cssFormatSelect = document.getElementById('export-css-format-select');
  const cssOutput = document.getElementById('export-output-css');

  const tabButtons = Array.from(document.querySelectorAll('[data-export-tab]'));
  const tabPanels = Array.from(
    document.querySelectorAll('[data-export-panel]')
  );

  let selectedPalette = null;
  let activeTab = 'css';
  let cssColorFormat = 'hex';

  /**
   * open(palette: object, defaultTab: string = 'css'): void
   * Opens the export modal for the provided palette.
   * Updates the subtitle, preview, CSS output, and selected tab.
   * @author Ian Timchak
   * @param {object} palette - Export-ready palette data.
   * @param {string} defaultTab - The tab to open first.
   * @returns {void}
   */
  function open(palette, defaultTab = 'css') {
    selectedPalette = palette || null;

    subtitle.textContent = selectedPalette?.name
      ? `Exporting "${selectedPalette.name}"`
      : 'Choose an export format.';

    if (cssFormatSelect) {
      cssFormatSelect.value = cssColorFormat;
    }

    renderPalettePreview();
    renderCssOutput();
    setActiveTab(defaultTab);

    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
  }

  /**
   * close(): void
   * Closes the export modal.
   * @author Ian Timchak
   * @returns {void}
   */
  function close() {
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
  }

  /**
   * setActiveTab(tabName: string): void
   * Switches the active export tab and its matching panel.
   * Also refreshes which action buttons should be enabled.
   * @author Ian Timchak
   * @param {string} tabName - The tab identifier to activate.
   * @returns {void}
   */
  function setActiveTab(tabName) {
    activeTab = tabName;

    tabButtons.forEach((button) => {
      const isActive = button.dataset.exportTab === tabName;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', String(isActive));
    });

    tabPanels.forEach((panel) => {
      const isActive = panel.dataset.exportPanel === tabName;
      panel.classList.toggle('active', isActive);
      panel.hidden = !isActive;
    });

    syncActionButtons();
  }

  /**
   * syncActionButtons(): void
   * Enables copy and download only on the CSS tab.
   * @author Ian Timchak
   * @returns {void}
   */
  function syncActionButtons() {
    const isCssTab = activeTab === 'css';
    copyBtn.disabled = !isCssTab;
    downloadBtn.disabled = !isCssTab;
  }

  /**
   * renderPalettePreview(): void
   * Renders the compact swatch preview for the selected palette.
   * Falls back to Color # labels when no role or label is present.
   * @author Ian Timchak
   * @returns {void}
   */
  function renderPalettePreview() {
    if (!selectedPalette || !Array.isArray(selectedPalette.colors)) {
      palettePreview.innerHTML = '';
      return;
    }

    palettePreview.innerHTML = selectedPalette.colors
      .map((color, index) => {
        const hex = typeof color === 'string' ? color : color.hex;
        const label =
          typeof color === 'string'
            ? `Color ${index + 1}`
            : color.role || color.label || `Color ${index + 1}`;

        return `
          <div class="export-palette-swatch" style="background:${hex}">
            <span class="export-palette-swatch-label">${escapeHtml(label)}</span>
          </div>
        `;
      })
      .join('');
  }

  /**
   * renderCssOutput(): void
   * Regenerates the CSS export for the current palette and color format.
   * @author Ian Timchak
   * @returns {void}
   */
  function renderCssOutput() {
    if (!cssOutput) return;

    if (!selectedPalette) {
      cssOutput.value = '';
      return;
    }

    cssOutput.value = buildCssExport(selectedPalette, cssColorFormat);
  }

  /**
   * buildCssExport(palette: object, format: string): string
   * Builds the CSS custom property output for the selected palette.
   * Uses role names when present, otherwise falls back to color-# by palette position.
   * Keeps token names unique if the same role appears more than once.
   * @author Ian Timchak
   * @param {object} palette - Export-ready palette data.
   * @param {string} format - The color representation to use.
   * @returns {string} The generated CSS block.
   */
  function buildCssExport(palette, format) {
    const colors = Array.isArray(palette.colors) ? palette.colors : [];
    const usedTokenNames = new Set();

    const lines = colors.map((color, index) => {
      const rawHex = typeof color === 'string' ? color : color.hex;
      const rawRole =
        typeof color === 'string' ? '' : color.role || color.label || '';

      const baseTokenName =
        rawRole && String(rawRole).trim()
          ? normalizeTokenName(rawRole)
          : `color-${index + 1}`;

      const tokenName = makeUniqueTokenName(baseTokenName, usedTokenNames);
      const formattedValue = formatColorForCss(rawHex, format);

      return `  --${tokenName}: ${formattedValue};`;
    });

    return `:root {\n${lines.join('\n')}\n}`;
  }

  /**
   * makeUniqueTokenName(baseName: string, usedTokenNames: Set<string>): string
   * Makes sure each exported CSS variable name is unique.
   * Adds -2, -3, and so on when needed.
   * @author Ian Timchak
   * @param {string} baseName - The preferred token name.
   * @param {Set<string>} usedTokenNames - Names already used in this export.
   * @returns {string} A unique token name.
   */
  function makeUniqueTokenName(baseName, usedTokenNames) {
    let candidate = baseName;
    let suffix = 2;

    while (usedTokenNames.has(candidate)) {
      candidate = `${baseName}-${suffix}`;
      suffix += 1;
    }

    usedTokenNames.add(candidate);
    return candidate;
  }

  /**
   * normalizeTokenName(name: string): string
   * Normalizes a role or label into a CSS-safe token name.
   * @author Ian Timchak
   * @param {string} name - The raw role or label.
   * @returns {string} A normalized token name.
   */
  function normalizeTokenName(name) {
    const normalized = String(name)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    return normalized || 'color';
  }

  /**
   * formatColorForCss(colorValue: string, format: string): string
   * Converts a color into the selected CSS representation.
   * Supports HEX, RGB, HSL, and OKLCH.
   * @author Ian Timchak
   * @param {string} colorValue - The source color value, usually HEX.
   * @param {string} format - The output format to use.
   * @returns {string} A CSS-ready color string.
   */
  function formatColorForCss(colorValue, format) {
    switch (format) {
      case 'hex':
        return convertColor(colorValue, ColorFormat.HEX).value.toUpperCase();

      case 'rgb': {
        const rgb = convertColor(colorValue, ColorFormat.RGB);
        const r = Math.round(rgb.r * 255);
        const g = Math.round(rgb.g * 255);
        const b = Math.round(rgb.b * 255);
        return `rgb(${r} ${g} ${b})`;
      }

      case 'hsl': {
        const hsl = convertColor(colorValue, ColorFormat.HSL);
        const h = Math.round(hsl.h ?? 0);
        const s = Math.round((hsl.s ?? 0) * 100);
        const l = Math.round((hsl.l ?? 0) * 100);
        return `hsl(${h} ${s}% ${l}%)`;
      }

      case 'oklch': {
        const oklch = convertColor(colorValue, ColorFormat.OKLCH);
        const l = Number((oklch.l ?? 0).toFixed(3));
        const c = Number((oklch.c ?? 0).toFixed(3));
        const h = Number((oklch.h ?? 0).toFixed(1));
        return `oklch(${l} ${c} ${h})`;
      }

      default:
        return convertColor(colorValue, ColorFormat.HEX).value.toUpperCase();
    }
  }

  /**
   * escapeHtml(value: string): string
   * Escapes label text before it is inserted into the preview markup.
   * @author Ian Timchak
   * @param {string} value - The raw text value.
   * @returns {string} Escaped HTML-safe text.
   */
  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  /**
   * copyCurrentOutput(): Promise<void>
   * Copies the current CSS export text to the clipboard.
   * Temporarily changes the button label after a successful copy.
   * @author Ian Timchak
   * @returns {Promise<void>}
   */
  async function copyCurrentOutput() {
    if (activeTab !== 'css' || !cssOutput?.value) return;

    try {
      await navigator.clipboard.writeText(cssOutput.value);
      copyBtn.textContent = 'Copied';

      setTimeout(() => {
        copyBtn.textContent = 'Copy';
      }, 1200);
    } catch (error) {
      console.error('Failed to copy CSS export output:', error);
    }
  }

  /**
   * downloadCurrentExport(): void
   * Downloads the current CSS export as a .css file.
   * @author Ian Timchak
   * @returns {void}
   */
  function downloadCurrentExport() {
    if (activeTab !== 'css' || !selectedPalette) return;

    const content = buildCssExport(selectedPalette, cssColorFormat);
    const fileNameBase = selectedPalette?.name
      ? normalizeTokenName(selectedPalette.name)
      : 'palette-export';

    const blob = new Blob([content], {type: 'text/css;charset=utf-8'});
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileNameBase}.css`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setActiveTab(button.dataset.exportTab);
    });
  });

  if (cssFormatSelect) {
    cssFormatSelect.addEventListener('change', (event) => {
      cssColorFormat = event.target.value;
      renderCssOutput();
    });
  }

  closeBtn.addEventListener('click', close);
  cancelBtn.addEventListener('click', close);
  copyBtn.addEventListener('click', copyCurrentOutput);
  downloadBtn.addEventListener('click', downloadCurrentExport);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      close();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && overlay.classList.contains('active')) {
      close();
    }
  });

  return {
    open,
    close,
    setActiveTab,
  };
}
