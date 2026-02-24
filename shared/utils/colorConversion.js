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
  if (typeof color === 'string' || color?.mode === 'hex') {
    // Normalise oklch / oklab comma-separated input to CSS Level 4 space syntax
    let colorStr = typeof color === 'string' ? color : color;
    if (typeof colorStr === 'string') {
      colorStr = colorStr.replace(
        /\b(oklch|oklab)\(\s*([^)]+)\)/i,
        (_, fn, args) =>
          `${fn}(${args.replace(/,/g, ' ').replace(/°/g, '').replace(/%/g, '').replace(/\s+/g, ' ').trim()})`
      );
    }
    parsedColor = parse(colorStr);
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

  // If converting to RGB and out of gamut, auto-gamut-map via toGamut
  if (format === ColorFormat.RGB) {
    if (
      result.r < 0 ||
      result.r > 1 ||
      result.g < 0 ||
      result.g > 1 ||
      result.b < 0 ||
      result.b > 1
    ) {
      const gamutMapped = toGamut(parsedColor);
      return toFormat(gamutMapped);
    }
  }

  return result;
};

/**
 * Ensures an OKLCH color is within RGB gamut by iteratively reducing chroma.
 *
 * @author Ali Aldaghishy
 * @param {object} colorOK - An OKLCH color object with l, c, h, and mode properties.
 * @returns {object} A gamut-mapped OKLCH color object safe for RGB conversion.
 */
export const toGamut = (colorOK) => {
  const toRgb = converter('rgb');
  let color = {...colorOK};

  // Try converting to RGB
  const rgb = toRgb(color);

  // Check if in gamut
  if (
    rgb.r >= 0 &&
    rgb.r <= 1 &&
    rgb.g >= 0 &&
    rgb.g <= 1 &&
    rgb.b >= 0 &&
    rgb.b <= 1
  ) {
    return color; // Already in gamut
  }

  // Reduce chroma until in gamut
  const step = 0.0005;
  while (color.c > 0) {
    color.c = Math.max(0, color.c - step);
    const testRgb = toRgb(color);
    if (
      testRgb.r >= 0 &&
      testRgb.r <= 1 &&
      testRgb.g >= 0 &&
      testRgb.g <= 1 &&
      testRgb.b >= 0 &&
      testRgb.b <= 1
    ) {
      return color;
    }
  }

  return color; // Fully desaturated
};
