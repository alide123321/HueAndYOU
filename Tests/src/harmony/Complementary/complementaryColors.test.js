import {Complementary} from '@src/harmony/Complementary.js';
import {GenerationSettings} from '@shared/types/GenerationSettings.js';
import {Color} from '@shared/types/Color.js';
import {rgbToOklch} from '@shared/utils/tempColorConversion.js';

describe('Complementary - Complementary Color Generation', () => {
  test('should generate complementary colors correctly', () => {
    const baseColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#3366ff'];

    baseColors.forEach((hexColor) => {
      const base = Color.fromHex(hexColor);
      const gs = new GenerationSettings({
        baseColor: base,
        includeBgTextColors: false,
      });

      const strat = new Complementary();
      const palette = strat.buildPalette(gs);

      const colorsArray = Array.from(palette.colorMap.keys());
      const baseOK = rgbToOklch({...base.getRGB(), mode: 'rgb'});
      const complement = colorsArray[1];
      const complementOK = rgbToOklch({...complement.getRGB(), mode: 'rgb'});

      const expectedHue = (baseOK.h + 180) % 360;
      const diff = Math.abs(complementOK.h - expectedHue);

      expect(diff).toBeLessThan(1);
      expect(complementOK.h).toBeGreaterThanOrEqual(0);
      expect(complementOK.h).toBeLessThanOrEqual(360);
      expect(colorsArray.length).toBeGreaterThanOrEqual(4);
      expect(colorsArray[0]).toBeDefined();
      expect(colorsArray[1]).toBeDefined();
    });
  });
});
