import {ColorRole, FilterType, ColorFormat} from '../shared/utils/constants.js';
import {convertColor} from '../shared/utils/colorConversion.js';
import {ColorPicker} from '../PaletteModule/colorPicker.js';
import {toggleTheme} from './toggleThemeBtn.js';
import {share} from './shareBtn.js';
import {WCAGAnalyzer} from '../shared/accessibility/WCAGAnalyzer.js';
import {getTextColor} from '../shared/utils/textColorOverlay.js';
import {exportPalette} from './exportBtn.js';
import {savePaletteToStorage} from '../shared/utils/paletteUtils.js';
import {addCopyListener} from './clipboardUtils.js';
import {Palette} from '../shared/types/Palette.js';
import {Color} from '../shared/types/Color.js';
import {
  initPreviewPanel,
  updatePreviewPanel,
  showPreviewTab,
  hidePreviewTab,
} from './previewPanel.js';

// --- Module state ---
let currentPalette = null;
let activeSwatchIndex = -1;

// Maximum number of times each role may be assigned across the palette.
const ROLE_LIMITS = {
  [ColorRole.PRIMARY]: 1,
  [ColorRole.SECONDARY]: 1,
  [ColorRole.ACCENT]: 2,
  [ColorRole.ALERT]: 1,
  [ColorRole.BACKGROUND]: 1,
  [ColorRole.TEXT]: 1,
};

// --- Theme ---
if (localStorage.getItem('theme') === FilterType.DARK_MODE) toggleTheme(false);

document
  .getElementById('edit-theme-toggle')
  .addEventListener('click', () => toggleTheme(true));

// --- ColorPicker setup ---
// Create a hidden anchor button for the picker (it needs a .color-preview child)
const pickerAnchor = document.createElement('button');
pickerAnchor.style.display = 'none';
const pickerPreview = document.createElement('span');
pickerPreview.className = 'color-preview';
pickerPreview.style.backgroundColor = '#3399FF';
pickerAnchor.appendChild(pickerPreview);
document.body.appendChild(pickerAnchor);

const colorPicker = new ColorPicker(pickerAnchor, (hexColor) => {
  if (activeSwatchIndex < 0 || !currentPalette) return;

  // Replace the color at activeSwatchIndex in the Map
  const entries = [...currentPalette.colorMap.entries()];
  if (activeSwatchIndex >= entries.length) return;

  const [, role] = entries[activeSwatchIndex];
  const newColor = Color.fromHex(hexColor);

  // Rebuild Map preserving order
  const newMap = new Map();
  entries.forEach(([c, r], i) => {
    if (i === activeSwatchIndex) {
      newMap.set(newColor, role);
    } else {
      newMap.set(c, r);
    }
  });
  currentPalette.colorMap = newMap;

  renderSwatches();
  renderRoles();
  renderWCAGTable();
  updateStatus('Palette updated');
});

// The pickerAnchor is hidden (display:none), so the auto-click listener
// the ColorPicker attaches to it is harmless. We open the picker manually
// via pencil icon clicks on each swatch.

// --- Init ---
initPreviewPanel(() => currentPalette);
initEditPage();

/**
 * Initializes the Edit Page by loading palette data and setting up the UI.
 * @author Ali Aldaghishy
 */
function initEditPage() {
  const raw = localStorage.getItem('myPalette');
  if (!raw) {
    showEmptyState();
    return;
  }

  try {
    const data = JSON.parse(raw);
    // data.colorMap is an array of [[{r,g,b}, role], ...]
    const map = new Map();
    data.colorMap.forEach(([colorObj, role]) => {
      map.set(new Color(colorObj.r, colorObj.g, colorObj.b), role);
    });
    currentPalette = new Palette(map, data.isDarkTheme || false);

    showEditCard();
    renderSwatches();
    renderRoles();
    renderWCAGTable();
    updateStatus('Palette loaded');
  } catch (e) {
    console.error('Failed to parse myPalette data:', e);
    showEmptyState();
  }
}

/**
 * Displays the empty state when no palette is loaded.
 * @author Ali Aldaghishy
 */
function showEmptyState() {
  document.getElementById('edit-empty-state').classList.remove('hidden');
  document.getElementById('edit-container').classList.add('hidden');
  hidePreviewTab();
  updateStatus('No palette loaded');
}

/**
 * Shows the edit card UI for palette editing.
 * @author Ali Aldaghishy
 */
