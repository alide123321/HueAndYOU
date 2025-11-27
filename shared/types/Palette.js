import {Color} from './Color.js';

export class Palette {
  /**
     * @param {Color[]} colors
     * @param {Object} roles  - Example: { 4: "bg", 5: "text" }
     */
    constructor(colors = [], roles = {}, isDarkTheme = false) {
        this.colors = colors;     // array of Color instances
        this.roles = roles;       // mapping index -> role ("bg", "text", etc.)
        this.isDarkTheme = isDarkTheme;
    }

    /**
     * getBackgroundColor()
     * 
     * @author Ian Timchak
     * Returns the Color assigned to role "bg", or null.
     */
    getBackgroundColor() {
        for (const [index, role] of Object.entries(this.roles)) {
            if (role === "bg") return this.colors[index] || null;
        }
        return null;
    }

    /**
     * getTextColor()
     * 
     * @author Ian Timchak
     * @returns the Color assigned to role "text", or null.
     */
    getTextColor() {
        for (const [index, role] of Object.entries(this.roles)) {
            if (role === "text") return this.colors[index] || null;
        }
        return null;
    }

  /**
   * .visualize()
   * 
   * @author Ian Timchak
   * @returns A string containing colored blocks showing each color, for output in a terminal.
   */
  visualize() {
    const ESC = '\u001b[';

    const rows = this.colors.map((color, index) => {
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
