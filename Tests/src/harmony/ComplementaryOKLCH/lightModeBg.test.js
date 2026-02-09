import {Complementary} from '../../../../src/harmony/ComplementaryOKLCH.js';
import {GenerationSettings} from '../../../../shared/types/GenerationSettings.js';
import {Color} from '../../../../shared/types/Color.js';
import {rgbToOklch} from '../../../../shared/utils/tempColorConversion.js';

describe('ComplementaryOKLCH', () => {
  test('should create light-mode bg as near-white', () => {
    const gs = new GenerationSettings({
      baseColor: Color.fromHex('#00ff00'),
      includeBgTextColors: true,
      isLightMode: true,
    });

    const strat = new Complementary();
    const palette = strat.buildPalette(gs);

    const bg = palette.colorMap[4]; // 4th index == bg

    const bgOK = rgbToOklch({...bg.getRGB(), mode: 'rgb'});

    //console.log(palette.visualize());
    expect(bgOK.l).toBeGreaterThan(0.9); // near-white
    expect(bgOK.c).toBeLessThan(0.1); // low chroma tint
  });
});
