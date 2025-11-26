import {ColorFormat} from './constants.js';
import {converter, parse, formatHex8, formatHex} from 'culori';
/**
 * Converts a color to the specified format.
 *
 * @author Ali Aldaghishy
 * @param {string | object} color - The color to convert (e.g., hex string or color object).
 * @param {string} format - The target format from ColorFormat enum (e.g., ColorFormat.HEX, ColorFormat.RGB, ColorFormat.HSL).
 * @returns {object} The converted color object with mode and color properties.
 * @throws {Error} If the format is invalid or unsupported, or if the color is out of gamut.
 */
export const convertColor = (color, format) => {
  // make sure format is valid
  if (!format) throw new Error('Format is required for color conversion');

  if (!Object.values(ColorFormat).includes(format)) {
    throw new Error(`Unsupported color format: ${format}`);
  }

  if (format === ColorFormat.HEX) {
    const hslColor = convertColor(color, ColorFormat.HSL);
    return {
      mode: 'hex',
      value: formatHex(hslColor),
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
    if (color.mode) {
      parsedColor = color;
    } else {
      // Infer mode based on properties
      if (color.l !== undefined && color.c !== undefined) {
        parsedColor = {mode: 'oklch', ...color};
      } else if (color.h !== undefined && color.s !== undefined) {
        parsedColor = {mode: 'hsl', ...color};
      } else {
        parsedColor = {mode: 'rgb', ...color};
      }
    }
  }

  const result = toFormat(parsedColor);

  // Check if converting to RGB produces out-of-gamut values
  if (format === ColorFormat.RGB) {
    if (
      result.r < 0 ||
      result.r > 1 ||
      result.g < 0 ||
      result.g > 1 ||
      result.b < 0 ||
      result.b > 1
    ) {
      throw new Error(
        'Color is out of RGB gamut - the requested color cannot be represented in RGB'
      );
    }
  }

  return result;
};
