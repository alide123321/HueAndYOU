/**
 * Triadic Harmony Strategy
 *
 * Implements the Triadic color harmony strategy using OKLCH.
 * Uses RGB -> OKLCH -> RGB via the shared conversion module.
 *
 * Author: DeAndre Tyree Josey
 * Date: 2/6/2026
 * Module: src/harmony/Triadic
 */

import { Palette } from '../../shared/types/Palette.js';
import { Color } from '../../shared/types/Color.js';
import { HarmonyStrategy } from './HarmonyStrategy.js';

import { convertColor } from '../../shared/utils/colorConversion.js';
import { ColorFormat, ColorRole } from '../../shared/utils/constants.js';

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

// Matches Monochromatic’s approach: try converting, reduce chroma, fallback to grayscale if need be
const safeOklchToRgb01 = (oklch) => {
  let attempt = { ...oklch };

  for (let i = 0; i < 12; i++) {
    try {
      return convertColor(attempt, ColorFormat.RGB);
    } catch (e) {
      attempt = { ...attempt, c: attempt.c * 0.85 };
    }
  }

  return convertColor({ ...attempt, c: 0 }, ColorFormat.RGB);
};


export class Triadic extends HarmonyStrategy {
  constructor() {
    super();
  }

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
          { mode: 'oklch', l: 0.95, c: chroma, h: hue }, // background
          { mode: 'oklch', l: 0.05, c: chroma, h: hue }  // text
        );
      } else {
        paletteOklch.push(
          { mode: 'oklch', l: 0.05, c: chroma, h: hue }, // background
          { mode: 'oklch', l: 0.95, c: chroma, h: hue }  // text
        );
      }
    }

    // Map OKLCH → RGB and return Color objects
    const colors = paletteOklch.map((oklch) => {
      const rgb01 = safeOklchToRgb01(oklch);
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

    return new Palette(new Map(colorsWithRoles));
  }
}