/**
 * Triadic Harmony Strategy
 *
 * Implements the Triadic color harmony strategy using OKLCH.
 * Uses RGB -> OKLCH -> RGB via the shared conversion module.
 *
 * Author: DeAndre Tyree Josey
 * Date: 2/6/2026
 * Module: src/harmony/Triadic
 *
 * CAP-28: Registry lookup refactor (Ian Timchak, 2/15/2026)
 * - Refactored to use HarmonyRegistry for strategy lookup in Generator.applySettings()
 */

import {Palette} from '../../shared/types/Palette.js';
import {Color} from '../../shared/types/Color.js';
import {HarmonyStrategy} from './HarmonyStrategy.js';
import {registerHarmony} from './HarmonyRegistry.js';
import {ColorHarmony} from '../../shared/utils/constants.js';

import {convertColor} from '../../shared/utils/colorConversion.js';
import {ColorFormat} from '../../shared/utils/constants.js';
import {mapColorsToRoles} from '../../shared/utils/paletteUtils.js';

// OKLCH helpers
// OKLCH lightness (l) is in [0,1]
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const wrapHue360 = (h) => ((h % 360) + 360) % 360;

const shiftHue = (colorOklch, deltaH) => {
  return {
    mode: 'oklch',
    l: clamp01(colorOklch.l),
    c: colorOklch.c,
    h: wrapHue360((colorOklch.h ?? 0) + deltaH),
  };
};

export class Triadic extends HarmonyStrategy {
  constructor() {
    super();
  }

  // link this strategy with its corresponding type, for registry lookup
  static type = ColorHarmony.TRIADIC;

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

    const baseOklch = convertColor(baseRgb01, ColorFormat.OKLCH);

    // Triadic: 0°, +120°, +240°
    const triad2 = shiftHue(baseOklch, 120);
    const triad3 = shiftHue(baseOklch, 240);

    // Core triadic palette (OKLCH) — exactly 3 colors
    const paletteOklch = [baseOklch, triad2, triad3];

    // Generate background and text colors if specified
    if (gs.includeBgTextColors) {
      const hue = baseOklch.h;
      const chroma = baseOklch.c;

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
      const rgb01 = convertColor(oklch, ColorFormat.RGB);
      return new Color(
        Math.round(rgb01.r * 255),
        Math.round(rgb01.g * 255),
        Math.round(rgb01.b * 255)
      );
    });

    const colorMap = mapColorsToRoles(colors);

    return new Palette(colorMap);
  }
}

// Register this strategy in the HarmonyRegistry
registerHarmony(Triadic.type, Triadic);
