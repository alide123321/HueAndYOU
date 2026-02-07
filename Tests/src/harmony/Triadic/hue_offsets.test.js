import {Triadic} from '../../../../src/harmony/Triadic.js';
import {GenerationSettings} from '../../../../shared/types/GenerationSettings.js';
import {Color} from '../../../../shared/types/Color.js';
import {ColorHarmony} from '../../../../shared/utils/constants.js';
import {convertColor} from '../../../../shared/utils/colorConversion.js';
import {ColorFormat} from '../../../../shared/utils/constants.js';

const wrapHue360 = (h) => ((h % 360) + 360) % 360;

const hueDiff = (a, b) => {
  const d = Math.abs(wrapHue360(a) - wrapHue360(b));
  return Math.min(d, 360 - d);
};

const toOklch = (color) => {
  const {r, g, b} = color.getRGB();
  return convertColor(
    {mode: 'rgb', r: r / 255, g: g / 255, b: b / 255},
    ColorFormat.OKLCH
  );
};

test('triadic hues are ~120° and ~240° from base (tolerant)', () => {
  const triadic = new Triadic();

  const gs = new GenerationSettings({
    harmonyType: ColorHarmony.TRIADIC,
    baseColor: Color.fromRGBString('rgb(161, 34, 196)'),
    includeBgTextColors: false, // keep it simple for hue math
    isLightMode: true,
  });

  const palette = triadic.buildPalette(gs);

  // Map preserves insertion order: [primary, secondary, accent]
  const colors = Array.from(palette.colorMap.keys());
  const base = colors[0];
  const triad2 = colors[1];
  const triad3 = colors[2];

  const baseO = toOklch(base);
  const t2O = toOklch(triad2);
  const t3O = toOklch(triad3);

  const expected120 = wrapHue360((baseO.h ?? 0) + 120);
  const expected240 = wrapHue360((baseO.h ?? 0) + 240);

  // Gamut fitting can shift hue a bit, so allow wiggle room
  const TOL = 15;

  expect(hueDiff(t2O.h ?? 0, expected120)).toBeLessThanOrEqual(TOL);
  expect(hueDiff(t3O.h ?? 0, expected240)).toBeLessThanOrEqual(TOL);
});