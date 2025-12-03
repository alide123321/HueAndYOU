import {
  ColorHarmony,
  FilterType,
  ColorFormat,
} from '/shared/utils/constants.js';
import {ColorPicker} from '/paletteModule/colorPicker.js';
import {initializeGenerateButtons} from '/src/generateBtn.js';
import {share} from '/src/shareBtn.js';
import {toggleTheme} from '/src/toggleThemeBtn.js';
import {randomize} from '/src/randomizeBtn.js';
import {generatePalette} from '/src/generateBtn.js';
import {getTextColor} from '/shared/utils/textColorOverlay.js';
import {WCAGAnalyzer} from '/shared/accessibility/WCAGAnalyzer.js';

//set page theme based on localStorage @TODO a little slow may need optimization
if (localStorage.getItem('theme') === FilterType.DARK_MODE) toggleTheme(false);

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
      // Create palette card
      const card = document.createElement('div');
      card.className = 'palette-card';

      // Palette colors - extract from the palette's colorMap
      const colorsContainer = document.createElement('div');
      colorsContainer.className = 'palette-colors';

      const reportResults =
        WCAGAnalyzer.analyzePalette(palette).getColorResults();

      // Iterate through the colorMap to get all colors
      for (const [color, role] of palette.colorMap) {
        const colorDiv = document.createElement('div');
        colorDiv.className = 'palette-color';
        colorDiv.style.backgroundColor = color.getHEX().value;

        // Grouping for top and bottom labels
        const topGroup = document.createElement('div');
        topGroup.className = 'palette-top-group';
        const bottomGroup = document.createElement('div');
        bottomGroup.className = 'palette-bottom-group';
        colorDiv.appendChild(topGroup);
        colorDiv.appendChild(bottomGroup);

        // Apply report data
        //get the color report associated with the color
        const colorReport = reportResults.find(
          (result) => result.getColor().getHEX().value === color.getHEX().value
        );
        //bestAgainst has the role
        const targetColor =
          colorReport.bestAgainst === 'background'
            ? palette.getBackgroundColor()
            : palette.getTextColor();

        //Example of 'fail' badge appearing:
        //#364fd4

        //add color value label
        const valueLabel = document.createElement('span');
        valueLabel.className = 'color-bold-label';
        valueLabel.textContent = color.getHEX().value.toUpperCase();
        valueLabel.style.color = targetColor.getHEX().value;
        topGroup.appendChild(valueLabel);

        //add role on top of color swatch
        const roleLabel = document.createElement('span');
        roleLabel.className = 'color-normal-label';
        roleLabel.textContent = role != null ? role.toUpperCase() : '';
        roleLabel.style.color = targetColor.getHEX().value;
        topGroup.appendChild(roleLabel);

        //add WCAG label
        const contrastLabel = document.createElement('span');
        contrastLabel.className = 'color-normal-label';
        contrastLabel.textContent = `WCAG ${colorReport.getLabel()}`;
        contrastLabel.style.color = targetColor.getHEX().value;
        bottomGroup.appendChild(contrastLabel);

        //add contrast ratio
        const ratioLabel = document.createElement('span');
        ratioLabel.className = 'color-normal-label';
        ratioLabel.textContent = `${colorReport
          .getBestContrast()
          .toFixed(2)}:1`;
        ratioLabel.style.color = targetColor.getHEX().value;
        bottomGroup.appendChild(ratioLabel);

        colorsContainer.appendChild(colorDiv);
      }
      card.appendChild(colorsContainer);

      // Palette info and actions
      const info = document.createElement('div');
      info.className = 'palette-info';

      const label = document.createElement('span');
      label.className = 'palette-label';
      const nextIndex =
        palettesGrid.querySelectorAll('.palette-card').length + 1;
      label.textContent = `Palette ${nextIndex}`;
      info.appendChild(label);

      // Ian: It may be more preferable to use HTML templates for the cards rather than creating elements via JS
      const actions = document.createElement('div');
      actions.className = 'palette-actions';
      ['Export', 'Preview', 'Edit'].forEach((text) => {
        const btn = document.createElement('button');
        btn.className = 'text-btn';
        btn.textContent = text;
        actions.appendChild(btn);
      });
      info.appendChild(actions);

      card.appendChild(info);

      // Append to grid
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
  .querySelector('.icon-btn[aria-label="Toggle theme"]')
  .addEventListener('click', () => toggleTheme(true));
document
  .querySelector('.icon-btn[aria-label="Share"]')
  .addEventListener('click', () => share());
document
  .querySelector('.icon-btn[aria-label="Randomize"]')
  .addEventListener('click', () => randomize(colorPicker));
