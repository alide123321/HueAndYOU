import {Complementary} from '../../../../src/harmony/ComplementaryOKLCH.js';
import {GenerationSettings} from '../../../../shared/types/GenerationSettings.js';
import {Color} from '../../../../shared/types/Color.js';

describe('ComplementaryOKLCH', () => {
  test('should add bg/text colors when includeBgTextColors = true', () => {
    const gs = new GenerationSettings({
      baseColor: Color.fromHex('#00ff00'),
      includeBgTextColors: true,
      isLightMode: true,
    });

    const strat = new Complementary();
    const palette = strat.buildPalette(gs);

    // Original palette entries: 4
    // BG + Text: +2
    //console.log(palette.visualize());
    expect(palette.colorMap.length).toBe(6);
  });
});
