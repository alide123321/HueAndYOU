import {FilterType} from '/shared/utils/constants.js';
import {toggleTheme} from '/src/toggleThemeBtn.js';
import {getLibraryPalettes} from '/src/libraryPalettes.js';
import {getTextColor} from '/shared/utils/textColorOverlay.js';
import {WCAGAnalyzer} from '/shared/accessibility/WCAGAnalyzer.js';

export function initLibrary() {
  // set page theme based on localStorage
  if (localStorage.getItem('theme') === FilterType.DARK_MODE)
    toggleTheme(false);

  // Event listener for theme toggle button (guard for absence)
  const toggleBtn = document.querySelector('.icon-btn[title="Toggle theme"]');
  if (toggleBtn) toggleBtn.addEventListener('click', () => toggleTheme());

  const paletteList = getLibraryPalettes();

  // Use the library grid element (this page uses id="library-grid")
  const palettesGrid = document.getElementById('library-grid');
  // There's no `empty-state` element on the library page (only on GenerationPage),
  // so guard access before using it.
  const emptyState = document.getElementById('empty-state');

  console.log('Library palettes:', paletteList);

  // Show palettes grid and hide empty state when present
  if (palettesGrid) palettesGrid.classList.remove('hidden');
  if (emptyState) emptyState.classList.add('hidden');

  // Clear existing palettes (only if the grid exists)
  if (palettesGrid) palettesGrid.innerHTML = '';

  // Create a card for each palette in the list
  paletteList.forEach((palette) => {
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

      //null check
      if (!colorReport) {
        console.error('No WCAG report found for color:', color.getHEX().value);
        continue;
      }

      //bestAgainst has the role
      const targetColor =
        colorReport.bestAgainst === 'background'
          ? palette.getBackgroundColor()
          : palette.getTextColor();

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
      ratioLabel.textContent = `${colorReport.getBestContrast().toFixed(2)}:1`;
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
    const nextIndex = palettesGrid
      ? palettesGrid.querySelectorAll('.palette-card').length + 1
      : 1;
    label.textContent = `Palette ${nextIndex}`;
    info.appendChild(label);

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

    // Append to grid if available
    if (palettesGrid) palettesGrid.appendChild(card);
  });

  // Scroll the last card into view
  const lastCard = palettesGrid ? palettesGrid.lastElementChild : null;
  if (lastCard) {
    lastCard.scrollIntoView({behavior: 'smooth', block: 'nearest'});
  }
}

export default initLibrary;
