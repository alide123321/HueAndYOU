import {Complementary} from '@src/harmony/Complementary.js';
import {GenerationSettings} from '@shared/types/GenerationSettings.js';
import {Color} from '@shared/types/Color.js';
import {rgbToOklch} from '@shared/utils/tempColorConversion.js';

describe('Complementary - Light Mode Background', () => {
  test('should generate light-mode background correctly', () => {
    const gs = new GenerationSettings({
      baseColor: Color.fromHex('#ff0000'),
      includeBgTextColors: true,
      isLightMode: true,
    });

    const strat = new Complementary();
    const palette = strat.buildPalette(gs);

    const colorsArray = Array.from(palette.colorMap.keys());
    const bg = colorsArray[4];
    const bgOK = rgbToOklch({...bg.getRGB(), mode: 'rgb'});
    expect(bgOK.l).toBeGreaterThan(0.9);
    expect(bgOK.c).toBeLessThan(0.1);

    const base = Color.fromHex('#ff0000');
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
        isLightMode: true,
      });
      const palette = strat.buildPalette(gs);
      const colors = Array.from(palette.colorMap.keys());
      const bg = colors[4];
      const bgOK = rgbToOklch({...bg.getRGB(), mode: 'rgb'});
      expect(bgOK.l).toBeGreaterThan(0.9);
      expect(bgOK.c).toBeLessThan(0.1);
    });

    const base2 = Color.fromHex('#ff9900');
    const lightGs = new GenerationSettings({
      baseColor: base2,
      includeBgTextColors: true,
      isLightMode: true,
    });
    const darkGs = new GenerationSettings({
      baseColor: base2,
      includeBgTextColors: true,
      isLightMode: false,
    });
    const lightPalette = strat.buildPalette(lightGs);
    const darkPalette = strat.buildPalette(darkGs);
    const lightColors = Array.from(lightPalette.colorMap.keys());
    const darkColors = Array.from(darkPalette.colorMap.keys());
    const lightBg = lightColors[4];
    const darkBg = darkColors[4];
    const lightOK = rgbToOklch({...lightBg.getRGB(), mode: 'rgb'});
    const darkOK = rgbToOklch({...darkBg.getRGB(), mode: 'rgb'});
    expect(lightOK.l).toBeGreaterThan(darkOK.l);
  });
});
