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
    return null;
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
    return null;
  }

  /**
   * .rehydrateColorMap()
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
   * .visualize()
   *
   * @author Ian Timchak
   * @returns A string containing colored blocks showing each color, for output in a terminal.
   */
  visualize() {
    const ESC = '\u001b[';

    const rows = this.colorMap.map((color, index) => {
      const {r, g, b} = color.getRGB();

      // ANSI 24-bit truecolor background
      const bg = `${ESC}48;2;${r};${g};${b}m`;
      const reset = `${ESC}0m`;

      // Swatch width — adjust as desired
      const swatch = ' '.repeat(20);

      return (
        `${index.toString().padStart(2, '0')}: ` +
        `${bg}${swatch}${reset}` +
        `  rgb(${r}, ${g}, ${b})`
      );
    });

    return rows.join('\n');
  }
}
