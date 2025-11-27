import {convertColor} from '../utils/colorConversion.js';
import {ColorFormat} from '../utils/constants.js';
// '../utils/...' would be nicer to have. Need to refactor

export class Color {
  constructor(r = 0, g = 0, b = 0) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  static fromHex(hex) {
    // Convert hex to RGBA
    let color = convertColor(hex, ColorFormat.RGB);

    return new Color(color.r, color.g, color.b);
  }

  /**
   * getRGB()
   * Returns the RGB components of the color.
   */
  getRGB() {
    return {r: this.r, g: this.g, b: this.b};
  }

  /**
   * Returns the HEX value of the color.
   *
   * @author Ali Aldaghishy
   * @returns HEX vale of color
   */
  getHEX() {
    return convertColor(this, ColorFormat.HEX);
  }
}