function showEditCard() {
  document.getElementById('edit-empty-state').classList.add('hidden');
  document.getElementById('edit-container').classList.remove('hidden');
  showPreviewTab();
}

/**
 * Updates the status bar message on the Edit Page.
 * @param {string} msg - The status message to display.
 * @author Ali Aldaghishy
 */
function updateStatus(msg) {
  document.getElementById('edit-status-bar').textContent = 'Edit Page - ' + msg;
  setTimeout(() => {
    document.getElementById('edit-status-bar').textContent = '';
  }, 1500);
}

// --- Render Swatches ---
/**
 * Renders the color swatches for the current palette.
 * @author Ali Aldaghishy
 */
function renderSwatches() {
  const container = document.getElementById('edit-swatches-row');
  container.innerHTML = '';

  const report = WCAGAnalyzer.analyzePalette(currentPalette);

  let index = 0;
  for (const [color, role] of currentPalette.colorMap) {
    const hexValue = color.getHEX().value;

    // Get the color report associated with the color
    const colorReport = report.findResultForColor(color);

    // Determine target color based on bestAgainst
    let targetColor;
    if (!colorReport) {
      console.error('No WCAG report found for color:', color.getHEX().value);
      targetColor = getTextColor(color); // fallback
    } else {
      targetColor =
        colorReport.getBestAgainst() === ColorRole.BACKGROUND
          ? currentPalette.getBackgroundColor()
          : currentPalette.getTextColor();
    }

    const textHex = targetColor.getHEX().value;

    const swatch = document.createElement('div');
    swatch.className = 'edit-swatch';
    swatch.style.backgroundColor = hexValue;
    swatch.title = `Click to copy ${hexValue.toUpperCase()}`;

    const hexLabel = document.createElement('span');
    addCopyListener(swatch, hexValue.toUpperCase(), hexLabel);
    hexLabel.className = 'edit-swatch-hex';
    hexLabel.textContent = hexValue.toUpperCase();
    hexLabel.style.color = textHex;

    const roleLabel = document.createElement('span');
    roleLabel.className = 'edit-swatch-role';
    roleLabel.textContent = role || '';
    roleLabel.style.color = textHex;

    const editIcon = document.createElement('span');
    editIcon.className = 'edit-swatch-edit-icon';
    editIcon.textContent = '\u270E'; // pencil
    editIcon.title = 'Edit color';

    const idx = index;
    editIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      activeSwatchIndex = idx;
      colorPicker.setColor(hexValue);
      colorPicker.open();
    });

    // Delete icon (top-left, visible on hover)
    const deleteIcon = document.createElement('span');
    deleteIcon.className = 'edit-swatch-delete-icon';
    deleteIcon.textContent = '\u2715'; // ✕
    deleteIcon.title = 'Remove color';

    deleteIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentPalette.colorMap.size <= 1) return; // keep at least 1
      const entries = [...currentPalette.colorMap.entries()];
      entries.splice(idx, 1);
      currentPalette.colorMap = new Map(entries);
      renderSwatches();
      renderRoles();
      renderWCAGTable();
      updateStatus('Color removed');
    });

    swatch.appendChild(deleteIcon);
    swatch.appendChild(hexLabel);
    swatch.appendChild(roleLabel);
    swatch.appendChild(editIcon);
    container.appendChild(swatch);
    index++;
  }

  // "Add Swatch" button at the end
  const addBtn = document.createElement('button');
  addBtn.className = 'edit-add-swatch';
  const plus = document.createElement('span');
  plus.textContent = '+';
  plus.style.fontSize = '1.5rem';
  const addLabel = document.createElement('span');
  addLabel.textContent = 'Add Color';
  addBtn.appendChild(plus);
  addBtn.appendChild(addLabel);

  addBtn.addEventListener('click', () => {
    // Generate a random color
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const newColor = new Color(r, g, b);
    currentPalette.colorMap.set(newColor, null);
    renderSwatches();
    renderRoles();
    renderWCAGTable();
    updateStatus('Color added');

    // Open color picker for the newly added swatch
    activeSwatchIndex = currentPalette.colorMap.size - 1;
    colorPicker.setColor(newColor.getHEX().value);
    colorPicker.open();
  });

  container.appendChild(addBtn);
}

// --- Render Roles ---
/**
 * Renders the role assignment grid for palette colors.
 * @author Ali Aldaghishy
 */
