import {Complementary} from '../../../../src/harmony/ComplementaryHSL.js';
import {GenerationSettings} from '../../../../shared/types/GenerationSettings.js';
import {Color} from '../../../../shared/types/Color.js';
import {rgbToHsl} from '../../../../shared/utils/tempColorConversion.js';

describe('ComplementaryHSL', () => {
  test('should create dark-mode bg as near-black (HSL)', () => {
    const gs = new GenerationSettings({
      baseColor: Color.fromHex('#3366ff'),
      includeBgTextColors: true,
      isLightMode: false,
    });

    const strat = new Complementary();
    const palette = strat.buildPalette(gs);

    const bg = palette.getBackgroundColor();
    const bgHsl = rgbToHsl({...bg.getRGB(), mode: 'rgb'});

    expect(bgHsl.l).toBeLessThan(0.15);
  });
});
