import {GenerationSettings} from '../shared/types/GenerationSettings.js';
import {Color} from '../shared/types/Color.js';
import {ColorFormat, ColorHarmony} from '../shared/utils/constants.js';
import {convertColor} from '../shared/utils/colorConversion.js';
import {Generator} from '../runtime-src/lib/Generator.js';

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

/**
 * Generate palettes in-browser so static hosting (GitHub Pages) works without a Node API.
 *
 * @param {GenerationSettings} generationSettings
 * @author Ian Timchak, Ali Aldaghishy
 * @returns {Promise<import('../shared/types/Palette.js').Palette[]>}
 */
export async function generatePalette(generationSettings) {
  const generator = new Generator();
  const baseColor = Color.fromRGBString(generationSettings.baseColor);

  const rgb = baseColor.getRGB();
  const oklch = convertColor(
    {mode: 'rgb', r: rgb.r / 255, g: rgb.g / 255, b: rgb.b / 255},
    ColorFormat.OKLCH
  );
  const chroma = oklch.c ?? 0;
  const numberOfPalettes = chroma >= 0.1 ? 8 : chroma >= 0.04 ? 6 : 4;

  const gs = new GenerationSettings({
    harmonyType: generationSettings.harmonyType || ColorHarmony.MONOCHROMATIC,
    baseColor,
    includeBgTextColors: true,
    isLightMode: true,
    numberOfPalettes,
    numberOfColors: Number(generationSettings.numberOfColors) || 5,
    opts: generationSettings.opts || {},
  });

  generator.applySettings(gs);
  return generator.generate();
}
