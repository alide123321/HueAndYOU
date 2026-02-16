import {ColorRole, FilterType, ColorFormat} from '/shared/utils/constants.js';
import {ColorPicker} from '/paletteModule/colorPicker.js';
import {toggleTheme} from '/src/toggleThemeBtn.js';
import {share} from '/src/shareBtn.js';
import {WCAGAnalyzer} from '/shared/accessibility/WCAGAnalyzer.js';
import {getTextColor} from '/shared/utils/textColorOverlay.js';
import {Palette} from '/shared/types/Palette.js';
import {Color} from '/shared/types/Color.js';

// --- Module state ---
let currentPalette = null;
let activeSwatchIndex = -1;

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
  updateStatus('No palette loaded');
}

/**
 * Shows the edit card UI for palette editing.
 * @author Ali Aldaghishy
 */
function showEditCard() {
  document.getElementById('edit-empty-state').classList.add('hidden');
  document.getElementById('edit-container').classList.remove('hidden');
}

/**
 * Updates the status bar message on the Edit Page.
 * @param {string} msg - The status message to display.
 * @author Ali Aldaghishy
 */
function updateStatus(msg) {
  document.getElementById('edit-status-bar').textContent = 'Edit Page - ' + msg;
}

// --- Render Swatches ---
/**
 * Renders the color swatches for the current palette.
 * @author Ali Aldaghishy
 */
function renderSwatches() {
  const container = document.getElementById('edit-swatches-row');
  container.innerHTML = '';

  const reportResults =
    WCAGAnalyzer.analyzePalette(currentPalette).getColorResults();

  let index = 0;
  for (const [color, role] of currentPalette.colorMap) {
    const hexValue = color.getHEX().value;

    // Get the color report associated with the color
    const colorReport = reportResults.find(
      (result) => result.getColor().getHEX().value === color.getHEX().value
    );

    // Determine target color based on bestAgainst
    let targetColor;
    if (!colorReport) {
      console.error('No WCAG report found for color:', color.getHEX().value);
      targetColor = getTextColor(color); // fallback
    } else {
      targetColor =
        colorReport.bestAgainst === 'background'
          ? currentPalette.getBackgroundColor()
          : currentPalette.getTextColor();
    }

    const textHex = targetColor.getHEX().value;

    const swatch = document.createElement('div');
    swatch.className = 'edit-swatch';
    swatch.style.backgroundColor = hexValue;

    const hexLabel = document.createElement('span');
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
    [ColorRole.BACKGROUND]: 'Base background color of the interface',
    [ColorRole.TEXT]: 'Primary text color for readability',
  };

  const entries = [...currentPalette.colorMap.entries()];

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
      select.appendChild(opt);
    });

    if (!role) noneOpt.selected = true;

    select.addEventListener('change', () => {
      const newRole = select.value || null;
      // Update the Map entry
      const allEntries = [...currentPalette.colorMap.entries()];
      const newMap = new Map();
      allEntries.forEach(([c, r], i) => {
        newMap.set(c, i === index ? newRole : r);
      });
      currentPalette.colorMap = newMap;
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
 * @author Ali Aldaghishy
 */
function renderWCAGTable() {
  const tbody = document.getElementById('wcag-table-body');
  tbody.innerHTML = '';

  const warning = document.getElementById('wcag-warning');

  // Find the color assigned to the TEXT role
  let textColor = null;
  for (const [color, role] of currentPalette.colorMap) {
    if (role === ColorRole.TEXT) {
      textColor = color;
      break;
    }
  }

  // Show/hide warning based on whether a text role exists
  if (!textColor) {
    textColor = new Color(0, 0, 0); // default to black
    warning.classList.remove('hidden');
  } else {
    warning.classList.add('hidden');
  }

  const textHex = textColor.getHEX().value.toUpperCase();

  for (const [color, role] of currentPalette.colorMap) {
    // Skip the text color itself — no point testing it against itself
    if (role === ColorRole.TEXT) continue;

    const hexValue = color.getHEX().value.toUpperCase();

    const contrast = WCAGAnalyzer.computePairContrast(color, textColor);
    const label = WCAGAnalyzer.wcagLabel(contrast);
    appendWCAGRow(
      tbody,
      hexValue,
      color.getHEX().value,
      textHex,
      textColor.getHEX().value,
      contrast,
      label
    );
  }
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
    resultDiv.style.visibility = 'visible';
  } else {
    resultDiv.style.visibility = 'hidden';
  }
}

document
  .getElementById('custom-color-input-1')
  .addEventListener('input', computeColorOnColorContrast);
document
  .getElementById('custom-color-input-2')
  .addEventListener('input', computeColorOnColorContrast);

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

/** Auto-assigns roles to colors based on luminance (darkest = TEXT, lightest = BACKGROUND).
 * @author Ali Aldaghishy
 */
document
  .getElementById('auto-assign-roles-btn')
  .addEventListener('click', () => {
    if (!currentPalette) return;

    const entries = [...currentPalette.colorMap.entries()];

    // Sort by luminance
    const sorted = entries
      .map(([color, role], originalIndex) => ({
        color,
        role,
        originalIndex,
        luminance: WCAGAnalyzer.luminance(color.r, color.g, color.b),
      }))
      .sort((a, b) => a.luminance - b.luminance);

    // Assign roles based on luminance
    // Darkest → TEXT, Lightest → BACKGROUND, Middle → PRIMARY, etc.
    const roleOrder = [
      ColorRole.TEXT,
      ColorRole.SECONDARY,
      ColorRole.PRIMARY,
      ColorRole.ACCENT,
      ColorRole.BACKGROUND,
    ];

    const assignments = new Array(entries.length).fill(null);
    sorted.forEach((item, sortedIdx) => {
      if (sortedIdx < roleOrder.length) {
        assignments[item.originalIndex] = roleOrder[sortedIdx];
      }
    });

    const newMap = new Map();
    entries.forEach(([color], i) => {
      newMap.set(color, assignments[i]);
    });
    currentPalette.colorMap = newMap;

    renderSwatches();
    renderRoles();
    renderWCAGTable();
    updateStatus('Roles auto-assigned');
  });

// --- Share ---
document
  .getElementById('share-palette-btn')
  .addEventListener('click', () => share());

// --- Preview Palette ---
document.getElementById('preview-palette-btn').addEventListener('click', () => {
  if (!currentPalette) return;

  const transferData = {
    colorMap: [...currentPalette.colorMap.entries()].map(([c, r]) => [
      {r: c.r, g: c.g, b: c.b},
      r,
    ]),
    isDarkTheme: currentPalette.isDarkTheme,
  };

  localStorage.setItem('myPalette', JSON.stringify(transferData));
  updateStatus('Palette saved for preview');
});
