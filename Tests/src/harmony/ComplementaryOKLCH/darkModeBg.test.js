import {Complementary} from '../../../../src/harmony/ComplementaryOKLCH.js';
import {GenerationSettings} from '../../../../shared/types/GenerationSettings.js';
import {Color} from '../../../../shared/types/Color.js';
import {rgbToOklch} from '../../../../shared/utils/tempColorConversion.js';

describe('ComplementaryOKLCH - Dark Mode Background', () => {
  test('should generate dark-mode background correctly', () => {
    const gs = new GenerationSettings({
      baseColor: Color.fromHex('#3366ff'),
      includeBgTextColors: true,
      isLightMode: false,
    });

    const strat = new Complementary();
    const palette = strat.buildPalette(gs);

    const colorsArray = Array.from(palette.colorMap.keys());
    const bg = colorsArray[4];
    const bgOK = rgbToOklch({...bg.getRGB(), mode: 'rgb'});
    expect(bgOK.l).toBeLessThan(0.15);
    expect(bgOK.c).toBeLessThan(0.1);

    const base = Color.fromHex('#3366ff');
    const baseOK = rgbToOklch({...base.getRGB(), mode: 'rgb'});
    const hueDiff = Math.abs(bgOK.h - baseOK.h);
    expect(hueDiff).toBeLessThan(20);

    const rgb = bg.getRGB();
    expect(rgb.r).toBeGreaterThanOrEqual(0);
    expect(rgb.r).toBeLessThanOrEqual(255);
    expect(rgb.g).toBeGreaterThanOrEqual(0);
    expect(rgb.g).toBeLessThanOrEqual(255);
    expect(rgb.b).toBeGreaterThanOrEqual(0);
    expect(rgb.b).toBeLessThanOrEqual(255);

    const baseColors = ['#ff3333', '#33ff33', '#3333ff', '#ffff33'];
    baseColors.forEach((hexColor) => {
      const gs = new GenerationSettings({
        baseColor: Color.fromHex(hexColor),
        includeBgTextColors: true,
        isLightMode: false,
      });
      const palette = strat.buildPalette(gs);
      const colors = Array.from(palette.colorMap.keys());
      const bg = colors[4];
      const bgOK = rgbToOklch({...bg.getRGB(), mode: 'rgb'});
      expect(bgOK.l).toBeLessThan(0.15);
      expect(bgOK.c).toBeLessThan(0.1);
    });
  });
});
