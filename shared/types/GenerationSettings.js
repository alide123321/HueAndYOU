import {ColorHarmony} from '../utils/constants.js'; //relocate to shared later
import {Color} from './Color.js';

/**
 * GenerationSettings class to encapsulate settings for color generation.
 * @author Ian
 * @property {ColorHarmony} harmonyType - The type of color harmony to use.
 * @property {Color} baseColor - The base color in hex format.
 * @property {number} numberOfColors - The number of colors to generate.
 * @property {object} filters - The filters to apply during generation.
 * @property {boolean} isLightMode - Whether to use light mode.
 * @property {boolean} includeBgTextColors - Whether to include background and text colors.
 * @property {object} opts - Additional options for generation, such as harmony type specifics.
 * @module shared/types/GenerationSettings
 *
 */
export class GenerationSettings {
  constructor(gs = {}) {
    this.harmonyType = gs.harmonyType || ColorHarmony.COMPLEMENTARY;
    this.baseColor = gs.baseColor || new Color('#FFFFFF');
    this.numberOfColors = gs.numberOfColors || 2;
    this.numberOfPalettes = gs.numberOfPalettes || 5;
    this.filters = gs.filters || {};
    this.isLightMode = gs.isLightMode;
    this.includeBgTextColors = gs.includeBgTextColors || false;
    this.opts = gs.opts || {};
  }

  /**
   * getSettings()
   * Returns the current generation settings as an object.
   * @author Ian
   * @returns {object} The current generation settings.
   */
  getSettings() {
    return {
      harmonyType: this.harmonyType,
      baseColor: this.baseColor,
      numberOfColors: this.numberOfColors,
      filters: this.filters,
      isLightMode: this.isLightMode,
      includeBgTextColors: this.includeBgTextColors,
      opts: this.opts,
    };
  }
}
