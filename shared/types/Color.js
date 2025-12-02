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
    
    //is in form 0-1, must be in form 0-255
    color.r = Math.round(color.r * 255);
    color.g = Math.round(color.g * 255);
    color.b = Math.round(color.b * 255);

    return new Color(color.r, color.g, color.b);
  }

  /**
   * 
   * @param {String} str 
   * @returns 
   */
  static fromRGBString(str) {
    // Simple pattern, human readable
    const rgbPattern = /rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/i;
    const match = rgbPattern.exec(str);

    if (match) {
      const r = parseInt(match[1], 10);
      const g = parseInt(match[2], 10);
      const b = parseInt(match[3], 10);
      return new Color(r, g, b, 'rgb');
    }

    throw new Error(`Invalid RGB string: ${str}`);
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
    //0-1 range expected
    const rgb01 = {
      r: this.r / 255,
      g: this.g / 255,
      b: this.b / 255,
    };
    return convertColor(rgb01, ColorFormat.HEX);
  }
}
