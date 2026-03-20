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
 *
 * This file calculates a palette using transformations within the OKLCH color space.
 * Accepts generation settings that include a single RGB base color.
 *
 * @author DeAndre Tyree Josey, Ali Aldaghishy
 * @module src/harmony/Monochromatic
 */

import {Palette} from '../../shared/types/Palette.js';
import {Color} from '../../shared/types/Color.js';
import {HarmonyStrategy} from './HarmonyStrategy.js';
import {registerHarmony} from './HarmonyRegistry.js';
import {ColorHarmony} from '../../shared/utils/constants.js';
import {convertColor} from '../../shared/utils/colorConversion.js';
import {ColorFormat} from '../../shared/utils/constants.js';
import {mapColorsToRoles} from '../../shared/utils/paletteUtils.js';

const clamp01 = (x) => Math.min(1, Math.max(0, x));

const shiftLightness = (colorOklch, deltaL) => ({
  mode: 'oklch',
  l: clamp01(colorOklch.l + deltaL),
  c: colorOklch.c,
  h: colorOklch.h,
});

/** Reduces chroma iteratively until the color fits in sRGB gamut. */
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
 *
 *
 * @author DeAndre Josey, Ian Timchak, Ali Aldaghishy
 * @extends HarmonyStrategy
 */
export class Monochromatic extends HarmonyStrategy {
  constructor() {
    super();
  }

  static type = ColorHarmony.MONOCHROMATIC;

  /**
   * @param {GenerationSettings} gs
   * @returns {Palette}
   */
  buildPalette(gs) {
    const baseColorRgb = {...gs.baseColor.getRGB(), mode: 'rgb'};
    const baseRgb01 = {
      mode: 'rgb',
      r: baseColorRgb.r / 255,
      g: baseColorRgb.g / 255,
      b: baseColorRgb.b / 255,
    };
    const baseColorOklch = convertColor(baseRgb01, ColorFormat.OKLCH);

    // N evenly-spaced lightness variants across [-0.4, +0.4], base color first
    const numSwatches = gs.numberOfColors || 4;
    const paletteOklch = [baseColorOklch];

    if (numSwatches > 1) {
      const count = numSwatches - 1;
      for (let j = 0; j < count; j++) {
        const t = (j + 1) / (count + 1); // (0, 1) exclusive — evenly spaces variants while skipping endpoints to avoid duplicating the base color
        const delta = -0.4 + t * 0.8;
        paletteOklch.push(shiftLightness(baseColorOklch, delta));
      }
    }

    if (gs.includeBgTextColors) {
      const hue = baseColorOklch.h;
      const chroma = baseColorOklch.c;
      if (gs.isLightMode) {
        paletteOklch.push(
          {mode: 'oklch', l: 0.95, c: chroma, h: hue},
          {mode: 'oklch', l: 0.05, c: chroma, h: hue}
        );
      } else {
        paletteOklch.push(
          {mode: 'oklch', l: 0.05, c: chroma, h: hue},
          {mode: 'oklch', l: 0.95, c: chroma, h: hue}
        );
      }
    }

    const colors = paletteOklch.map((oklch) => {
      const rgb01 = safeOklchToRgb01(oklch);
      return new Color(
        Math.round(rgb01.r * 255),
        Math.round(rgb01.g * 255),
        Math.round(rgb01.b * 255)
      );
    });

    const colorMap = mapColorsToRoles(colors, gs.includeBgTextColors);
    return new Palette(colorMap);
  }
}

registerHarmony(Monochromatic.type, Monochromatic);
