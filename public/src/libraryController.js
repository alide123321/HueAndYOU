import {FilterType} from '/shared/utils/constants.js';
import {toggleTheme} from '/src/toggleThemeBtn.js';
import {getLibraryPalettes} from '/src/libraryPalettes.js';
import {getTextColor} from '/shared/utils/textColorOverlay.js';
import {exportPalette} from '/src/exportBtn.js';

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

    // Iterate through the colorMap to get all colors
    for (const [color, role] of palette.colorMap.entries()) {
      const colorDiv = document.createElement('div');
      colorDiv.className = 'palette-color';
      colorDiv.style.backgroundColor = color.getHEX().value;

      // add text on top of color swatch
      const colorLabel = document.createElement('span');
      colorLabel.className = 'color-label';
      colorLabel.textContent = role;
      colorLabel.style.color = getTextColor(color).value;
      colorDiv.appendChild(colorLabel);

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

      // EXPORT HANDLER
      if (text === 'Export') {
        btn.addEventListener('click', (event) => {
          exportPalette(event, palette);
        });
      }

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
