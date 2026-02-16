import {Tetradic} from '@src/harmony/Tetradic.js';
import {GenerationSettings} from '@shared/types/GenerationSettings.js';
import {Color} from '@shared/types/Color.js';
import {ColorHarmony, ColorFormat} from '@shared/utils/constants.js';
import {convertColor} from '@shared/utils/colorConversion.js';

const wrapHue360 = (h) => ((h % 360) + 360) % 360;

const hueCloseToAny = (h, candidates, tol = 2) =>
  candidates.some((e) => {
    const diff = Math.abs(wrapHue360(h - e));
    const dist = Math.min(diff, 360 - diff);
    return dist <= tol;
  });

describe('Tetradic Harmony Strategy – hue rotation', () => {
  test('produces 0°, +90°, +180°, +270° hue rotations', () => {
    const strategy = new Tetradic();

    const gs = new GenerationSettings({
      harmonyType: ColorHarmony.TETRADIC,
      baseColor: Color.fromHex('#a122c4'),
      includeBgTextColors: false,
      isLightMode: true,
    });

    const palette = strategy.buildPalette(gs);
    const colors = [...palette.colorMap.keys()];

    expect(colors.length).toBe(4);

    const baseRgb = gs.baseColor.getRGB();
    const baseRgb01 = {
      mode: 'rgb',
      r: baseRgb.r / 255,
      g: baseRgb.g / 255,
      b: baseRgb.b / 255,
    };

    const baseOklch = convertColor(baseRgb01, ColorFormat.OKLCH);

    const expectedHues = [
      wrapHue360(baseOklch.h ?? 0),
      wrapHue360((baseOklch.h ?? 0) + 90),
      wrapHue360((baseOklch.h ?? 0) + 180),
      wrapHue360((baseOklch.h ?? 0) + 270),
    ];

    const producedHues = colors.map((c) => {
      const rgb = c.getRGB();
      const rgb01 = {
        mode: 'rgb',
        r: rgb.r / 255,
        g: rgb.g / 255,
        b: rgb.b / 255,
      };
      const oklch = convertColor(rgb01, ColorFormat.OKLCH);
      return wrapHue360(oklch.h ?? 0);
    });

    expectedHues.forEach((eh) => {
      expect(hueCloseToAny(eh, producedHues, 3)).toBe(true);
    });
  });
});