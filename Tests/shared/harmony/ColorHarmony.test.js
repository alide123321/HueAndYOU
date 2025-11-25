import {describe, it, expect} from '@jest/globals';
import {ColorHarmony} from '../../../shared/harmony/ColorHarmony.js';
import {convertColor} from '../../../public/commonCode/colorConversion.js';
import {ColorFormat} from '../../../public/commonCode/constants.js';

describe('ColorHarmony', () => {
  describe('complementary', () => {
    it('returns the original and 180° hue-shifted complement', () => {
      const hex = '#ff0000';
      const result = ColorHarmony.complementary(hex);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);

      const hsl = convertColor(hex, ColorFormat.HSL);
      const compHue = (hsl.h + 180) % 360;
      const expected = convertColor(
        {h: compHue, s: hsl.s, l: hsl.l},
        ColorFormat.HEX
      ).value;

      expect(result[0].toLowerCase()).toBe(hex.toLowerCase());
      expect(result[1].toLowerCase()).toBe(expected.toLowerCase());
    });

    it('double complementary returns the original color', () => {
      const hex = '#33aaff';
      const first = ColorHarmony.complementary(hex)[1];
      const second = ColorHarmony.complementary(first)[1];
      expect(second.toLowerCase()).toBe(hex.toLowerCase());
    });
  });

  describe('analogous', () => {
    it('returns two neighbors at ±30° around the original', () => {
      const hex = '#00ff00';
      const result = ColorHarmony.analogous(hex);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);

      const hsl = convertColor(hex, ColorFormat.HSL);
      const expectedA = convertColor(
        {h: (hsl.h + 30) % 360, s: hsl.s, l: hsl.l},
        ColorFormat.HEX
      ).value;
      const expectedB = convertColor(
        {h: (hsl.h + 330) % 360, s: hsl.s, l: hsl.l},
        ColorFormat.HEX
      ).value;

      expect(result[1].toLowerCase()).toBe(hex.toLowerCase());
      expect(result[0].toLowerCase()).toBe(expectedA.toLowerCase());
      expect(result[2].toLowerCase()).toBe(expectedB.toLowerCase());
    });
  });

  describe('monochromatic', () => {
    it('returns lighter and darker variants by adjusting lightness', () => {
      const hex = '#0000ff';
      const result = ColorHarmony.monochromatic(hex);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);

      const hsl = convertColor(hex, ColorFormat.HSL);
      const lighter = convertColor(
        {h: hsl.h, s: hsl.s, l: Math.min(1, hsl.l + 0.3)},
        ColorFormat.HEX
      ).value;
      const darker = convertColor(
        {h: hsl.h, s: hsl.s, l: Math.max(0, hsl.l - 0.3)},
        ColorFormat.HEX
      ).value;

      expect(result[1].toLowerCase()).toBe(hex.toLowerCase());
      expect(result[0].toLowerCase()).toBe(lighter.toLowerCase());
      expect(result[2].toLowerCase()).toBe(darker.toLowerCase());
    });

    it('clamps lightness when near bounds (l + 0.3 > 1 and l - 0.3 < 0)', () => {
      // l near upper bound
      const hexHighL = convertColor(
        {h: 120, s: 1, l: 0.85},
        ColorFormat.HEX
      ).value;
      const resHigh = ColorHarmony.monochromatic(hexHighL);
      const hslHigh = convertColor(hexHighL, ColorFormat.HSL);
      const expectedLighterHigh = convertColor(
        {h: hslHigh.h, s: hslHigh.s, l: Math.min(1, hslHigh.l + 0.3)},
        ColorFormat.HEX
      ).value;
      expect(resHigh[0].toLowerCase()).toBe(expectedLighterHigh.toLowerCase());

      // l near lower bound
      const hexLowL = convertColor(
        {h: 240, s: 1, l: 0.15},
        ColorFormat.HEX
      ).value;
      const resLow = ColorHarmony.monochromatic(hexLowL);
      const hslLow = convertColor(hexLowL, ColorFormat.HSL);
      const expectedDarkerLow = convertColor(
        {h: hslLow.h, s: hslLow.s, l: Math.max(0, hslLow.l - 0.3)},
        ColorFormat.HEX
      ).value;
      expect(resLow[2].toLowerCase()).toBe(expectedDarkerLow.toLowerCase());
    });
  });

  describe('edge cases and validation', () => {
    it('throws when provided an invalid color string', () => {
      expect(() => ColorHarmony.complementary('not-a-color')).toThrow();
      expect(() => ColorHarmony.analogous('')).toThrow();
      expect(() => ColorHarmony.monochromatic(null)).toThrow();
    });

    it('handles hex values generated from HSL near hue wrap boundaries', () => {
      // Create a color with hue near 350° to force wrap-around on +30°
      const sourceHex = convertColor(
        {h: 350, s: 1, l: 0.5},
        ColorFormat.HEX
      ).value;
      const result = ColorHarmony.analogous(sourceHex);
      const hsl = convertColor(sourceHex, ColorFormat.HSL);
      const expectedA = convertColor(
        {h: (hsl.h + 30) % 360, s: hsl.s, l: hsl.l},
        ColorFormat.HEX
      ).value;
      const expectedB = convertColor(
        {h: (hsl.h + 330) % 360, s: hsl.s, l: hsl.l},
        ColorFormat.HEX
      ).value;
      expect(result[0].toLowerCase()).toBe(expectedA.toLowerCase());
      expect(result[2].toLowerCase()).toBe(expectedB.toLowerCase());
    });

    it('returns normalized hex strings and unique values', () => {
      const hex = '#FF00FF';
      const comp = ColorHarmony.complementary(hex);
      // normalized (lowercase) and proper hex format
      expect(typeof comp[0]).toBe('string');
      expect(typeof comp[1]).toBe('string');
      expect(comp[0].startsWith('#')).toBe(true);
      expect(comp[1].startsWith('#')).toBe(true);
      expect(comp[0].toLowerCase()).toBe(hex.toLowerCase());
      expect(comp[0].toLowerCase()).not.toBe(comp[1].toLowerCase());
    });
  });
});
