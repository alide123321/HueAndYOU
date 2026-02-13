import {Complementary} from '../../../../src/harmony/ComplementaryOKLCH.js';
import {GenerationSettings} from '../../../../shared/types/GenerationSettings.js';
import {Color} from '../../../../shared/types/Color.js';
import {Palette} from '../../../../shared/types/Palette.js';

describe('ComplementaryOKLCH - Palette Generation', () => {
  test('should generate valid palette with correct structure', () => {
    const gs = new GenerationSettings({
      baseColor: Color.fromHex('#ff5500'),
      includeBgTextColors: false,
    });

    const strat = new Complementary();
    const palette = strat.buildPalette(gs);

    expect(palette).toBeInstanceOf(Palette);
    expect(palette.colorMap instanceof Map).toBe(true);
    const colorsArray = Array.from(palette.colorMap.keys());
    expect(colorsArray.length).toBe(6);
    colorsArray.forEach((color) => {
      expect(color).toBeInstanceOf(Color);
      const rgb = color.getRGB();
      expect(rgb.r).toBeGreaterThanOrEqual(0);
      expect(rgb.r).toBeLessThanOrEqual(255);
      expect(rgb.g).toBeGreaterThanOrEqual(0);
      expect(rgb.g).toBeLessThanOrEqual(255);
      expect(rgb.b).toBeGreaterThanOrEqual(0);
      expect(rgb.b).toBeLessThanOrEqual(255);
      const hexObj = color.getHEX();
      expect(typeof hexObj.value).toBe('string');
      expect(hexObj.value).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    const baseColors = [
      '#ff0000',
      '#00ff00',
      '#0000ff',
      '#ffff00',
      '#ff00ff',
      '#00ffff',
    ];
    baseColors.forEach((hexColor) => {
      const gs = new GenerationSettings({
        baseColor: Color.fromHex(hexColor),
        includeBgTextColors: false,
      });

      const strat = new Complementary();
      const palette = strat.buildPalette(gs);

      expect(palette).toBeInstanceOf(Palette);
      const colors = Array.from(palette.colorMap.keys());
      expect(colors.length).toBe(6);
      expect(colors.every((c) => c instanceof Color)).toBe(true);
    });

    const base = Color.fromHex('#6633ff');
    const gs2 = new GenerationSettings({
      baseColor: base,
      includeBgTextColors: false,
    });
    const palette1 = strat.buildPalette(gs2);
    const palette2 = strat.buildPalette(gs2);
    expect(palette1).not.toBe(palette2);
    const colors1 = Array.from(palette1.colorMap.keys());
    const colors2 = Array.from(palette2.colorMap.keys());
    expect(colors1[0].getHEX().value).toBe(colors2[0].getHEX().value);
  });
});
