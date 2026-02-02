import {Complementary} from '../../../../src/harmony/ComplementaryHSL.js';
import {GenerationSettings} from '../../../../shared/types/GenerationSettings.js';
import {Color} from '../../../../shared/types/Color.js';
import {Palette} from '../../../../shared/types/Palette.js';

describe('ComplementaryHSL', () => {
  test('should generate a Palette instance', () => {
    const gs = new GenerationSettings({
      baseColor: Color.fromHex('#00ff00'),
      includeBgTextColors: false,
    });

    const strat = new Complementary();
    const palette = strat.buildPalette(gs);

    expect(palette).toBeInstanceOf(Palette);
    expect(Array.isArray(palette.colorMap)).toBe(true);
  });
});
