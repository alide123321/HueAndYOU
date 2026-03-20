import {
  ColorHarmony,
  FilterType,
  OFFSET_CONFIG,
} from '/shared/utils/constants.js';
import {ColorPicker} from '/paletteModule/colorPicker.js';
import {initializeGenerateButtons} from '/src/generateBtn.js';
import {share} from '/src/shareBtn.js';
import {toggleTheme} from '/src/toggleThemeBtn.js';
import {randomize} from '/src/randomizeBtn.js';
import {generatePalette} from '/src/generateBtn.js';
import {buildPaletteCard} from '/src/paletteCardBuilder.js';
import {initPreviewPanel, openPreviewPanel} from '/src/previewPanel.js';

//set page theme based on localStorage @TODO a little slow may need optimization
if (localStorage.getItem('theme') === FilterType.DARK_MODE) toggleTheme(false);

// Preview panel — tracks whichever palette the user clicked "Preview" on
let _previewPalette = null;
initPreviewPanel(() => _previewPalette);

// Initialize color picker
const baseColorBtn = document.getElementById('base-color');
const colorPicker = new ColorPicker(baseColorBtn, (color) => {
  // Callback when a color is selected in HEX format
  console.log('Selected color:', color);
  baseColorBtn.querySelector('.color-preview').style.backgroundColor = color;
});

// Populate harmony type dropdown
const harmonySelect = document.getElementById('harmony-type');
Object.entries(ColorHarmony).forEach(([key, value]) => {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  harmonySelect.appendChild(option);
});
harmonySelect.value = ColorHarmony.MONOCHROMATIC;

// Fixed swatch counts per harmony type (null = user-adjustable via stepper)
const FIXED_SWATCH_COUNTS = {
  [ColorHarmony.MONOCHROMATIC]: null,
  [ColorHarmony.ANALOGOUS]: 3,
  [ColorHarmony.COMPLEMENTARY]: 4,
  [ColorHarmony.TRIADIC]: 3,
  [ColorHarmony.TETRADIC]: 4,
};

const HARMONIES_WITH_ROTATION_OFFSET = new Set([
  ColorHarmony.TRIADIC,
  ColorHarmony.TETRADIC,
]);

// Harmony-specific offset settings UI
const harmonySettingsContainer = document.getElementById('harmony-settings');

/**
 * Renders the settings UI for a given harmony type.
 * @author Ali Aldaghishy
 * @param {ColorHarmony} harmonyType
 */
function renderHarmonySettings(harmonyType) {
  harmonySettingsContainer.innerHTML = '';

  if (harmonyType === ColorHarmony.ANALOGOUS) {
    const aCfg = OFFSET_CONFIG[ColorHarmony.ANALOGOUS];
    harmonySettingsContainer.innerHTML = `
      <div class="harmony-setting-row">
        <label for="hue-offset">Palette 1 offset</label>
        <input type="range" id="hue-offset" min="${aCfg.min}" max="${aCfg.max}" value="${aCfg.default}" step="1">
        <span class="setting-value" id="hue-offset-val">${aCfg.default}°</span>
      </div>
      <div class="toggle-row">
        <input type="checkbox" id="symmetric-spread" checked>
        <label for="symmetric-spread">Symmetric spread</label>
      </div>
    `;
    document.getElementById('hue-offset').addEventListener('input', (e) => {
      document.getElementById('hue-offset-val').textContent =
        e.target.value + '°';
    });
  } else if (HARMONIES_WITH_ROTATION_OFFSET.has(harmonyType)) {
    const cfg = OFFSET_CONFIG[harmonyType];
    harmonySettingsContainer.innerHTML = `
      <div class="harmony-setting-row">
        <label for="rotation-offset">Palette 1 offset</label>
        <input type="range" id="rotation-offset" min="${cfg.min}" max="${cfg.max}" value="${cfg.default}" step="1">
        <span class="setting-value" id="rotation-offset-val">${cfg.default}°</span>
      </div>
    `;
    document
      .getElementById('rotation-offset')
      .addEventListener('input', (e) => {
        document.getElementById('rotation-offset-val').textContent =
          e.target.value + '°';
      });
  }
  // complementary, monochromatic: no offset settings

  // Update stepper enabled/disabled state
  updateStepperState(harmonyType);
}

/**
 * collectHarmonyOpts reads the current values of any harmony-specific settings inputs
 * and returns them in an object to be sent to the backend.
 *
 * @author Ali Aldaghishy
 * @return {Object} opts - harmony-specific options to include in generation settings
 */
