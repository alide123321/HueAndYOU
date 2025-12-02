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
 * @todo Implement the actual palette generation logic. | Currently returns basic
 *       Should call generator functions.
 *
 * @param {GenerationSettings} generationSettings
 * @author Ali Aldaghishy
 * @returns
 */
export function generatePalette(generationSettings) {
  let paletteList = [];
  let maps = [new Map(), new Map(), new Map(), new Map()];
  maps[0].set(Color.fromHex('#4A90E2'), ColorRole.PRIMARY);
  maps[0].set(Color.fromHex('#67A3E8'), ColorRole.SECONDARY);
  maps[0].set(Color.fromHex('#85B6ED'), ColorRole.ACCENT);
  maps[0].set(Color.fromHex('#A2C9F3'), ColorRole.BACKGROUND);
  maps[0].set(Color.fromHex('#C0DCF8'), ColorRole.TEXT);

  maps[1].set(Color.fromHex('#E24A90'), ColorRole.PRIMARY);
  maps[1].set(Color.fromHex('#E867A3'), ColorRole.SECONDARY);
  maps[1].set(Color.fromHex('#ED85B6'), ColorRole.ACCENT);
  maps[1].set(Color.fromHex('#F3A2C9'), ColorRole.BACKGROUND);
  maps[1].set(Color.fromHex('#F8C0DC'), ColorRole.TEXT);

  maps[2].set(Color.fromHex('#90E24A'), ColorRole.PRIMARY);
  maps[2].set(Color.fromHex('#A3E867'), ColorRole.SECONDARY);
  maps[2].set(Color.fromHex('#B6ED85'), ColorRole.ACCENT);
  maps[2].set(Color.fromHex('#C9F3A2'), ColorRole.BACKGROUND);
  maps[2].set(Color.fromHex('#DCF8C0'), ColorRole.TEXT);

  maps[3].set(Color.fromHex('#E2904A'), ColorRole.PRIMARY);
  maps[3].set(Color.fromHex('#E8A367'), ColorRole.SECONDARY);
  maps[3].set(Color.fromHex('#EDB685'), ColorRole.ACCENT);
  maps[3].set(Color.fromHex('#F3C9A2'), ColorRole.BACKGROUND);
  maps[3].set(Color.fromHex('#F8DCC0'), ColorRole.TEXT);

  paletteList.push(new Palette(maps[0]));
  paletteList.push(new Palette(maps[1]));
  paletteList.push(new Palette(maps[2]));
  paletteList.push(new Palette(maps[3]));

  return paletteList;
}