function renderRoles() {
  const container = document.getElementById('edit-roles-grid');
  container.innerHTML = '';

  const roleDescriptions = {
    [ColorRole.PRIMARY]: 'Main brand color used for key UI elements',
    [ColorRole.SECONDARY]: 'Supporting color for secondary actions',
    [ColorRole.ACCENT]: 'Highlight color for emphasis and accents',
    [ColorRole.ALERT]: 'Color for warnings, errors, and notifications',
    [ColorRole.BACKGROUND]: 'Base background color of the interface',
    [ColorRole.TEXT]: 'Primary text color for readability',
  };

  const entries = [...currentPalette.colorMap.entries()];

  // Count how many colors already have each role assigned (across all entries).
  const roleCounts = {};
  for (const [, r] of entries) {
    if (r) roleCounts[r] = (roleCounts[r] || 0) + 1;
  }

  entries.forEach(([color, role], index) => {
    const item = document.createElement('div');
    item.className = 'edit-role-item';

    const dot = document.createElement('div');
    dot.className = 'edit-role-dot';
    dot.style.backgroundColor = color.getHEX().value;

    const info = document.createElement('div');
    info.className = 'edit-role-info';

    const name = document.createElement('div');
    name.className = 'edit-role-name';
    name.textContent = role || 'Unassigned';

    const desc = document.createElement('div');
    desc.className = 'edit-role-description';
    desc.textContent = role ? roleDescriptions[role] || '' : 'No role assigned';

    info.appendChild(name);
    info.appendChild(desc);

    // Role reassignment dropdown
    const select = document.createElement('select');
    select.className = 'edit-role-select';

    const noneOpt = document.createElement('option');
    noneOpt.value = '';
    noneOpt.textContent = 'None';
    select.appendChild(noneOpt);

    Object.values(ColorRole).forEach((r) => {
      const opt = document.createElement('option');
      opt.value = r;
      opt.textContent = r.charAt(0).toUpperCase() + r.slice(1);
      if (r === role) opt.selected = true;

      // Disable the option if the role is already at its limit and this color
      // does not currently hold that role (so it can always re-select its own).
      const usedElsewhere = (roleCounts[r] || 0) - (role === r ? 1 : 0);
      if (usedElsewhere >= ROLE_LIMITS[r]) opt.disabled = true;

      select.appendChild(opt);
    });

    if (!role) noneOpt.selected = true;

    select.addEventListener('change', () => {
      const newRole = select.value || null;
      const allEntries = [...currentPalette.colorMap.entries()];
      const newMap = new Map();
      allEntries.forEach(([c, r], i) => {
        newMap.set(c, i === index ? newRole : r);
      });
      currentPalette.colorMap = newMap;
      renderSwatches();
      renderRoles();
      renderWCAGTable();
    });

    item.appendChild(dot);
    item.appendChild(info);
    item.appendChild(select);
    container.appendChild(item);
  });
}

// --- Render WCAG Table ---
/**
 * Renders the WCAG compliance table for palette colors.
 * Each color is paired with whichever of the Background or Text role color
 * gives the better contrast, using the same bestAgainst logic as renderSwatches.
 * @author Ali Aldaghishy
 */
function renderWCAGTable() {
  const tbody = document.getElementById('wcag-table-body');
  tbody.innerHTML = '';

  const warning = document.getElementById('wcag-warning');

  // Show warning when neither TEXT nor BACKGROUND role is explicitly assigned
  const roles = [...currentPalette.colorMap.values()];
  const hasText = roles.includes(ColorRole.TEXT);
  const hasBg = roles.includes(ColorRole.BACKGROUND);
  if (!hasText || !hasBg) {
    warning.classList.remove('hidden');
  } else {
    warning.classList.add('hidden');
  }

  // Use the same analysis renderSwatches uses to determine bestAgainst per color
  const report = WCAGAnalyzer.analyzePalette(currentPalette);

  for (const [color] of currentPalette.colorMap) {
    const hexValue = color.getHEX().value.toUpperCase();

    const colorReport = report.findResultForColor(color);

    // Mirror the renderSwatches logic: use bestAgainst to pick background or text
    const pairedColor =
      colorReport && colorReport.getBestAgainst() === ColorRole.BACKGROUND
        ? currentPalette.getBackgroundColor()
        : currentPalette.getTextColor();

    // Skip if the color would be tested against itself
    if (pairedColor.getHEX().value === color.getHEX().value) continue;

    const pairedHex = pairedColor.getHEX().value.toUpperCase();
    const contrast = WCAGAnalyzer.computePairContrast(color, pairedColor);
    const label = WCAGAnalyzer.wcagLabel(contrast);

    appendWCAGRow(
      tbody,
      hexValue,
      color.getHEX().value,
      pairedHex,
      pairedColor.getHEX().value,
      contrast,
      label
    );
  }

  updatePreviewPanel();
  savePalette();
}

