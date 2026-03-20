/**
 * Constants for Color Harmony Types
 * @author Ali Aldaghishy
 * @modification Ian Timchak - disabled unimplemented types for prototype
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
 * @modification Ian Timchak - disabled unimplemented filters for prototype
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

/**
 * Constants for color roles
 * @author Ian Timchak
 * @enum {string}
 */
export const ColorRole = Object.freeze({
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  ACCENT: 'accent',
  ALERT: 'alert',
  BACKGROUND: 'background',
  TEXT: 'text',
});

/**
 * Per-harmony offset config: which opts key to vary, and its valid range.
 * Shared between server (Generator) and client (UI sliders).
 * @author Ali Aldaghishy
 * @enum {Object}
 * @readonly
 */
export const OFFSET_CONFIG = Object.freeze({
  [ColorHarmony.ANALOGOUS]: Object.freeze({
    key: 'hueOffset',
    min: 10,
    max: 90,
    default: 45,
  }),
  [ColorHarmony.TRIADIC]: Object.freeze({
    key: 'rotationOffset',
    min: 90,
    max: 150,
    default: 120,
  }),
  [ColorHarmony.TETRADIC]: Object.freeze({
    key: 'rotationOffset',
    min: 45,
    max: 135,
    default: 90,
  }),
});
