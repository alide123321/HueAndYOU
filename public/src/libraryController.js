import {FilterType} from '/shared/utils/constants.js';
import {toggleTheme} from '/src/toggleThemeBtn.js';
import {getLibraryPalettes} from '/src/libraryPalettes.js';
import {buildPaletteCard} from '/src/paletteCardBuilder.js';

export function initLibrary() {
  // set page theme based on localStorage
  if (localStorage.getItem('theme') === FilterType.DARK_MODE)
    toggleTheme(false);

  // Event listener for theme toggle button
  document.getElementById('lib-theme-toggle')
    .addEventListener('click', () => toggleTheme());

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
  paletteList.forEach((palette, paletteIndex) => {
    const card = buildPaletteCard(palette, paletteIndex + 1);
    if (palettesGrid) palettesGrid.appendChild(card);
  });

  // Scroll the last card into view
  const lastCard = palettesGrid ? palettesGrid.lastElementChild : null;
  if (lastCard) {
    lastCard.scrollIntoView({behavior: 'smooth', block: 'nearest'});
  }
}

export default initLibrary;
