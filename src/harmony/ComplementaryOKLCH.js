//Concrete Complementary Harmony Strategy
import {GenerationSettings} from '../../shared/types/GenerationSettings.js';
import {Palette} from '../../shared/types/Palette.js';
import {Color} from '../../shared/types/Color.js';
import {HarmonyStrategy} from './HarmonyStrategy.js';
import {convertColor} from '../../shared/utils/colorConversion.js';
import {ColorFormat, ColorRole} from '../../shared/utils/constants.js';
import {mapColorsToRoles} from '../../shared/utils/paletteUtils.js';
import {registerHarmony} from './HarmonyRegistry.js';
import {ColorHarmony} from '../../shared/utils/constants.js';

/**
 * Adjusts a color - lightens if base is dark, darkens if base is light
 * This ensures visible contrast regardless of the base color's lightness
 * @author Ali Aldaghishy
 * @param {object} colorOK - The OKLCH color to adjust
 * @param {number} amount - The adjustment amount
 * @return {object} The adjusted OKLCH color
 */
const adjustColor = (colorOK, amount) => {
  if (colorOK.l < 0.4) {
    const newL = Math.min(1, colorOK.l + amount);

    return {
      ...colorOK,
      l: newL,
      c: colorOK.c * 0.8, // Reduce chroma slightly to stay in gamut of RGB
      mode: ColorFormat.OKLCH,
    };
  }

  const newL = Math.max(0, colorOK.l - amount);
  const chromaReduction = amount / colorOK.l;
  const newC = colorOK.c * (1 - chromaReduction * 0.5); // Reduce chroma by half the proportion

  return {
    ...colorOK,
    l: newL,
    c: Math.max(0, newC),
    mode: ColorFormat.OKLCH,
  };
};

/**
 * ComplementaryOKLCH.js
 * Implements the Complementary color harmony strategy.
 * 02-15-2026: Added registry connection (Ian) for lookup by type in Generator.applySettings()
 * @author Ian Timchak, Ali Aldaghishy
 * @module src/harmony/ComplementaryOKLCH
 * @extends HarmonyStrategy
 */
export class Complementary extends HarmonyStrategy {
  constructor() {
    super();
  }

  // link this strategy with its corresponding type, for registry lookup
  static type = ColorHarmony.COMPLEMENTARY;

  /**
   * Generates a complementary color palette based on the provided generation settings.
   * @author Ian Timchak, Ali Aldaghishy
   * @param {GenerationSettings} gs - The generation settings.
   * @returns {Palette} The generated complementary color palette.
   */
  buildPalette(gs) {
    // Normalize RGB from 0-255 to 0-1 range for culori
    const GsRgb = gs.baseColor.getRGB();
    const rgb = {
      r: GsRgb.r / 255,
      g: GsRgb.g / 255,
      b: GsRgb.b / 255,
    };

    const baseColorOK = convertColor(rgb, ColorFormat.OKLCH);

    // calculate complementary color in okLCH
    // Don't clamp - just rotate the hue
    const complementaryOK = {
      ...baseColorOK,
      h: (baseColorOK.h + 180) % 360,
    };

    const baseAdjustedOK = adjustColor(baseColorOK, 0.2);
    const complementaryAdjustedOK = adjustColor(complementaryOK, 0.2);

    // Background + Text colors use the BASE hue.
    // Light mode â†’ near-white background + near-black text
    // Dark mode â†’ near-black background + near-white text
    const hue = baseColorOK.h;
    const chroma = baseColorOK.c * 0.05; // small chroma keeps the tint extremely subtle but present

    let bgOK, textOK;
    if (gs.isLightMode) {
      // Light background (very slightly tinted)
      bgOK = {
        l: 0.98,
        c: chroma,
        h: hue,
        mode: ColorFormat.OKLCH,
      };

      // Text color (dark, slightly tinted)
      textOK = {
        l: 0.1,
        c: chroma,
        h: hue,
        mode: ColorFormat.OKLCH,
      };
    } else {
      // Dark background (deep, subtle tint)
      bgOK = {
        l: 0.08,
        c: chroma,
        h: hue,
        mode: ColorFormat.OKLCH,
      };

      // Light text color (near-white)
      textOK = {
        l: 0.95,
        c: chroma,
        h: hue,
        mode: ColorFormat.OKLCH,
      };
    }

    // Always generate 6 colors: primary, secondary, adjusted variants, background, text
    const paletteOK = [
      baseColorOK,
      complementaryOK,
      baseAdjustedOK,
      complementaryAdjustedOK,
      bgOK,
      textOK,
    ];

    //Map to rgb and return Color object
    const colors = paletteOK.map((ok) => {
      const rgb = convertColor(ok, ColorFormat.RGB);
      // Convert from 0-1 range to 0-255 range for Color constructor
      return new Color(
        Math.round(rgb.r * 255),
        Math.round(rgb.g * 255),
        Math.round(rgb.b * 255)
      );
    });

    const colorMap = mapColorsToRoles(colors);

    return new Palette(colorMap);
  }
}

// Register this strategy in the HarmonyRegistry
registerHarmony(Complementary.type, Complementary);
