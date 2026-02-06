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

import {Palette} from '../../shared/types/Palette.js';
import {Color} from '../../shared/types/Color.js';
import {HarmonyStrategy} from './HarmonyStrategy.js';

import {convertColor} from '../../shared/utils/colorConversion.js';
import {ColorFormat, ColorRole} from '../../shared/utils/constants.js';

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

const fitToRgbGamut = (oklch) => {
  // Try converting. If out-of-gamut, reduce chroma gradually until it works.
  let c = oklch.c ?? 0;

  for (let i = 0; i < 40; i++) {
    try {
      return convertColor(
        {mode: 'oklch', l: clamp01(oklch.l), c, h: oklch.h},
        ColorFormat.RGB
        
      );
    } catch (err) {
      // If conversion fails, reduce chroma and retry
      c *= 0.85;

      // Safety: if chroma gets extremely small, just treat it as gray
      if (c < 1e-6) {
        c = 0;
      }
    }
  }

  // If we STILL can't fit, force grayscale (c=0) as last resort
  return convertColor({mode: 'oklch', l: clamp01(oklch.l), c: 0, h: oklch.h}, ColorFormat.RGB);
};

export class Triadic extends HarmonyStrategy {
  constructor() {
    super();
  }

  buildPalette(gs) {
    // base RGB in [0..255]
    const base = gs.baseColor.getRGB();

    // culori expects RGB in [0..1]
    const baseRgb01 = {
      mode: 'rgb',
      r: base.r / 255,
      g: base.g / 255,
      b: base.b / 255,
    };

    const baseOklch = convertColor(baseRgb01, ColorFormat.OKLCH);

    // Triadic: 0°, +120°, +240°
    const triad2 = shiftHue(baseOklch, 120);
    const triad3 = shiftHue(baseOklch, 240);

    // We'll also include a 4th "support" color like your other palettes:
    // a slightly lighter base (keeps hue, changes lightness)
    const support = {
      mode: 'oklch',
      l: clamp01(baseOklch.l + 0.12),
      c: baseOklch.c,
      h: baseOklch.h,
    };

    const paletteOklch = [baseOklch, triad2, triad3, support];

    // Optional bg/text
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

    // Convert OKLCH -> RGB -> Color objects
    const colors = paletteOklch.map((oklch) => {
  const rgb01 = fitToRgbGamut(oklch); // <-- key change
  return new Color(
    Math.round(rgb01.r * 255),
    Math.round(rgb01.g * 255),
    Math.round(rgb01.b * 255)
  );
});

    // Roles (match your app expectations)
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
        case 4:
          colorsWithRoles[index][1] = ColorRole.BACKGROUND;
          break;
        case 5:
          colorsWithRoles[index][1] = ColorRole.TEXT;
          break;
      }
    });

    return new Palette(new Map(colorsWithRoles));
  }
}