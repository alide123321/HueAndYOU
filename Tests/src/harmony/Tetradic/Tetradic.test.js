import {Tetradic} from '../../../../src/harmony/Tetradic.js';
import {GenerationSettings} from '../../../../shared/types/GenerationSettings.js';
import {Color} from '../../../../shared/types/Color.js';
import {ColorHarmony, ColorFormat} from '../../../../shared/utils/constants.js';
import {Palette} from '../../../../shared/types/Palette.js';
import {convertColor} from '../../../../shared/utils/colorConversion.js';

const wrapHue360 = (h) => ((h % 360) + 360) % 360;

// Compare hues as a set (order-agnostic) with tolerance
const hueCloseToAny = (h, candidates, tol = 2) =>
  candidates.some((e) => {
    const diff = Math.abs(wrapHue360(h - e));
    const dist = Math.min(diff, 360 - diff);
    return dist <= tol;
  });

describe('Tetradic Harmony Strategy', () => {
  test('buildPalette returns a Palette with expected roles when bg/text enabled', () => {
    const tetradic = new Tetradic();

    const gs = new GenerationSettings({
      harmonyType: ColorHarmony.TETRADIC,
      baseColor: Color.fromRGBString('rgb(161, 34, 196)'),
      includeBgTextColors: true,
      isLightMode: true,
    });

    const palette = tetradic.buildPalette(gs);

    expect(palette).toBeInstanceOf(Palette);
    expect(palette.colorMap).toBeInstanceOf(Map);

    const roles = [...palette.colorMap.values()];
    expect(roles).toContain('primary');
    expect(roles).toContain('secondary');
    expect(roles).toContain('accent');
    expect(roles).toContain('background');
    expect(roles).toContain('text');
  });

  test('buildPalette produces tetradic hue rotations (0°, +90°, +180°, +270°)', () => {
    const tetradic = new Tetradic();

    // Keep this false so we only validate the 4 harmony colors
    const gs = new GenerationSettings({
      harmonyType: ColorHarmony.TETRADIC,
      baseColor: Color.fromRGBString('rgb(161, 34, 196)'),
      includeBgTextColors: false,
      isLightMode: true,
    });

    const palette = tetradic.buildPalette(gs);
    const colors = [...palette.colorMap.keys()];

    // Should be exactly the 4 tetradic colors when bg/text is disabled
    expect(colors.length).toBe(4);

    // Convert base color to OKLCH to get the reference hue
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

    // Convert each generated color back to OKLCH and collect produced hues
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

    // Ensure each expected rotation is represented (order does not matter)
    expectedHues.forEach((eh) => {
      expect(hueCloseToAny(eh, producedHues, 3)).toBe(true);
    });
  });
});