function collectHarmonyOpts() {
  const opts = {};
  const harmonyType = harmonySelect.value;

  if (harmonyType === ColorHarmony.ANALOGOUS) {
    const hueOffset = document.getElementById('hue-offset');
    const symmetric = document.getElementById('symmetric-spread');
    if (hueOffset) opts.hueOffset = parseInt(hueOffset.value, 10);
    if (symmetric) opts.symmetricSpread = symmetric.checked;
  } else if (HARMONIES_WITH_ROTATION_OFFSET.has(harmonyType)) {
    const rotation = document.getElementById('rotation-offset');
    if (rotation) opts.rotationOffset = parseInt(rotation.value, 10);
  }

  return opts;
}

// Stepper functionality — must be declared before renderHarmonySettings is called
const stepperBtns = document.querySelectorAll('.stepper-btn');
const stepperInput = document.getElementById('num-swatches');

/**
 * Updates the state of the stepper based on the selected harmony type.
 * @author Ali Aldaghishy
 * @param {ColorHarmony} harmonyType
 */
function updateStepperState(harmonyType) {
  const fixedCount = FIXED_SWATCH_COUNTS[harmonyType];
  const stepper = document.querySelector('.stepper');

  if (fixedCount !== null && fixedCount !== undefined) {
    // Fixed swatch count — disable stepper
    stepperInput.value = fixedCount;
    stepper.classList.add('stepper-disabled');
    stepperBtns.forEach((btn) => {
      btn.disabled = true;
    });
  } else {
    // Variable swatch count — enable stepper
    stepper.classList.remove('stepper-disabled');
    stepperBtns.forEach((btn) => {
      btn.disabled = false;
    });
    let value = parseInt(stepperInput.value);
    if (isNaN(value) || stepperInput.value === '-') {
      stepperInput.value = 3;
    }
  }
}

stepperBtns.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    // Don't respond if disabled
    if (btn.disabled) return;
    let value = parseInt(stepperInput.value);
    if (isNaN(value)) value = 5;
    if (index === 0) {
      // Decrease
      if (value > 3) stepperInput.value = value - 1;
    } else {
      // Increase
      if (value < 10) stepperInput.value = value + 1;
    }
  });
});

harmonySelect.addEventListener('change', () => {
  renderHarmonySettings(harmonySelect.value);
});

// Render initial settings
renderHarmonySettings(harmonySelect.value);

// Populate Filter Type  dropdown (keeping 'None' option)
const filterTypeSelect = document.getElementById('filter-type');
Object.entries(FilterType).forEach(([key, value]) => {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  filterTypeSelect.appendChild(option);
});

// Initialize the generate buttons with their respective IDs and selectors
initializeGenerateButtons(
  '.generate-btn',
  '.generate-btn',
  'empty-state',
  'palettes-grid'
);

// Add event listeners for buttons
document.querySelectorAll('.generate-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const generationSettings = {
      harmonyType: harmonySelect.value,
      filterType: filterTypeSelect.value,
      baseColor: window
        .getComputedStyle(document.getElementById('selected-color'), null)
        .getPropertyValue('background-color'),
      numberOfColors: parseInt(stepperInput.value, 10) || 5,
      opts: collectHarmonyOpts(),
    };
    const paletteList = await generatePalette(generationSettings);

    const palettesGrid = document.getElementById('palettes-grid');
    const emptyState = document.getElementById('empty-state');

    console.log('Generated palettes:', paletteList);

    // Show palettes grid and hide empty state
    palettesGrid.classList.remove('hidden');
    emptyState.classList.add('hidden');

    // Clear existing palettes
    palettesGrid.innerHTML = '';

    // Create a card for each palette in the list
    paletteList.forEach((palette, paletteIndex) => {
      const card = buildPaletteCard(palette, paletteIndex + 1, () => {
        _previewPalette = palette;
        openPreviewPanel();
      });
      palettesGrid.appendChild(card);
    });

    // Scroll the last card into view
    const lastCard = palettesGrid.lastElementChild;
    if (lastCard) {
      lastCard.scrollIntoView({behavior: 'smooth', block: 'nearest'});
    }
  });
});
document
  .getElementById('gen-theme-toggle')
  .addEventListener('click', () => toggleTheme(true));
document
  .querySelector('.action-btn[aria-label="Share"]')
  .addEventListener('click', () => share());
document
  .querySelector('.action-btn[aria-label="Randomize"]')
  .addEventListener('click', () => randomize(colorPicker));
