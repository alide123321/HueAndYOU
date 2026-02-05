import {Monochromatic} from '../../../../src/harmony/Monochromatic.js';
import {GenerationSettings} from '../../../../shared/types/GenerationSettings.js';
import {ColorHarmony} from '../../../../shared/utils/constants.js';
import {Color} from '../../../../shared/types/Color.js';
import {Palette} from '../../../../shared/types/Palette.js';

describe('Monochromatic Harmony Strategy', () => {
  test('buildPalette returns a Palette instance with colors', () => {
    const strategy = new Monochromatic();

    const gs = new GenerationSettings({
      harmonyType: ColorHarmony.MONOCHROMATIC,
      baseColor: Color.fromRGBString('rgb(170, 51, 204)'),
      includeBgTextColors: true,
      isLightMode: true,
    });

    const palette = strategy.buildPalette(gs);

    // Basic expectations
    expect(palette).toBeInstanceOf(Palette);
    expect(palette.colorMap).toBeDefined();
    expect(palette.colorMap.size).toBeGreaterThan(0);
  });
});