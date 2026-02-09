import {Complementary} from '../../../../src/harmony/ComplementaryHSL.js';
import {GenerationSettings} from '../../../../shared/types/GenerationSettings.js';
import {Color} from '../../../../shared/types/Color.js';
import {rgbToHsl} from '../../../../shared/utils/tempColorConversion.js';

describe('ComplementaryHSL', () => {
  test('should generate complementary colors correctly (HSL hue)', () => {
    const base = Color.fromHex('#00ff00');

    const gs = new GenerationSettings({
      baseColor: base,
      includeBgTextColors: false,
    });

    const strat = new Complementary();
    const palette = strat.buildPalette(gs);

    const baseHsl = rgbToHsl({...base.getRGB(), mode: 'rgb'});

    const complement = palette.colorMap[1];
    const complementHsl = rgbToHsl({...complement.getRGB(), mode: 'rgb'});

    const expectedHue = (baseHsl.h + 180) % 360;
    const diff = Math.abs(complementHsl.h - expectedHue);

    expect(diff).toBeLessThan(0.5); // small floating point error tolerance
  });
});
