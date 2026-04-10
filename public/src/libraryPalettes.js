import {Color} from '../shared/types/Color.js';
import {ColorRole} from '../shared/utils/constants.js';
import {Palette} from '../shared/types/Palette.js';

/**
 * Creates a palette from an array of color definitions.
 * @param {Array<{hex: string, role: string}>} colorDefs - Array of color definitions
 * @param {boolean} isDarkTheme - Whether this is a dark theme palette
 * @returns {Palette} A new Palette instance
 */
function createPalette(colorDefs, isDarkTheme = false) {
  const colorMap = new Map();
  colorDefs.forEach(({hex, role}) => {
    colorMap.set(Color.fromHex(hex), role);
  });
  return new Palette(colorMap, isDarkTheme);
}

/**
 * @author Ali Aldaghishy
 * @description Provides a set of predefined color palettes for use in the application.
 * @returns {Palette[]} A list of predefined color palettes.
 */
export function getLibraryPalettes() {
  return [
    // Blue Palette - Ocean Blue
    createPalette([
      {hex: '#1E3A8A', role: ColorRole.PRIMARY},
      {hex: '#2563EB', role: ColorRole.SECONDARY},
      {hex: '#60A5FA', role: ColorRole.ACCENT},
      {hex: '#DBEAFE', role: ColorRole.BACKGROUND},
      {hex: '#1E293B', role: ColorRole.TEXT},
    ]),

    // Pink Palette - Rose
    createPalette([
      {hex: '#9F1239', role: ColorRole.PRIMARY},
      {hex: '#E11D48', role: ColorRole.SECONDARY},
      {hex: '#FB7185', role: ColorRole.ACCENT},
      {hex: '#FCE7F3', role: ColorRole.BACKGROUND},
      {hex: '#1E293B', role: ColorRole.TEXT},
    ]),

    // Green Palette - Emerald
    createPalette([
      {hex: '#065F46', role: ColorRole.PRIMARY},
      {hex: '#059669', role: ColorRole.SECONDARY},
      {hex: '#34D399', role: ColorRole.ACCENT},
      {hex: '#D1FAE5', role: ColorRole.BACKGROUND},
      {hex: '#1E293B', role: ColorRole.TEXT},
    ]),

    // Orange Palette - Sunset
    createPalette([
      {hex: '#C2410C', role: ColorRole.PRIMARY},
      {hex: '#EA580C', role: ColorRole.SECONDARY},
      {hex: '#FB923C', role: ColorRole.ACCENT},
      {hex: '#FFEDD5', role: ColorRole.BACKGROUND},
      {hex: '#1E293B', role: ColorRole.TEXT},
    ]),

    // Teal Palette - Aqua
    createPalette([
      {hex: '#115E59', role: ColorRole.PRIMARY},
      {hex: '#0F766E', role: ColorRole.SECONDARY},
      {hex: '#5EEAD4', role: ColorRole.ACCENT},
      {hex: '#CCFBF1', role: ColorRole.BACKGROUND},
      {hex: '#1E293B', role: ColorRole.TEXT},
    ]),

    // Purple Palette - Violet
    createPalette([
      {hex: '#5B21B6', role: ColorRole.PRIMARY},
      {hex: '#7C3AED', role: ColorRole.SECONDARY},
      {hex: '#A78BFA', role: ColorRole.ACCENT},
      {hex: '#EDE9FE', role: ColorRole.BACKGROUND},
      {hex: '#1E293B', role: ColorRole.TEXT},
    ]),

    // Amber Palette - Gold
    createPalette([
      {hex: '#92400E', role: ColorRole.PRIMARY},
      {hex: '#D97706', role: ColorRole.SECONDARY},
      {hex: '#FCD34D', role: ColorRole.ACCENT},
      {hex: '#FEF3C7', role: ColorRole.BACKGROUND},
      {hex: '#1E293B', role: ColorRole.TEXT},
    ]),

    // Indigo Palette - Night Sky
    createPalette([
      {hex: '#312E81', role: ColorRole.PRIMARY},
      {hex: '#4F46E5', role: ColorRole.SECONDARY},
      {hex: '#818CF8', role: ColorRole.ACCENT},
      {hex: '#E0E7FF', role: ColorRole.BACKGROUND},
      {hex: '#1E293B', role: ColorRole.TEXT},
    ]),
  ];
}
