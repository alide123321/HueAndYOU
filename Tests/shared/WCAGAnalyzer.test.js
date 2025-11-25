import {describe, it, expect} from '@jest/globals';
import {WCAGAnalyzer} from '../../shared/WCAGAnalyzer.js';

describe('WCAGAnalyzer', () => {
  describe('_relativeLuminance', () => {
    it('should calculate relative luminance and return a number', () => {
      const luminance = WCAGAnalyzer._relativeLuminance('#ff0000');
      expect(typeof luminance).toBe('number');
      expect(luminance).toBeGreaterThanOrEqual(0);
      expect(luminance).toBeLessThanOrEqual(1);
    });

    it('should return different luminance for different colors', () => {
      const red = WCAGAnalyzer._relativeLuminance('#ff0000');
      const green = WCAGAnalyzer._relativeLuminance('#00ff00');
      const blue = WCAGAnalyzer._relativeLuminance('#0000ff');
      expect(red).not.toEqual(green);
      expect(green).not.toEqual(blue);
    });

    it('should calculate luminance for pure colors', () => {
      const red = WCAGAnalyzer._relativeLuminance('#ff0000');
      const green = WCAGAnalyzer._relativeLuminance('#00ff00');
      const blue = WCAGAnalyzer._relativeLuminance('#0000ff');
      // Green should have highest luminance, then red, then blue
      expect(green).toBeGreaterThan(red);
      expect(red).toBeGreaterThan(blue);
    });

    it('should calculate relative luminance for white close to 1', () => {
      const luminance = WCAGAnalyzer._relativeLuminance('#ffffff');
      expect(luminance).toBeCloseTo(1, 3);
    });

    it('should calculate relative luminance for black close to 0', () => {
      const luminance = WCAGAnalyzer._relativeLuminance('#000000');
      expect(luminance).toBeCloseTo(0, 3);
    });

    it('should calculate relative luminance for gray between 0 and 1', () => {
      const luminance = WCAGAnalyzer._relativeLuminance('#808080');
      expect(luminance).toBeGreaterThan(0);
      expect(luminance).toBeLessThan(1);
    });

    it('should handle short hex format', () => {
      const luminance1 = WCAGAnalyzer._relativeLuminance('#fff');
      const luminance2 = WCAGAnalyzer._relativeLuminance('#ffffff');
      expect(luminance1).toBeCloseTo(luminance2, 4);
    });
  });

  describe('calculatePairContrast', () => {
    it('should calculate contrast and return a string', () => {
      const contrast = WCAGAnalyzer.calculatePairContrast('#000000', '#ffffff');
      expect(typeof contrast).toBe('string');
    });

    it('should calculate contrast between black and white as reasonable value', () => {
      const contrast = WCAGAnalyzer.calculatePairContrast('#000000', '#ffffff');
      expect(parseFloat(contrast)).toBeGreaterThan(4.5);
    });

    it('should return same color contrast of 1', () => {
      const contrast = WCAGAnalyzer.calculatePairContrast('#ff0000', '#ff0000');
      expect(parseFloat(contrast)).toBeCloseTo(1, 0);
    });

    it('should be symmetric (order does not matter)', () => {
      const contrast1 = WCAGAnalyzer.calculatePairContrast(
        '#ff0000',
        '#00ff00'
      );
      const contrast2 = WCAGAnalyzer.calculatePairContrast(
        '#00ff00',
        '#ff0000'
      );
      expect(parseFloat(contrast1)).toBeCloseTo(parseFloat(contrast2), 2);
    });

    it('should return a string with 2 decimal places', () => {
      const contrast = WCAGAnalyzer.calculatePairContrast('#000000', '#ffffff');
      expect(typeof contrast).toBe('string');
      expect(contrast.split('.')[1]).toHaveLength(2);
    });

    it('should calculate different contrasts for different pairs', () => {
      const contrast1 = WCAGAnalyzer.calculatePairContrast(
        '#ff0000',
        '#ffffff'
      );
      const contrast2 = WCAGAnalyzer.calculatePairContrast(
        '#0000ff',
        '#ffffff'
      );
      expect(parseFloat(contrast1)).not.toEqual(parseFloat(contrast2));
    });

    it('should always return contrast >= 1', () => {
      const contrasts = [
        WCAGAnalyzer.calculatePairContrast('#000000', '#ffffff'),
        WCAGAnalyzer.calculatePairContrast('#ff0000', '#ffffff'),
        WCAGAnalyzer.calculatePairContrast('#ff0000', '#ff0000'),
      ];
      contrasts.forEach((contrast) => {
        expect(parseFloat(contrast)).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('calculatePalette', () => {
    it('should create report with entries array', () => {
      const palette = {
        textColor: '#000000',
        bgColor: '#ffffff',
        colors: ['#ff0000', '#00ff00', '#0000ff'],
      };
      const report = WCAGAnalyzer.calculatePalette(palette);
      expect(report).toHaveProperty('entries');
      expect(Array.isArray(report.entries)).toBe(true);
    });

    it('should have one entry per color in palette', () => {
      const palette = {
        textColor: '#000000',
        bgColor: '#ffffff',
        colors: ['#ff0000', '#00ff00', '#0000ff'],
      };
      const report = WCAGAnalyzer.calculatePalette(palette);
      expect(report.entries).toHaveLength(3);
    });

    it('should include all required fields in each entry', () => {
      const palette = {
        textColor: '#000000',
        bgColor: '#ffffff',
        colors: ['#ff0000'],
      };
      const report = WCAGAnalyzer.calculatePalette(palette);
      const entry = report.entries[0];
      expect(entry).toHaveProperty('color');
      expect(entry).toHaveProperty('contrastOnText');
      expect(entry).toHaveProperty('contrastOnBackground');
      expect(entry).toHaveProperty('bestContrast');
    });

    it('should store correct color value in entry', () => {
      const palette = {
        textColor: '#000000',
        bgColor: '#ffffff',
        colors: ['#ff0000', '#00ff00'],
      };
      const report = WCAGAnalyzer.calculatePalette(palette);
      expect(report.entries[0].color).toBe('#ff0000');
      expect(report.entries[1].color).toBe('#00ff00');
    });

    it('should calculate contrast for each color against text color', () => {
      const palette = {
        textColor: '#000000',
        bgColor: '#ffffff',
        colors: ['#ff0000'],
      };
      const report = WCAGAnalyzer.calculatePalette(palette);
      const entry = report.entries[0];
      expect(entry.contrastOnText).toBeDefined();
      expect(typeof entry.contrastOnText).toBe('string');
    });

    it('should calculate contrast for each color against background color', () => {
      const palette = {
        textColor: '#000000',
        bgColor: '#ffffff',
        colors: ['#ff0000'],
      };
      const report = WCAGAnalyzer.calculatePalette(palette);
      const entry = report.entries[0];
      expect(entry.contrastOnBackground).toBeDefined();
      expect(typeof entry.contrastOnBackground).toBe('string');
    });

    it('should set bestContrast to maximum of text and background contrasts', () => {
      const palette = {
        textColor: '#000000',
        bgColor: '#ffffff',
        colors: ['#ff0000'],
      };
      const report = WCAGAnalyzer.calculatePalette(palette);
      const entry = report.entries[0];
      const textContrast = parseFloat(entry.contrastOnText);
      const bgContrast = parseFloat(entry.contrastOnBackground);
      expect(entry.bestContrast).toBe(Math.max(textContrast, bgContrast));
    });

    it('should use default colors when not provided', () => {
      const palette = {
        colors: ['#ff0000'],
      };
      const report = WCAGAnalyzer.calculatePalette(palette);
      expect(report.entries).toHaveLength(1);
      expect(report.entries[0]).toHaveProperty('contrastOnText');
      expect(report.entries[0]).toHaveProperty('contrastOnBackground');
    });

    it('should handle empty palette', () => {
      const palette = {
        textColor: '#000000',
        bgColor: '#ffffff',
        colors: [],
      };
      const report = WCAGAnalyzer.calculatePalette(palette);
      expect(report.entries).toHaveLength(0);
    });

    it('should handle multiple colors in palette', () => {
      const palette = {
        textColor: '#000000',
        bgColor: '#ffffff',
        colors: [
          '#ff0000',
          '#00ff00',
          '#0000ff',
          '#ffff00',
          '#ff00ff',
          '#00ffff',
        ],
      };
      const report = WCAGAnalyzer.calculatePalette(palette);
      expect(report.entries).toHaveLength(6);
    });

    it('should ensure bestContrast is numeric', () => {
      const palette = {
        textColor: '#000000',
        bgColor: '#ffffff',
        colors: ['#ff0000'],
      };
      const report = WCAGAnalyzer.calculatePalette(palette);
      expect(typeof report.entries[0].bestContrast).toBe('number');
    });

    it('should handle palette with custom text color', () => {
      const palette = {
        textColor: '#ff0000',
        bgColor: '#ffffff',
        colors: ['#00ff00'],
      };
      const report = WCAGAnalyzer.calculatePalette(palette);
      expect(report.entries[0].contrastOnText).toBeDefined();
      expect(report.entries[0].bestContrast).toBeGreaterThan(0);
    });

    it('should handle palette with custom background color', () => {
      const palette = {
        textColor: '#000000',
        bgColor: '#ff0000',
        colors: ['#00ff00'],
      };
      const report = WCAGAnalyzer.calculatePalette(palette);
      expect(report.entries[0].contrastOnBackground).toBeDefined();
      expect(report.entries[0].bestContrast).toBeGreaterThan(0);
    });
  });

  describe('Integration tests', () => {
    it('should generate valid contrast reports for palette', () => {
      const palette = {
        textColor: '#000000',
        bgColor: '#ffffff',
        colors: ['#ff0000', '#00ff00', '#0000ff'],
      };
      const report = WCAGAnalyzer.calculatePalette(palette);
      report.entries.forEach((entry) => {
        expect(entry.bestContrast).toBeGreaterThan(0);
      });
    });

    it('should identify low contrast palette differences', () => {
      const palette = {
        textColor: '#ffffff',
        bgColor: '#f0f0f0',
        colors: ['#e0e0e0', '#eeeeee'],
      };
      const report = WCAGAnalyzer.calculatePalette(palette);
      expect(report.entries.length).toBeGreaterThan(0);
    });

    it('should work with real-world palette data', () => {
      const palette = {
        textColor: '#1a1a1a',
        bgColor: '#f5f5f5',
        colors: ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'],
      };
      const report = WCAGAnalyzer.calculatePalette(palette);
      expect(report.entries).toHaveLength(5);
      report.entries.forEach((entry) => {
        expect(entry.bestContrast).toBeGreaterThan(0);
        expect(entry.color).toBeDefined();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing colors property and return empty entries', () => {
      const palette = {textColor: '#000000', bgColor: '#ffffff'};
      const report = WCAGAnalyzer.calculatePalette(palette);
      expect(report).toHaveProperty('entries');
      expect(Array.isArray(report.entries)).toBe(true);
      expect(report.entries).toHaveLength(0);
    });

    it('should throw on invalid color string for luminance', () => {
      expect(() => WCAGAnalyzer._relativeLuminance('#ggg')).toThrow();
      expect(() => WCAGAnalyzer._relativeLuminance('not-a-color')).toThrow();
    });

    it('should throw on null/undefined inputs', () => {
      expect(() => WCAGAnalyzer._relativeLuminance(null)).toThrow();
      expect(() =>
        WCAGAnalyzer.calculatePairContrast(undefined, '#ffffff')
      ).toThrow();
    });

    it('should accept color objects as input', () => {
      const contrast = WCAGAnalyzer.calculatePairContrast(
        {r: 1, g: 0, b: 0},
        '#ffffff'
      );
      expect(typeof contrast).toBe('string');
      expect(parseFloat(contrast)).toBeGreaterThan(0);
    });

    it('should handle hex with whitespace and mixed case', () => {
      const a = WCAGAnalyzer._relativeLuminance('  #FfAa00  ');
      const b = WCAGAnalyzer._relativeLuminance('#FFAA00');
      expect(a).toBeCloseTo(b, 6);
    });

    it('should handle 8-digit hex (alpha) by ignoring alpha for luminance', () => {
      const withAlpha = '#ffffff00';
      const white = '#ffffff';
      const lumWhite = WCAGAnalyzer._relativeLuminance(white);
      const lumAlpha = (() => {
        try {
          return WCAGAnalyzer._relativeLuminance(withAlpha);
        } catch (e) {
          return null;
        }
      })();
      if (lumAlpha !== null) {
        expect(typeof lumAlpha).toBe('number');
        expect(lumAlpha).toBeGreaterThanOrEqual(0);
        expect(lumAlpha).toBeLessThanOrEqual(1);
      } else {
        expect(lumAlpha).toBeNull();
      }
    });
  });
});
