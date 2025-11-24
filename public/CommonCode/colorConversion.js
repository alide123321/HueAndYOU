import {ColorFormat} from './constants.js';
import {converter, parse, formatHex8, formatHex} from 'culori';

/**
 * Converts a color to the specified format.
 *
 * @author Ali Aldaghishy
 * @param {string | object} color - The color to convert (e.g., hex string or color object).
 * @param {string} format - The target format (e.g., 'hex', 'rgb', 'hsl').
 * @returns {object} The converted color object.
 * @throws {Error} If the format is invalid or unsupported.
 */
export const convertColor = (color, format) => {
  // make sure format is valid
  if (!format) throw new Error('Format is required for color conversion');

  if (!Object.values(ColorFormat).includes(format)) {
    throw new Error(`Unsupported color format: ${format}`);
  }

  if (format === ColorFormat.HEX) {
    const rgbColor = convertColor(color, ColorFormat.RGB);
    return {
      mode: 'hex',
      value: formatHex(rgbColor),
    };
  }
  const toFormat = converter(format);
  // If color is already an object (RGB, HSL, etc.), add mode property if missing
  // Otherwise, parse the string
  let parsedColor;
  if (typeof color === 'string') {
    parsedColor = parse(color);
  } else {
    // If it's an object, ensure it has a mode property
    parsedColor = color.mode
      ? color
      : {...color, mode: color.h !== undefined ? 'hsl' : 'rgb'};
  }
  return toFormat(parsedColor);
};
