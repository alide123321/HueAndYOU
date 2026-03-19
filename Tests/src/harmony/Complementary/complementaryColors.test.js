import {Complementary} from '@src/harmony/Complementary.js';
import {GenerationSettings} from '@shared/types/GenerationSettings.js';
import {Color} from '@shared/types/Color.js';
import {convertColor} from '@shared/utils/colorConversion.js';
import {ColorFormat} from '@shared/utils/constants.js';

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
      const baseRGB = base.getRGB();
      const baseOK = convertColor(
        {
          r: baseRGB.r / 255,
          g: baseRGB.g / 255,
          b: baseRGB.b / 255,
          mode: 'rgb',
        },
        ColorFormat.OKLCH
      );
      const complement = colorsArray[1];
      const complementRGB = complement.getRGB();
      const complementOK = convertColor(
        {
          r: complementRGB.r / 255,
          g: complementRGB.g / 255,
          b: complementRGB.b / 255,
          mode: 'rgb',
        },
        ColorFormat.OKLCH
      );

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
