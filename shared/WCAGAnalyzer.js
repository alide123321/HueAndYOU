import { convertColor } from "../../public/CommonCode/colorConversion.js";
import { ColorFormat } from "../../public/CommonCode/constants.js";

/**
 * Generates WCAG contrast reports for palette colors.
 * Uses shared project color conversion instead of custom functions.
 *
 * @author DeAndre
 */
export class WCAGAnalyzer {

  /**
   * Calculates relative luminance using shared color conversion.
   * @param {string} hex - Hex color value (#RRGGBB)
   * @returns {number} luminance value
   */
  static _relativeLuminance(hex) {
    const rgb = convertColor(hex, ColorFormat.RGB);

    const normalize = (c) => {
      c /= 255;
      return c <= 0.03928
        ? c / 12.92
        : Math.pow((c + 0.055) / 1.055, 2.4);
    };

    const R = normalize(rgb.r);
    const G = normalize(rgb.g);
    const B = normalize(rgb.b);

    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  }

  /**
   * Contrast between two colors using WCAG formula.
   */
  static calculatePairContrast(foreground, background) {
    const L1 = this._relativeLuminance(foreground);
    const L2 = this._relativeLuminance(background);

    const lighter = Math.max(L1, L2);
    const darker = Math.min(L1, L2);

    return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
  }

  /**
   * Generates a WCAG contrast report for all colors in a palette.
   * @param {object} palette - palette with assigned role colors
   * @returns {WCAGReport} contrast data
   */
  static calculatePalette(palette) {
    const report = {
      entries: []
    };

    // look for assigned roles first
    const textColor = palette.textColor || "#000000";
    const bgColor = palette.bgColor || "#FFFFFF";

    for (const color of palette.colors) {
      const contrastOnText = this.calculatePairContrast(textColor, color);
      const contrastOnBackground = this.calculatePairContrast(bgColor, color);

      const best = Math.max(
        parseFloat(contrastOnText),
        parseFloat(contrastOnBackground)
      );

      report.entries.push({
        color,
        contrastOnText,
        contrastOnBackground,
        bestContrast: best
      });
    }

    return report;
  }
}