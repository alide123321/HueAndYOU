/**
 * Tetradic Harmony Strategy
 *
 * Implements the Tetradic color harmony strategy using OKLCH.
 * Uses RGB -> OKLCH -> RGB via the shared conversion module.
 *
 * Author: DeAndre Tyree Josey
 * Date: 2/6/2026
 * Module: src/harmony/Tetradic
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

// Safe conversion from OKLCH to RGB with chroma reduction if needed
// Matches the approach used in Analogous/Monochromatic (gamut-safe conversion)
const safeOklchToRgb = (oklch) => {
  const base = {...oklch};
  const originalC = base.c ?? 0;

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

export class Tetradic extends HarmonyStrategy {
  constructor() {
    super();
  }

  // link this strategy with its corresponding type, for registry lookup
  static type = ColorHarmony.TETRADIC;

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

    // Tetradic: 0°, +90°, +180°, +270°
    const tet2 = shiftHue(baseOklch, 90);
    const tet3 = shiftHue(baseOklch, 180);
    const tet4 = shiftHue(baseOklch, 270);

    // Core tetradic palette (OKLCH) — exactly 4 colors
    const paletteOklch = [baseOklch, tet2, tet3, tet4];

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

    // Map OKLCH → RGB and return Color objects (gamut-safe)
    const colors = paletteOklch.map((oklch) => {
      const rgb01 = safeOklchToRgb(oklch);
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
registerHarmony(Tetradic.type, Tetradic);
