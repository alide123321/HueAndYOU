import {ColorRole} from './constants.js';

/**
 * Maps an array of Color objects to a Map with ColorRole assignments
 * @author Ali Aldaghishy
 * @param {Color[]} colors - Array of Color objects to map
 * @returns {Map<Color, ColorRole>} Map of colors with assigned roles
 */
export function mapColorsToRoles(colors) {
  //map color objects in a Color, Role mapping
  //JSON cant send map objects apparently, so convert to array of arrays
  //To DO: properly deserialize maps on the api side, not priority at this moment
  let colorsWithRoles = [];
  colors.forEach((color, index) => {
    colorsWithRoles.push([color, null]); // null role by default

    //assign roles based on position
    switch (index) {
      case 0:
        colorsWithRoles[index][1] = ColorRole.PRIMARY;
        break;
      case 1:
        colorsWithRoles[index][1] = ColorRole.SECONDARY;
        break;
      case 4:
        colorsWithRoles[index][1] = ColorRole.BACKGROUND;
        break;
      case 5:
        colorsWithRoles[index][1] = ColorRole.TEXT;
        break;
    }
  });

  //Convert colorsWithRoles from 2D array to a map for Palette constructor
  return new Map(colorsWithRoles);
}
