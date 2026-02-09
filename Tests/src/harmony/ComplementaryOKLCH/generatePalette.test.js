import {Complementary} from '../../../../src/harmony/ComplementaryOKLCH.js';
import {GenerationSettings} from '../../../../shared/types/GenerationSettings.js';
import {Color} from '../../../../shared/types/Color.js';
import {Palette} from '../../../../shared/types/Palette.js';

describe('ComplementaryOKLCH', () => {
  test('should generate a Palette instance', () => {
    const gs = new GenerationSettings({
      baseColor: Color.fromHex('#00ff00'), // blue
      includeBgTextColors: false,
    });

    const strat = new Complementary();
    const palette = strat.buildPalette(gs);

    expect(palette).toBeInstanceOf(Palette);
    expect(Array.isArray(palette.colorMap)).toBe(true);
    //Uncomment the console.log sections to generate an html block that can view the results
    //console.log(palette.visualize());
  });
});
