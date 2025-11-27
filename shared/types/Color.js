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
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return new Color(r, g, b);
  }

  /**
   * getRGB()
   * Returns the RGB components of the color.
   */
  getRGB() {
    return {r: this.r, g: this.g, b: this.b};
  }
}
