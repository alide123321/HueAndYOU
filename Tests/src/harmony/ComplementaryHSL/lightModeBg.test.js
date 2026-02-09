import {Complementary} from '../../../../src/harmony/ComplementaryHSL.js';
import {GenerationSettings} from '../../../../shared/types/GenerationSettings.js';
import {Color} from '../../../../shared/types/Color.js';
import {rgbToHsl} from '../../../../shared/utils/tempColorConversion.js';

describe('ComplementaryHSL', () => {
  test('should create light-mode bg as near-white (HSL)', () => {
    const gs = new GenerationSettings({
      baseColor: Color.fromHex('#00ff00'),
      includeBgTextColors: true,
      isLightMode: true,
    });

    const strat = new Complementary();
    const palette = strat.buildPalette(gs);

    const bg = palette.colorMap[4]; // bg index
    const bgHsl = rgbToHsl({...bg.getRGB(), mode: 'rgb'});

    // In HSL:
    //   near-white → lightness close to 1
    expect(bgHsl.l).toBeGreaterThan(0.9);
  });
});
