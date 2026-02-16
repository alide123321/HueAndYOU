import {Complementary} from '@src/harmony/Complementary.js';
import {GenerationSettings} from '@shared/types/GenerationSettings.js';
import {Color} from '@shared/types/Color.js';

describe('Complementary - Background and Text Colors', () => {
  test('should generate background and text colors correctly', () => {
    const gs = new GenerationSettings({
      baseColor: Color.fromHex('#3366ff'),
      includeBgTextColors: true,
      isLightMode: true,
    });

    const strat = new Complementary();
    const palette = strat.buildPalette(gs);

    const colorsArray = Array.from(palette.colorMap.keys());
    expect(colorsArray.length).toBe(6);
    expect(colorsArray[4]).toBeDefined();
    expect(colorsArray[4]).toBeInstanceOf(Color);
    expect(colorsArray[5]).toBeDefined();
    expect(colorsArray[5]).toBeInstanceOf(Color);

    const bg = colorsArray[4];
    const text = colorsArray[5];
    const bgRGB = bg.getRGB();
    const textRGB = text.getRGB();
    const bgSum = bgRGB.r + bgRGB.g + bgRGB.b;
    const textSum = textRGB.r + textRGB.g + textRGB.b;
    expect(bgSum).not.toBe(textSum);

    const palette2 = strat.buildPalette(gs);
    const colors2 = Array.from(palette2.colorMap.keys());
    expect(colorsArray[4].getRGB()).toEqual(colors2[4].getRGB());
    expect(colorsArray[5].getRGB()).toEqual(colors2[5].getRGB());
  });
});
