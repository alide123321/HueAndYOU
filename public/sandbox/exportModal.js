import {convertColor} from '/shared/utils/colorConversion.js';
import {ColorFormat} from '/shared/utils/constants.js';

export function createExportModal() {
  const overlay = document.getElementById('export-modal-overlay');
  const closeBtn = document.getElementById('export-modal-close-btn');
  const cancelBtn = document.getElementById('export-cancel-btn');
  const copyBtn = document.getElementById('export-copy-btn');
  const downloadBtn = document.getElementById('export-download-btn');
  const subtitle = document.getElementById('export-modal-subtitle');
  const palettePreview = document.getElementById('export-palette-preview');
  const cssFormatSelect = document.getElementById('export-css-format-select');

  const tabButtons = Array.from(document.querySelectorAll('[data-export-tab]'));
  const tabPanels = Array.from(
    document.querySelectorAll('[data-export-panel]')
  );

  const cssOutput = document.getElementById('export-output-css');

  let selectedPalette = null;
  let activeTab = 'css';
  let cssColorFormat = 'hex';

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

  function close() {
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
  }

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

  function syncActionButtons() {
    const isCssTab = activeTab === 'css';

    copyBtn.disabled = !isCssTab;
    downloadBtn.disabled = !isCssTab;
  }

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

  function renderCssOutput() {
    if (!cssOutput) return;

    if (!selectedPalette) {
      cssOutput.value = '';
      return;
    }

    cssOutput.value = buildCssExport(selectedPalette, cssColorFormat);
  }

  function buildCssExport(palette, format) {
    const colors = Array.isArray(palette.colors) ? palette.colors : [];

    const lines = colors.map((color, index) => {
      const rawHex = typeof color === 'string' ? color : color.hex;
      const rawName =
        typeof color === 'string'
          ? `color-${index + 1}`
          : color.role || color.label || `color-${index + 1}`;

      const tokenName = normalizeTokenName(rawName);
      const formattedValue = formatColorForCss(rawHex, format);

      return `  --${tokenName}: ${formattedValue};`;
    });

    return `:root {\n${lines.join('\n')}\n}`;
  }

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

  function normalizeTokenName(name) {
    return String(name)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

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
