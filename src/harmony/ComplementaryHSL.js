/*
This file calculates a palette using transformations within the HSL color space.
Accepts generation settings that include a single RGB base color.
*/

// Concrete Complementary Harmony Strategy
import {GenerationSettings} from '../../shared/types/GenerationSettings.js';
import {Palette} from '../../shared/types/Palette.js';
import {Color} from '../../shared/types/Color.js';
import {HarmonyStrategy} from './HarmonyStrategy.js';

// temporary HSL conversion code
// (from your tempColorConversionHsl.js module)
import {rgbToHsl, hslToRgb} from '../../shared/utils/tempColorConversion.js';

// lighten and darken helpers for HSL
// HSL l is in [0,1]
const darken = (colorHsl, amount) => {
  return {
    ...colorHsl,
    l: Math.max(colorHsl.l - amount, 0),
  };
};

/**
 * Complementary.js
 * Implements the Complementary color harmony strategy using HSL.
 * @author Ian Timchak
 * @module src/harmony/Complementary
 * @extends HarmonyStrategy
 */
export class Complementary extends HarmonyStrategy {
  /**
   * constructor
   * Constructor for Complementary harmony strategy.
   * @author Ian Timchak
   * @constructor
   * @param {GenerationSettings} gs - The generation settings.
   */
  constructor() {
    super();
  }

  /**
   * buildPalette(gs: GenerationSettings): Palette
   * Generates a complementary color palette based on the provided generation settings.
   * Uses RGB -> HSL -> RGB via the shared conversion module.
   * @author Ian Timchak
   * @param {GenerationSettings} gs - The generation settings.
   * @returns {Palette} The generated complementary color palette.
   */
  buildPalette(gs) {
    const baseColorRgb = {
      ...gs.baseColor.getRGB(),
      mode: 'rgb',
    }; // { r:..., g:..., b:..., mode:'rgb' }

    // Convert base color to HSL
    // { h:..., s:..., l:..., mode:'hsl' }
    const baseColorHsl = rgbToHsl(baseColorRgb);

    // Calculate complementary color in HSL
    const complementaryHsl = {
      ...baseColorHsl,
      h: (baseColorHsl.h + 180) % 360,
    };

    // Dark variants (20% darker)
    const baseDarkHsl = darken(baseColorHsl, 0.2);
    const complementaryDarkHsl = darken(complementaryHsl, 0.2);

    const paletteHsl = [
      baseColorHsl,
      complementaryHsl,
      baseDarkHsl,
      complementaryDarkHsl,
    ];

    // Generate background and text colors if specified
    if (gs.includeBgTextColors) {
      // Background + Text colors use the BASE hue.
      // Light mode → near-white background + near-black text
      // Dark mode → near-black background + near-white text

      const hue = baseColorHsl.h;
      const subtleSaturation = baseColorHsl.s * 1;
      // small saturation keeps the tint extremely subtle but present

      if (gs.isLightMode) {
        // Light background (very slightly tinted)
        const bgHsl = {
          mode: 'hsl',
          h: hue,
          s: subtleSaturation,
          l: 0.98, // near-white
        };

        // Text color (dark, slightly tinted)
        const textHsl = {
          mode: 'hsl',
          h: hue,
          s: subtleSaturation,
          l: 0.1, // near-black
        };

        paletteHsl.push(bgHsl, textHsl);
      } else {
        // Dark background (deep, subtle tint)
        const bgHsl = {
          mode: 'hsl',
          h: hue,
          s: subtleSaturation,
          l: 0.08, // near-black
        };

        // Light text color (near-white)
        const textHsl = {
          mode: 'hsl',
          h: hue,
          s: subtleSaturation,
          l: 0.95, // near-white
        };

        paletteHsl.push(bgHsl, textHsl);
      }
    }

    // Map HSL → RGB and return Color objects
    const colors = paletteHsl.map((hsl) => {
      const rgb = hslToRgb(hsl); // { r,g,b,mode:'rgb' } with 0–255
      return new Color(rgb.r, rgb.g, rgb.b);
    });

    // console.log(colors);

    // //map color objects in a Color, Role mapping
    // //JSON cant send map objects apparently, so convert to array of arrays
    // let colorsWithRoles = [];
    // colors.forEach((color, index) => {
    //   colorsWithRoles.push([color, null]); // null role by default
    // });

    return new Palette(colors);
  }
}
