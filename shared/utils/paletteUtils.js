import {ColorRole} from './constants.js';

/**
 * Maps an array of Color objects to a Map with ColorRole assignments
 * Supports both 5-color palettes (Triadic/Analogous) and 6-color palettes (Complementary)
 * @author Ali Aldaghishy, DeAndre Tyree Josey
 * @param {Color[]} colors - Array of Color objects to map
 * @returns {Map<Color, ColorRole>} Map of colors with assigned roles
 */
export function mapColorsToRoles(colors) {
  //map color objects in a Color, Role mapping
  //JSON cant send map objects apparently, so convert to array of arrays
  //To DO: properly deserialize maps on the api side, not priority at this moment
  let colorsWithRoles = [];

  // Determine mapping based on array length
  const is5ColorPalette = colors.length === 5;

  colors.forEach((color, index) => {
    colorsWithRoles.push([color, null]); // null role by default
    if (is5ColorPalette) {
      if (index === 0) colorsWithRoles[index][1] = ColorRole.PRIMARY;
      else if (index === 1) colorsWithRoles[index][1] = ColorRole.SECONDARY;
      else if (index === 2) colorsWithRoles[index][1] = ColorRole.ACCENT;
      else if (index === 3) colorsWithRoles[index][1] = ColorRole.BACKGROUND;
      else if (index === 4) colorsWithRoles[index][1] = ColorRole.TEXT;
      else colorsWithRoles[index][1] = null;
    } else {
      if (index === 0) colorsWithRoles[index][1] = ColorRole.PRIMARY;
      else if (index === 1) colorsWithRoles[index][1] = ColorRole.SECONDARY;
      else if (index === 2) colorsWithRoles[index][1] = ColorRole.ACCENT;
      else if (index === 3) colorsWithRoles[index][1] = ColorRole.ACCENT;
      else if (index === 4) colorsWithRoles[index][1] = ColorRole.BACKGROUND;
      else if (index === 5) colorsWithRoles[index][1] = ColorRole.TEXT;
      else colorsWithRoles[index][1] = null;
    }
  });

  //Convert colorsWithRoles from 2D array to a map for Palette constructor
  return new Map(colorsWithRoles);
}
