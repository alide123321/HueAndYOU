/**
 * Monochromatic Harmony Strategy
 * 
 * Implements the monochromatic color harmony strategy for the palette generator.
 * Generates a palette by keeping the same hue and varying lightness and/or saturation.
 * 
 * Author: DeAndre Tyree Josey
 * Date: 2/5/2026
 * Module: src/harmony/Monochromatic
 */

/*
This file calculates a palette using transformations within the HSL color space.
Accepts generation settings that include a single RGB base color.
*/

/*
This file calculates a palette using transformations within the HSL color space.
Accepts generation settings that include a single RGB base color.
*/

// Concrete Monochromatic Harmony Strategy
import {GenerationSettings} from '../../shared/types/GenerationSettings.js';
import {Palette} from '../../shared/types/Palette.js';
import {Color} from '../../shared/types/Color.js';
import {HarmonyStrategy} from './HarmonyStrategy.js';

// temporary HSL conversion code
import {rgbToHsl, hslToRgb} from '../../shared/utils/tempColorConversion.js';
import {ColorRole} from '../../shared/utils/constants.js';

// lighten and darken helpers for HSL
// HSL l is in [0,1]
const lighten = (colorHsl, amount) => {
  return {
    ...colorHsl,
    l: Math.min(colorHsl.l + amount, 1),
  };
};

const darken = (colorHsl, amount) => {
  return {
    ...colorHsl,
    l: Math.max(colorHsl.l - amount, 0),
  };
};

/**
 * Monochromatic.js
 * Implements the Monochromatic color harmony strategy using HSL.
 * @author DeAndre Josey
 * @module src/harmony/Monochromatic
 * @extends HarmonyStrategy
 */
export class Monochromatic extends HarmonyStrategy {
  /**
   * constructor
   * Constructor for Monochromatic harmony strategy.
   * @author DeAndre Josey
   * @constructor
   * @param {GenerationSettings} gs - The generation settings.
   */
  constructor() {
    super();
  }

  /**
   * buildPalette(gs: GenerationSettings): Palette
   * Generates a monochromatic color palette based on the provided generation settings.
   * Uses RGB -> HSL -> RGB via the shared conversion module.
   * Keeps hue the same and varies lightness.
   * @author DeAndre Josey
   * @param {GenerationSettings} gs - The generation settings.
   * @returns {Palette} The generated monochromatic color palette.
   */
  buildPalette(gs) {
    const baseColorRgb = {
      ...gs.baseColor.getRGB(),
      mode: 'rgb',
    };

    // Convert base color to HSL
    const baseColorHsl = rgbToHsl(baseColorRgb);

    // Create monochromatic variants by changing lightness only (same hue)
    const lightHsl = lighten(baseColorHsl, 0.18);
    const darkHsl = darken(baseColorHsl, 0.18);
    const darkerHsl = darken(baseColorHsl, 0.32);

    // Core palette (4 colors like Complementary)
    const paletteHsl = [
      baseColorHsl,
      lightHsl,
      darkHsl,
      darkerHsl,
    ];

    // Generate background and text colors if specified
    if (gs.includeBgTextColors) {
      const hue = baseColorHsl.h;
      const subtleSaturation = baseColorHsl.s * 1;

      if (gs.isLightMode) {
        const bgHsl = {mode: 'hsl', h: hue, s: subtleSaturation, l: 0.95};
        const textHsl = {mode: 'hsl', h: hue, s: subtleSaturation, l: 0.05};
        paletteHsl.push(bgHsl, textHsl);
      } else {
        const bgHsl = {mode: 'hsl', h: hue, s: subtleSaturation, l: 0.05};
        const textHsl = {mode: 'hsl', h: hue, s: subtleSaturation, l: 0.95};
        paletteHsl.push(bgHsl, textHsl);
      }
    }

    // Map HSL → RGB and return Color objects
    const colors = paletteHsl.map((hsl) => {
      const rgb = hslToRgb(hsl);
      return new Color(rgb.r, rgb.g, rgb.b);
    });

    // Map color objects into [Color, Role] pairs
    const colorsWithRoles = [];
    colors.forEach((color, index) => {
      colorsWithRoles.push([color, null]);

      // Assign roles based on position
      switch (index) {
        case 0:
          colorsWithRoles[index][1] = ColorRole.PRIMARY;
          break;
        case 1:
          colorsWithRoles[index][1] = ColorRole.SECONDARY;
          break;
        case 2:
          colorsWithRoles[index][1] = ColorRole.ACCENT;
          break;
        case 4:
          colorsWithRoles[index][1] = ColorRole.BACKGROUND;
          break;
        case 5:
          colorsWithRoles[index][1] = ColorRole.TEXT;
          break;
      }
    });

    const colorMap = new Map(colorsWithRoles);
    return new Palette(colorMap);
  }
}