/**
 * Appends a row to the WCAG compliance table.
 * @author Ali Aldaghishy
 * @param {HTMLElement} tbody - The table body element.
 * @param {string} hexLabel - The hex label for the color.
 * @param {string} colorHex - The hex value for the color.
 * @param {string} testLabel - The label for the test color.
 * @param {string} testBgHex - The hex value for the test background color.
 * @param {number} contrast - The contrast ratio.
 * @param {string} label - The WCAG compliance label.
 */
function appendWCAGRow(
  tbody,
  hexLabel,
  colorHex,
  testLabel,
  testBgHex,
  contrast,
  label
) {
  const tr = document.createElement('tr');

  // Color cell
  const tdColor = document.createElement('td');
  const colorCell = document.createElement('div');
  colorCell.className = 'wcag-color-cell';
  const swatch1 = document.createElement('span');
  swatch1.className = 'wcag-color-swatch';
  swatch1.style.backgroundColor = colorHex;
  colorCell.appendChild(swatch1);
  colorCell.appendChild(document.createTextNode(hexLabel));
  tdColor.appendChild(colorCell);

  // Test color cell
  const tdTest = document.createElement('td');
  const testCell = document.createElement('div');
  testCell.className = 'wcag-color-cell';
  const swatch2 = document.createElement('span');
  swatch2.className = 'wcag-color-swatch';
  swatch2.style.backgroundColor = testBgHex;
  testCell.appendChild(swatch2);
  testCell.appendChild(document.createTextNode(testLabel));
  tdTest.appendChild(testCell);

  // Contrast ratio
  const tdRatio = document.createElement('td');
  tdRatio.textContent = contrast.toFixed(2) + ':1';

  // Compliance
  const tdCompliance = document.createElement('td');
  tdCompliance.className =
    'wcag-compliance-cell ' + (label === 'FAIL' ? 'fail' : 'pass');
  tdCompliance.textContent = label;

  tr.appendChild(tdColor);
  tr.appendChild(tdTest);
  tr.appendChild(tdRatio);
  tr.appendChild(tdCompliance);
  tbody.appendChild(tr);
}

// --- Custom Color Test ---
/**
 * Computes and displays the contrast between two custom colors.
 * @author Ali Aldaghishy
 */
function computeColorOnColorContrast() {
  const input1 = document.getElementById('custom-color-input-1');
  const input2 = document.getElementById('custom-color-input-2');
  const preview1 = document.getElementById('custom-color-preview-1');
  const preview2 = document.getElementById('custom-color-preview-2');
  const resultDiv = document.getElementById('custom-color-result');
  const ratioDiv = document.getElementById('custom-contrast-ratio');
  const labelDiv = document.getElementById('custom-compliance-label');
  const swatchDiv = document.getElementById('custom-color-swatch');

  const hex1 = input1.value.trim();
  const hex2 = input2.value.trim();

  // Validate both colors
  const validHex = /^#[0-9A-Fa-f]{6}$/;
  const valid1 = validHex.test(hex1);
  const valid2 = validHex.test(hex2);

  // Update preview 1
  if (valid1) {
    preview1.style.backgroundColor = hex1;
  } else {
    preview1.style.backgroundColor = 'transparent';
  }

  // Update preview 2
  if (valid2) {
    preview2.style.backgroundColor = hex2;
  } else {
    preview2.style.backgroundColor = 'transparent';
  }

  // If both valid, compute contrast
  if (valid1 && valid2) {
    const color1 = Color.fromHex(hex1);
    const color2 = Color.fromHex(hex2);
    const contrast = WCAGAnalyzer.computePairContrast(color1, color2);
    const label = WCAGAnalyzer.wcagLabel(contrast);

    // Update swatch to show color1 as background with color2 as text
    swatchDiv.style.backgroundColor = hex1;
    swatchDiv.style.color = hex2;

    ratioDiv.textContent = contrast.toFixed(2) + ':1';
    labelDiv.textContent = label;
    labelDiv.style.color = label === 'FAIL' ? '#e74c3c' : '#27ae60';
    resultDiv.style.display = '';
  } else {
    resultDiv.style.display = 'none';
  }
}

