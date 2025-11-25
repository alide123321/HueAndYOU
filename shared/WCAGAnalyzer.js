import {convertColor} from '../public/CommonCode/colorConversion.js';
import {ColorFormat} from '../public/CommonCode/constants.js';

/**
 * Generates WCAG contrast reports for palette colors.
 * Uses shared project color conversion instead of custom functions.
 *
 * @author DeAndre
 */
export class WCAGAnalyzer {
  /**
   * Calculates relative luminance using shared color conversion.
   * Uses the project's `convertColor` helper which returns RGB components
   * in the 0..1 range (culori). This method follows the WCAG/ITU formula
   * for relative luminance.
   *
   * @author DeAndre, Ali Aldaghishy
   * @param {string|object} hex - Hex string (e.g. "#ff0000") or a color
   *   object (e.g. `{r:1,g:0,b:0}`) acceptable by `convertColor`.
   * @returns {number} luminance value in the range [0, 1]
   * @throws {Error} when `hex` is null/undefined or cannot be parsed by
   *   the shared `convertColor` helper.
   */
  static _relativeLuminance(hex) {
    // basic validation: null/undefined inputs are invalid
    if (hex === null || hex === undefined)
      throw new Error('Color input is required for luminance calculation');

    // tolerate strings with surrounding whitespace
    if (typeof hex === 'string') hex = hex.trim();
    const rgb = convertColor(hex, ColorFormat.RGB);

    const normalize = (c) => {
      // c is already in 0-1 range from culori library
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };

    const R = normalize(rgb.r);
    const G = normalize(rgb.g);
    const B = normalize(rgb.b);

    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  }

  /**
   * Contrast between two colors using WCAG formula.
   *
   * @author DeAndre
   * @param {string|object} foreground - Foreground color (hex or object)
   * @param {string|object} background - Background color (hex or object)
   * @returns {string} contrast ratio formatted with two decimal places
   * @throws {Error} when either argument is null/undefined or invalid
   *   (parsing delegated to `_relativeLuminance`).
   */
  static calculatePairContrast(foreground, background) {
    if (foreground === null || foreground === undefined)
      throw new Error('Foreground color is required for contrast calculation');

    if (background === null || background === undefined)
      throw new Error('Background color is required for contrast calculation');

    const L1 = this._relativeLuminance(foreground);
    const L2 = this._relativeLuminance(background);

    const lighter = Math.max(L1, L2);
    const darker = Math.min(L1, L2);

    return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
  }

  /**
   * Generates a WCAG contrast report for all colors in a palette.
   *
   * @todo It doesnt actually return WCAGReport type yet, need to define that. - Ali
   *
   * @param {object} palette - palette with assigned role colors
   * @returns {WCAGReport} contrast data
   */
  static calculatePalette(palette) {
    const report = {
      entries: [],
    };

    // look for assigned roles first
    const textColor = palette.textColor || '#000000';
    const bgColor = palette.bgColor || '#FFFFFF';

    // ensure `colors` is iterable even when missing
    for (const color of palette.colors || []) {
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
        bestContrast: best,
      });
    }

    return report;
  }
}
