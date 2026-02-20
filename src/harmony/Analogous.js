/**
 * Analogous Harmony Strategy
 *
 * Implements the Analogous color harmony strategy using OKLCH.
 * Uses RGB -> OKLCH -> RGB via the shared conversion module.
 *
 * Author: Ian Timchak
 * Date: 2/6/2026
 * Module: src/harmony/Analogous
 */

/*
This file calculates a palette using transformations within the OKLCH color space.
Accepts generation settings that include a single RGB base color and hue offsets under gs.opts.
*/

// Concrete Analogous Harmony Strategy
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

// Shift hue helper with wrapping (360 to 0, and vice versa)
const wrapHue360 = (h) => ((h % 360) + 360) % 360;

// shiftHue helper provided by DeAndre Josey in (CAP-24)
const shiftHue = (colorOklch, deltaH) => {
  return {
    mode: 'oklch',
    l: clamp01(colorOklch.l),
    c: colorOklch.c,
    h: wrapHue360((colorOklch.h ?? 0) + deltaH),
  };
};

// Safe conversion from OKLCH to RGB with chroma reduction if needed
// Provided by DeAndre Josey in (CAP-23)
// Instead of fixed chroma reduction, we use a binary search to find the maximum chroma that can be converted to RGB.
const safeOklchToRgb = (oklch) => {
  const base = {...oklch};
  const originalC = base.c;

  // If it's already convertible, return immediately (no desaturation)
  try {
    return convertColor(base, ColorFormat.RGB);
  } catch (e) {
    // fall through to search
  }

  let lo = 0;
  let hi = originalC;
  let bestRgb = null;

  // 20 iterations is usually plenty for stable results
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    const attempt = {...base, c: mid};

    try {
      bestRgb = convertColor(attempt, ColorFormat.RGB);
      lo = mid; // succeeded: try higher chroma
    } catch (e) {
      hi = mid; // failed: reduce chroma
    }
  }

  // If everything failed, fall back to grayscale
  return bestRgb ?? convertColor({...base, c: 0}, ColorFormat.RGB);
};

/**
 * Analogous.js
 * Implements the Analogous color harmony strategy using OKLCH.
 * @author Ian Timchak
 * @module src/harmony/Analogous
 * @extends HarmonyStrategy
 */
export class Analogous extends HarmonyStrategy {
  /**
   * constructor
   * Constructor for Analogous harmony strategy.
   * @author Ian Timchak
   * @constructor
   * @param {GenerationSettings} gs - The generation settings.
   */
  constructor() {
    super();
  }

  // link this strategy with its corresponding type, for registry lookup
  static type = ColorHarmony.ANALOGOUS;

  /**
   * buildPalette(gs: GenerationSettings): Palette
   * Generates an analogous color palette based on the provided generation settings.
   * Uses RGB -> OKLCH -> RGB via the shared conversion module.
   * Varies hue while keeping lightness and chroma constant.
   * @author Ian Timchak
   * @param {GenerationSettings} gs - The generation settings.
   * @returns {Palette} The generated analogous color palette.
   */
  buildPalette(gs) {
    const baseColorRgb = {
      ...gs.baseColor.getRGB(),
      mode: 'rgb',
    };

    const offset = gs.opts.hueOffset || 45; // default to 45 degrees if not specified

    // Convert base color to OKLCH (culori uses RGB values in [0, 1])
    const baseRgb01 = {
      mode: 'rgb',
      r: baseColorRgb.r / 255,
      g: baseColorRgb.g / 255,
      b: baseColorRgb.b / 255,
    };

    // An important note here is the OKLCH color space contains the entire RGB gamut,
    // so when converting from RGB to OKLCH, we will always get a valid OKLCH representation.
    const baseColorOklch = convertColor(baseRgb01, ColorFormat.OKLCH);

    // Generate analogous colors by shifting hue
    const rightOffset = shiftHue(baseColorOklch, offset);
    const leftOffset = shiftHue(baseColorOklch, -offset);
    const paletteOklch = [baseColorOklch, rightOffset, leftOffset];

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
      const rgb01 = safeOklchToRgb(oklch);
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
        case 3:
          colorsWithRoles[index][1] = ColorRole.BACKGROUND;
          break;
        case 4:
          colorsWithRoles[index][1] = ColorRole.TEXT;
          break;
      }
    });

    const colorMap = new Map(colorsWithRoles);
    return new Palette(colorMap);
  }
}

// Register this strategy in the HarmonyRegistry
registerHarmony(Analogous.type, Analogous);
