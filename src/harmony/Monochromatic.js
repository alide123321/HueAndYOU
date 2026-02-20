/**
 * Monochromatic Harmony Strategy
 *
 * Implements the Monochromatic color harmony strategy using OKLCH.
 * Uses RGB -> OKLCH -> RGB via the shared conversion module.
 *
 * Author: DeAndre Tyree Josey
 * Date: 2/5/2026
 * Module: src/harmony/Monochromatic
 *
 * CAP-28: Registry lookup refactor (Ian Timchak, 2/15/2026)
 * - Refactored to use HarmonyRegistry for strategy lookup in Generator.applySettings()
 * - also re-formatted file since it was not consistently formatted with the rest of the codebase
 */

/*
This file calculates a palette using transformations within the OKLCH color space.
Accepts generation settings that include a single RGB base color.
*/

// Concrete Monochromatic Harmony Strategy
import {Palette} from '../../shared/types/Palette.js';
import {Color} from '../../shared/types/Color.js';
import {HarmonyStrategy} from './HarmonyStrategy.js';
import {registerHarmony} from './HarmonyRegistry.js';
import {ColorHarmony} from '../../shared/utils/constants.js';

// OKLCH conversion utilities (culori wrapper)
import {convertColor} from '../../shared/utils/colorConversion.js';
import {ColorFormat, ColorRole} from '../../shared/utils/constants.js';

// OKLCH helpers
// OKLCH lightness (l) is in [0,1]
const clamp01 = (x) => Math.min(1, Math.max(0, x));

const shiftLightness = (colorOklch, deltaL) => {
  return {
    mode: 'oklch',
    l: clamp01(colorOklch.l + deltaL),
    c: colorOklch.c,
    h: colorOklch.h,
  };
};

const safeOklchToRgb01 = (oklch) => {
  let attempt = {...oklch};

  for (let i = 0; i < 12; i++) {
    try {
      return convertColor(attempt, ColorFormat.RGB);
    } catch (e) {
      attempt = {...attempt, c: attempt.c * 0.85};
    }
  }

  return convertColor({...attempt, c: 0}, ColorFormat.RGB);
};

/**
 * Monochromatic.js
 * Implements the Monochromatic color harmony strategy using OKLCH.
 * @author DeAndre Josey, Ian Timchak
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

  // link this strategy with its corresponding type, for registry lookup
  static type = ColorHarmony.MONOCHROMATIC;

  /**
   * buildPalette(gs: GenerationSettings): Palette
   * Generates a monochromatic color palette based on the provided generation settings.
   * Uses RGB -> OKLCH -> RGB via the shared conversion module.
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

    // Convert base color to OKLCH (culori uses RGB values in [0, 1])
    const baseRgb01 = {
      mode: 'rgb',
      r: baseColorRgb.r / 255,
      g: baseColorRgb.g / 255,
      b: baseColorRgb.b / 255,
    };

    const baseColorOklch = convertColor(baseRgb01, ColorFormat.OKLCH);

    // Create monochromatic variants by changing lightness only (same hue)
    const lightOklch = shiftLightness(baseColorOklch, 0.18);
    const darkOklch = shiftLightness(baseColorOklch, -0.18);
    const darkerOklch = shiftLightness(baseColorOklch, -0.32);

    // Core monochromatic palette (OKLCH)
    const paletteOklch = [baseColorOklch, lightOklch, darkOklch, darkerOklch];

    // Generate background and text colors if specified
    if (gs.includeBgTextColors) {
      const hue = baseColorOklch.h;
      const chroma = baseColorOklch.c;

      if (gs.isLightMode) {
        paletteOklch.push(
          {mode: 'oklch', l: 0.95, c: chroma, h: hue}, // background
          {mode: 'oklch', l: 0.05, c: chroma, h: hue} // text
        );
      } else {
        paletteOklch.push(
          {mode: 'oklch', l: 0.05, c: chroma, h: hue}, // background
          {mode: 'oklch', l: 0.95, c: chroma, h: hue} // text
        );
      }
    }

    // Map OKLCH → RGB and return Color objects
    const colors = paletteOklch.map((oklch) => {
      const rgb01 = safeOklchToRgb01(oklch);
      // r,g,b in [0,1]

      return new Color(
        Math.round(rgb01.r * 255),
        Math.round(rgb01.g * 255),
        Math.round(rgb01.b * 255)
      );
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

// Register this strategy in the HarmonyRegistry
registerHarmony(Monochromatic.type, Monochromatic);
