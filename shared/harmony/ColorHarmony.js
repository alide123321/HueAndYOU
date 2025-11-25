import {convertColor} from '../../public/commonCode/colorConversion.js';
import {ColorFormat} from '../../public/commonCode/constants.js';

/**
 * Utility for generating basic color harmony sets
 * Uses the shared color conversion utilities defined by the project.
 *
 * @author DeAndre, Ali Aldaghishy
 *
 * @todo Implement triadic, and tetradic
 */
export class ColorHarmony {
  /**
   * Complementary harmony
   * 180° hue shift
   */
  static complementary(hex) {
    const {h, s, l} = convertColor(hex, ColorFormat.HSL);
    const compHue = (h + 180) % 360;

    const compHex = convertColor({h: compHue, s, l}, ColorFormat.HEX).value;

    return [hex, compHex];
  }

  /**
   * Analogous harmony
   * ±30° hue shifts
   */
  static analogous(hex) {
    const {h, s, l} = convertColor(hex, ColorFormat.HSL);

    const a = convertColor({h: (h + 30) % 360, s, l}, ColorFormat.HEX).value;
    const b = convertColor({h: (h + 330) % 360, s, l}, ColorFormat.HEX).value;

    return [a, hex, b];
  }

  /**
   * Monochromatic harmony
   * Adjust lightness around same hue
   */
  static monochromatic(hex) {
    const {h, s, l} = convertColor(hex, ColorFormat.HSL);

    // culori HSL uses h: degrees, s: 0..1, l: 0..1 — adjust by fractional amounts
    const lighter = convertColor(
      {h, s, l: Math.min(1, l + 0.3)},
      ColorFormat.HEX
    ).value;
    const darker = convertColor(
      {h, s, l: Math.max(0, l - 0.3)},
      ColorFormat.HEX
    ).value;

    return [lighter, hex, darker];
  }
}
