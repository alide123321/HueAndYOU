import {GenerationSettings} from '../../shared/types/GenerationSettings.js';
import {getHarmony} from '../harmony/HarmonyRegistry.js';
import {convertColor} from '../../shared/utils/colorConversion.js';
import {
  ColorFormat,
  ColorHarmony,
  OFFSET_CONFIG,
} from '../../shared/utils/constants.js';
import {Color} from '../../shared/types/Color.js';

// Imports necessary for registry side-effects
import {Complementary} from '../harmony/Complementary.js';
import {Monochromatic} from '../harmony/Monochromatic.js';
import {Triadic} from '../harmony/Triadic.js';
import {Analogous} from '../harmony/Analogous.js';
import {Tetradic} from '../harmony/Tetradic.js';

/**
 * Compute N evenly-spaced offsets across [min, max], centered within each subdivision.
 * @author Ali Aldaghishy
 * @param {number} count - number of offsets to compute
 * @param {number} min - minimum offset angle
 * @param {number} max - maximum offset angle
 * @returns {number[]} array of offset angles
 * */
function computeDivergedOffsets(count, min, max) {
  if (count <= 0) return [];
  const offsets = [];
  const step = (max - min) / count;
  for (let offsetIndex = 0; offsetIndex < count; offsetIndex++) {
    offsets.push(Math.round(min + step * (offsetIndex + 0.5)));
  }
  return offsets;
}

/**
 * Returns [deltaL, chromaScale] for palette index i out of total N.
 * Palettes 0–1 keep the original base color. Remaining palettes sweep
 * from dark/saturated (deltaL=-0.25, scale=1.2) to light/pastel (deltaL=+0.25, scale=0.35).
 *
 * @author Ali Aldaghishy
 * @param {number} i - current palette index (0-based)
 * @param {number} total - total number of palettes being generated
 * @returns {[number, number]} deltaL and chromaScale to apply to the base color
 */
function computeLCVariation(i, total) {
  if (i <= 1) return [0, 1.0];

  const variedCount = total - 2;
  const offsetIndex = i - 2;
  const t = variedCount === 1 ? 0.5 : offsetIndex / (variedCount - 1);

  const deltaL = -0.25 + t * 0.5;
  const chromaScale = 1.2 - t * 0.85;

  return [deltaL, chromaScale];
}

/**
 * @author Ian Timchak, Ali Aldaghishy
 */
export class Generator {
  constructor() {
    this.generationSettings = null;
    this.selectedStrategy = null;
  }

  /**
   * @author Ian Timchak, Ali Aldaghishy, DeAndre Josey
   * @param {GenerationSettings} settings
   */
  applySettings(settings) {
    this.generationSettings = settings;
    this.selectedStrategy = getHarmony(settings.harmonyType);
  }

  generate() {
    if (!this.selectedStrategy) {
      throw new Error(
        'No generation strategy selected. Please apply settings first.'
      );
    }

    const numberOfPalettes = this.generationSettings.numberOfPalettes || 1;
    const originalBaseColor = this.generationSettings.baseColor;
    const originalOpts = {...this.generationSettings.opts};
    const harmonyType = this.generationSettings.harmonyType;

    const offsetCfg = OFFSET_CONFIG[harmonyType];
    const divergedCount = Math.max(0, numberOfPalettes - 1);
    const divergedOffsets = offsetCfg
      ? computeDivergedOffsets(divergedCount, offsetCfg.min, offsetCfg.max)
      : [];

    const rgb = originalBaseColor.getRGB();
    const baseOklch = convertColor(
      {mode: 'rgb', r: rgb.r / 255, g: rgb.g / 255, b: rgb.b / 255},
      ColorFormat.OKLCH
    );

    const palettes = [];

    // try to generate palettes with varied base colors and harmony options
    try {
      for (let i = 0; i < numberOfPalettes; i++) {
        const [deltaL, chromaScale] = computeLCVariation(i, numberOfPalettes);

        const variedL = Math.min(
          0.85, // clamp lightness to 0.25–0.85 to avoid too-dark/too-light colors while keeping palettes visibly distinct
          Math.max(0.25, baseOklch.l + deltaL)
        );
        const variedC = Math.min(
          0.3, // clamp chroma to 0.02–0.3 to keep saturation in a perceptually useful, mostly in-gamut range
          Math.max(0.02, baseOklch.c * chromaScale)
        );
        const variedOklch = {
          mode: 'oklch',
          l: variedL,
          c: variedC,
          h: baseOklch.h,
        };

        let variedRgb;
        try {
          variedRgb = convertColor(variedOklch, ColorFormat.RGB);
        } catch {
          // Out of gamut — fall back to achromatic
          variedRgb = convertColor({...variedOklch, c: 0}, ColorFormat.RGB);
        }

        this.generationSettings.baseColor = new Color(
          Math.round(Math.min(255, Math.max(0, variedRgb.r * 255))),
          Math.round(Math.min(255, Math.max(0, variedRgb.g * 255))),
          Math.round(Math.min(255, Math.max(0, variedRgb.b * 255)))
        );

        // Palette 0 keeps original opts; palettes 1–N get diverged offset angles
        // paletteIndex is always passed so strategies can vary non-primary swatches
        if (offsetCfg && i > 0 && i - 1 < divergedOffsets.length) {
          this.generationSettings.opts = {
            ...originalOpts,
            paletteIndex: i,
            [offsetCfg.key]: divergedOffsets[i - 1],
          };
        } else {
          this.generationSettings.opts = {...originalOpts, paletteIndex: i};
        }

        const palette = this.selectedStrategy.buildPalette(
          this.generationSettings
        );
        palette.varied = deltaL !== 0 || chromaScale !== 1.0;
        palettes.push(palette);
      }
    } finally {
      // Restore original base color and opts to avoid side effects on other generations
      this.generationSettings.baseColor = originalBaseColor;
      this.generationSettings.opts = originalOpts;
    }

    return palettes;
  }
}
