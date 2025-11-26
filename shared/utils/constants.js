/**
 * Constants for Color Harmony Types
 * @author Ali Aldaghishy
 * @readonly
 * @enum {string}
 */
export const ColorHarmony = Object.freeze({
  COMPLEMENTARY: 'complementary',
  ANALOGOUS: 'analogous',
  TRIADIC: 'triadic',
  TETRADIC: 'tetradic',
  MONOCHROMATIC: 'monochromatic',
});

/**
 * Constants for filter types
 * @author Ali Aldaghishy
 * @readonly
 * @enum {string}
 */
export const FilterType = Object.freeze({
  DARK_MODE: 'dark_mode',
  LIGHT_MODE: 'light_mode',
  HIGH_CONTRAST: 'high_contrast',
  PROTANOPIA: 'protanopia',
  DEUTERANOPIA: 'deuteranopia',
  TRITANOPIA: 'tritanopia',
});

/**
 * Constants for color formats
 * reference https://culorijs.org/api/#color-spaces
 * @author Ali Aldaghishy
 * @readonly
 * @enum {string}
 */
export const ColorFormat = Object.freeze({
  HEX: 'hex',
  RGB: 'rgb',
  HSL: 'hsl',
  OKLCH: 'oklch',
});
