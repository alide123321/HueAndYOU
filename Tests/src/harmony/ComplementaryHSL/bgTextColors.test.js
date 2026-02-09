import {Complementary} from '../../../../src/harmony/ComplementaryHSL.js';
import {GenerationSettings} from '../../../../shared/types/GenerationSettings.js';
import {Color} from '../../../../shared/types/Color.js';

describe('ComplementaryHSL', () => {
  test('should add bg/text colors when includeBgTextColors = true', () => {
    const gs = new GenerationSettings({
      baseColor: Color.fromHex('#526aec'),
      includeBgTextColors: true,
      isLightMode: true,
    });

    const strat = new Complementary();
    const palette = strat.buildPalette(gs);

    // Base + complement + two dark variants = 4
    // BG + Text = +2
    console.log(palette.visualize());
    expect(palette.colorMap.size).toBe(6);
  });
});
