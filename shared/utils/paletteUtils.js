import {ColorRole} from './constants.js';

/**
 * Maps an array of Color objects to a Map with ColorRole assignments.
 * Works with any palette size: first 3 core colors get PRIMARY, SECONDARY, ACCENT;
 * additional core colors get ACCENT; last 2 get BACKGROUND and TEXT when hasBgText is true.
 * @author Ali Aldaghishy, DeAndre Tyree Josey
 * @param {Color[]} colors - Array of Color objects to map
 * @param {boolean} [hasBgText=true] - Whether the last two colors are background/text
 * @returns {Map<Color, ColorRole>} Map of colors with assigned roles
 */
export function mapColorsToRoles(colors, hasBgText = true) {
  const coreRoles = [ColorRole.PRIMARY, ColorRole.SECONDARY, ColorRole.ACCENT];
  const bgIndex = hasBgText ? colors.length - 2 : -1;
  const textIndex = hasBgText ? colors.length - 1 : -1;

  const colorsWithRoles = colors.map((color, index) => {
    let role;
    if (index === bgIndex) {
      role = ColorRole.BACKGROUND;
    } else if (index === textIndex) {
      role = ColorRole.TEXT;
    } else if (index < coreRoles.length) {
      role = coreRoles[index];
    } else {
      role = ColorRole.ACCENT;
    }
    return [color, role];
  });

  return new Map(colorsWithRoles);
}

/**
 * Serializes a Palette to localStorage under the key 'myPalette'.
 * Used to pass palette data between pages (e.g., Library/Generation → Edit page).
 * @author Ali Aldaghishy
 * @warning This function is browser-only and must NOT be imported or executed in a server-side (Node.js) context.
 *
 * @param {Palette} palette
 */
export function savePaletteToStorage(palette) {
  const transferData = {
    colorMap: [...palette.colorMap.entries()].map(([c, r]) => [
      {r: c.r, g: c.g, b: c.b},
      r,
    ]),
    isDarkTheme: palette.isDarkTheme,
  };
  localStorage.setItem('myPalette', JSON.stringify(transferData));
}
