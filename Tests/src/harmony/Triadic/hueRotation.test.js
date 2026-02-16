import {Triadic} from '../../../../src/harmony/Triadic.js';
import {GenerationSettings} from '../../../../shared/types/GenerationSettings.js';
import {Color} from '../../../../shared/types/Color.js';
import {ColorHarmony, ColorFormat} from '../../../../shared/utils/constants.js';
import {convertColor} from '../../../../shared/utils/colorConversion.js';

const wrapHue360 = (h) => ((h % 360) + 360) % 360;

const hueDiff = (a, b) => {
  const d = Math.abs(wrapHue360(a) - wrapHue360(b));
  return Math.min(d, 360 - d);
};

test('triadic hues are ~120° and ~240° from base (tolerant)', () => {
  const triadic = new Triadic();

  const gs = new GenerationSettings({
    harmonyType: ColorHarmony.TRIADIC,
    baseColor: Color.fromRGBString('rgb(161, 34, 196)'),
    includeBgTextColors: false,
    isLightMode: true,
  });

  const palette = triadic.buildPalette(gs);

  const colors = Array.from(palette.colorMap.keys());
  const base = colors[0];
  const triad2 = colors[1];
  const triad3 = colors[2];

  const baseRgb = base.getRGB();
  const t2Rgb = triad2.getRGB();
  const t3Rgb = triad3.getRGB();

  const baseO = convertColor(
    {mode: 'rgb', r: baseRgb.r / 255, g: baseRgb.g / 255, b: baseRgb.b / 255},
    ColorFormat.OKLCH
  );
  const t2O = convertColor(
    {mode: 'rgb', r: t2Rgb.r / 255, g: t2Rgb.g / 255, b: t2Rgb.b / 255},
    ColorFormat.OKLCH
  );
  const t3O = convertColor(
    {mode: 'rgb', r: t3Rgb.r / 255, g: t3Rgb.g / 255, b: t3Rgb.b / 255},
    ColorFormat.OKLCH
  );

  const expected120 = wrapHue360((baseO.h ?? 0) + 120);
  const expected240 = wrapHue360((baseO.h ?? 0) + 240);

  const TOL = 15;
  expect(hueDiff(t2O.h ?? 0, expected120)).toBeLessThanOrEqual(TOL);
  expect(hueDiff(t3O.h ?? 0, expected240)).toBeLessThanOrEqual(TOL);
});