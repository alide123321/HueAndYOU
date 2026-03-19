import {ColorHarmony, FilterType} from '/shared/utils/constants.js';
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

// Stepper functionality
const stepperBtns = document.querySelectorAll('.stepper-btn');
const stepperInput = document.getElementById('num-swatches');

stepperBtns.forEach((btn, index) => {
  btn.addEventListener('click', () => {
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

// Add event listeners for buttons
document.querySelectorAll('.generate-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const generationSettings = {
      harmonyType: harmonySelect.value,
      filterType: filterTypeSelect.value,
      baseColor: window
        .getComputedStyle(document.getElementById('selected-color'), null)
        .getPropertyValue('background-color'),
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
