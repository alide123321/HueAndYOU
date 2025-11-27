import {WCAGReport} from '../types/WCAGReport.js';
import {WCAGColorResult} from '../types/WCAGColorResult.js';
import {Color} from '../types/Color.js';
import {ColorRole} from '../utils/constants.js';

/**
 * WCAGAnalyzer
 *
 * Provides static methods for computing individual and batch calculations.
 * @author Ian Timchak
 * TODO: Fix luminance class variable issues and compute contrast input misalignment
 */
export class WCAGAnalyzer {
  /**
   * Luminance calculation function
   * Based on the W3C documentation: https://www.w3.org/WAI/WCAG21/Techniques/general/G17
   * @author Ian Timchak
   * @returns relative luminance value converting from sRGB (Color object)
   */
  static luminance(r, g, b) {
    //transformation into linear RGB
    r = r / 255;
    g = g / 255;
    b = b / 255;
    const Rnorm = r <= 0.04505 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const Gnorm = g <= 0.04505 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const Bnorm = b <= 0.04505 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    //calculation
    const luminance = 0.2126 * Rnorm + 0.7152 * Gnorm + 0.0722 * Bnorm;
    return luminance;
  }

  /**
   * computePairContrast()
   * Calculates the contrast ratio for two colors
   *
   * @author Ian Timchak
   * @param {Color} foreground
   * @param {Color} background
   * @return {double} contrast ratio
   */
  static computePairContrast(foreground, background) {
    fg = foreground.getRGB();
    bg = background.getRGB();
    const L1 = WCAGAnalyzer.luminance(fg.r, fg.g, fg.b);
    const L2 = WCAGAnalyzer.luminance(bg.r, bg.g, bg.b);

    const lighter = Math.max(L1, L2);
    const darker = Math.min(L1, L2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * AA: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum
   * AAA: https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced
   * Determines AA/AAA/FAIL given a contrast ratio.
   *
   * @author Ian Timchak
   */
  static wcagLabel(contrast) {
    if (contrast >= 7.0) return 'AAA';
    if (contrast >= 4.5) return 'AA';
    return 'FAIL';
  }

  /**
   * Creates a WCAGReport for a palette, comparing each color to the bg and text colors.
   *
   * @author Ian Timchak
   * @param {Palette} palette - the palette being analyzed
   * @return {WCAGReport} WCAGReport object
   */
  static analyzePalette(palette) {
    //Get background & text (roles OR fallback)
    let bg = palette.getBackgroundColor();
    let text = palette.getTextColor();

    if (!bg || !text) {
      if (palette.isDarkTheme) {
        bg = new Color(0, 0, 0);
        text = new Color(255, 255, 255);
      } else {
        bg = new Color(255, 255, 255);
        text = new Color(0, 0, 0);
      }
    }

    //Compute results for each color
    const results = [];

    palette.colors.forEach((c, index) => {
      const contrastWithBg = WCAGAnalyzer.computePairContrast(c, bg);
      const contrastWithText = WCAGAnalyzer.computePairContrast(c, text);

      const bestContrast = Math.max(contrastWithBg, contrastWithText);
      const bestAgainst =
        contrastWithBg >= contrastWithText
          ? ColorRole.BACKGROUND
          : ColorRole.TEXT;

      const label = WCAGAnalyzer.wcagLabel(bestContrast);

      results.push(
        new WCAGColorResult(
          index,
          c,
          contrastWithBg,
          contrastWithText,
          bestContrast,
          bestAgainst,
          label
        )
      );
    });

    // 3. Final structured report
    return new WCAGReport(bg, text, results);
  }
}