document
  .getElementById('custom-color-input-1')
  .addEventListener('input', computeColorOnColorContrast);
document
  .getElementById('custom-color-input-2')
  .addEventListener('input', computeColorOnColorContrast);

// --- Color Converter ---
/**
 * Converts a color in any supported format (HEX, RGB, HSL, OKLCH) to the
 * selected output format and displays the result.
 * @author Ali Aldaghishy
 */
function convertColorInput() {
  const input = document.getElementById('converter-color-input');
  const formatSelect = document.getElementById('converter-format-select');
  const preview = document.getElementById('converter-preview');
  const valueEl = document.getElementById('converter-value');

  const raw = input.value.trim();
  if (!raw) {
    preview.classList.remove('visible');
    preview.style.backgroundColor = '';
    valueEl.textContent = 'Enter a color value';
    return;
  }

  // Try to obtain a hex representation for the preview swatch.
  // convertColor → HEX will work for any parseable input.
  let previewHex;
  try {
    previewHex = convertColor(raw, ColorFormat.HEX).value;
  } catch {
    preview.classList.remove('visible');
    preview.style.backgroundColor = '';
    valueEl.textContent = 'Unrecognised color';
    return;
  }

  preview.classList.add('visible');
  preview.style.backgroundColor = previewHex;

  const format = formatSelect.value;
  try {
    if (format === ColorFormat.HEX) {
      valueEl.textContent = previewHex.toUpperCase();
      return;
    }

    const result = convertColor(raw, format);
    let display;
    if (format === ColorFormat.RGB) {
      const r = Math.round(result.r * 255);
      const g = Math.round(result.g * 255);
      const b = Math.round(result.b * 255);
      display = `rgb(${r}, ${g}, ${b})`;
    } else if (format === ColorFormat.HSL) {
      const h = Math.round((result.h || 0) * 10) / 10;
      const s = Math.round((result.s || 0) * 1000) / 10;
      const l = Math.round((result.l || 0) * 1000) / 10;
      display = `hsl(${h}°, ${s}%, ${l}%)`;
    } else if (format === ColorFormat.OKLCH) {
      const L = Math.round((result.l || 0) * 1000) / 1000;
      const c = Math.round((result.c || 0) * 1000) / 1000;
      const h = Math.round((result.h || 0) * 10) / 10;
      display = `oklch(${L}, ${c}, ${h})`;
    } else {
      display = JSON.stringify(result);
    }
    valueEl.textContent = display;
  } catch (e) {
    valueEl.textContent = 'Conversion error';
  }
}

document
  .getElementById('converter-color-input')
  .addEventListener('input', convertColorInput);
document
  .getElementById('converter-format-select')
  .addEventListener('change', convertColorInput);

/** * Shuffles the colors in the current palette while keeping role assignments intact.
 * @author Ali Aldaghishy
 */
document.getElementById('shuffle-colors-btn').addEventListener('click', () => {
  if (!currentPalette) return;

  const entries = [...currentPalette.colorMap.entries()];
  // Fisher-Yates shuffle on the color values, keeping roles in place
  const colors = entries.map(([c]) => c);
  for (let i = colors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [colors[i], colors[j]] = [colors[j], colors[i]];
  }

  const newMap = new Map();
  entries.forEach(([, role], i) => {
    newMap.set(colors[i], role);
  });
  currentPalette.colorMap = newMap;

  renderSwatches();
  renderRoles();
  renderWCAGTable();
  updateStatus('Colors shuffled');
});

// --- Share ---
document
  .getElementById('share-palette-btn')
  .addEventListener('click', () => share());

// --- Save Palette ---
/**
 * Persists the current palette to localStorage so all changes are retained.
 * @author Ali Aldaghishy
 */
function savePalette() {
  if (!currentPalette) return;
  savePaletteToStorage(currentPalette);
}

// --- Export Palette ---
document.getElementById('export-palette-btn').addEventListener('click', () => {
  if (!currentPalette) return;
  exportPalette(currentPalette);
});
