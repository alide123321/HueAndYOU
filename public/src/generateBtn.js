import {Palette} from '/shared/types/Palette.js';
import {GenerationSettings} from '/shared/types/GenerationSettings.js';
import {ColorRole} from '/shared/utils/constants.js';
import {Color} from '/shared/types/Color.js';

// Function to toggle between empty state and palette grid
export function toggleView(emptyStateId, palettesGridId) {
  const emptyState = document.getElementById(emptyStateId);
  const palettesGrid = document.getElementById(palettesGridId);

  emptyState.classList.toggle('hidden');
  palettesGrid.classList.toggle('hidden');
}

// Initialize event listeners for the generate buttons
export function initializeGenerateButtons(
  primaryBtnSelector,
  generateBtnSelector,
  emptyStateId,
  palettesGridId
) {
  const primaryBtn = document.querySelector(primaryBtnSelector);
  const generateBtn = document.querySelector(generateBtnSelector);

  if (primaryBtn) {
    primaryBtn.addEventListener('click', () =>
      toggleView(emptyStateId, palettesGridId)
    );
  }

  if (generateBtn) {
    generateBtn.addEventListener('click', () =>
      toggleView(emptyStateId, palettesGridId)
    );
  }
}

/** Generate a color palette based on the provided generation settings.
 *
 * @todo Fetches generate api from server and returns list of Palette objects.
 *
 * @param {GenerationSettings} generationSettings
 * @author Ian Timchak, Ali Aldaghishy
 * @returns List of Palette Objects
 */
export async function generatePalette(generationSettings) {
  const paletteList = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(generationSettings),
  })
    .then((response) => response.json())
    .then((data) => {
      //rehydrate the palette objects
      const paletteList = data.map((p) => {
        const palette = new Palette(
          p.colorMap,
          p.isDarkTheme,
          p.varied ?? false
        );
        palette.rehydrateColorMap();
        return palette;
      });

      return paletteList;
    });

  return paletteList;
}
