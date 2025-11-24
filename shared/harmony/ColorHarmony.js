import { convertColor } from "../../public/CommonCode/colorConversion.js";
import { ColorFormat } from "../../public/CommonCode/constants.js";

/**
 * Utility for generating basic color harmony sets
 * Uses the shared color conversion utilities defined by the project.
 *
 * @author DeAndre
 */
export class ColorHarmony {
  
  /**
   * Convert HEX → HSL using shared converter
   */
  static _hexToHsl(hex) {
    const hsl = convertColor(hex, ColorFormat.HSL);
    return [hsl.h, hsl.s, hsl.l];
  }

  /**
   * Convert HSL → HEX using shared converter
   */
  static _hslToHex(h, s, l) {
    const newColor = convertColor({ h, s, l }, ColorFormat.HEX);
    return newColor.value;
  }

  /**
   * Complementary harmony
   * 180° hue shift
   */
  static complementary(hex) {
    const [h, s, l] = this._hexToHsl(hex);

    const compHue = (h + 180) % 360;

    return [
      hex,
      this._hslToHex(compHue, s, l)
    ];
  }

  /**
   * Analogous harmony
   * ±30° hue shifts
   */
  static analogous(hex) {
    const [h, s, l] = this._hexToHsl(hex);

    return [
      this._hslToHex((h + 30) % 360, s, l),
      hex,
      this._hslToHex((h + 330) % 360, s, l)
    ];
  }

  /**
   * Monochromatic harmony
   * Adjust lightness around same hue
   */
  static monochromatic(hex) {
    const [h, s, l] = this._hexToHsl(hex);

    return [
      this._hslToHex(h, s, Math.min(90, l + 30)),
      hex,
      this._hslToHex(h, s, Math.max(10, l - 30))
    ];
  }
}