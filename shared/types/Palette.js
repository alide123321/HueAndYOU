import {Color} from './Color.js';
import {ColorRole} from '../utils/constants.js';

export class Palette {
  /**
   * @param {Map<Color, string>} colorMap - A map of color objects to their roles.
   * @param {boolean} isDarkTheme - Indicates if the palette is for a dark theme.
   *
   * @author Ali Aldaghishy
   */
  constructor(colorMap, isDarkTheme = false) {
    this.colorMap = colorMap;
    this.isDarkTheme = isDarkTheme;
  }

  /**
   * getBackgroundColor()
   *
   * @author Ali Aldaghishy
   * @Returns the Color assigned to the role, or null.
   */
  getBackgroundColor() {
    for (const [color, role] of this.colorMap.entries()) {
      if (role === ColorRole.BACKGROUND) return color;
    }
    if (!this.isDarkTheme) {
      return new Color(255, 255, 255);
    } else {
      return new Color(0, 0, 0);
    }
  }

  /**
   * getTextColor()
   *
   * @author Ali Aldaghishy
   * @returns the Color assigned to the role, or null.
   */
  getTextColor() {
    for (const [color, role] of this.colorMap.entries()) {
      if (role === ColorRole.TEXT) return color;
    }
    //if light theme, return black
    if (!this.isDarkTheme) {
      return new Color(0, 0, 0);
    } else {
      return new Color(255, 255, 255);
    }
  }

  /**
   * .rehydrateColorMap()
   * Rehydrates the colorMap's Color objects after deserialization.
   */
  rehydrateColorMap() {
    const newMap = new Map();
    for ( const [colorObj, role] of this.colorMap ) {
      const color = new Color(colorObj.r, colorObj.g, colorObj.b);
      newMap.set(color, role);
    }

    this.colorMap = newMap;
  }
  /**
   * .serializeColorMap()
   * Serializes as 2d array for transmission.
   */
  serializeColorMap() {
    const serialized = [];
    for ( const [colorObj, role] of this.colorMap.entries() ) {
      serialized.push([colorObj, role]);
    }
    this.colorMap = serialized;
  }

  /**
   * .visualize()
   *
   * @author Ian Timchak
   * @returns A string containing colored blocks showing each color, for output in a terminal.
   * 
   * Note: debug purposes only. Refactored on 02/06/2026 to support Map-based colorMap and to include role labels.
   */
  visualize() {
  const ESC = '\u001b[';

  const rows = [];
  let index = 0;

  for (const [color, role] of this.colorMap.entries()) {
    const { r, g, b } = color.getRGB();

    const bg = `${ESC}48;2;${r};${g};${b}m`;
    const reset = `${ESC}0m`;
    const swatch = ' '.repeat(20);

    rows.push(
      `${index.toString().padStart(2, '0')}: ` +
      `${bg}${swatch}${reset}` +
      `  rgb(${r}, ${g}, ${b})` +
      (role ? `  (${role})` : '')
    );

    index++;
  }

  return rows.join('\n');
}
}
