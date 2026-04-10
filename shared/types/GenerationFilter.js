/**
 * GenerationFilter.js
 * Defines structure for the filter setting in Generation settings.
 * @author Ian
 * @property {dictionary} colorBlindMode - Settings for color blind mode.
 * @property {dictionary} colorStyle - Settings for color style.
 * @module shared/types/GenerationFilter
 */
export class GenerationFilter {
  constructor(colorBlindMode = {}, colorStyle = {}) {
    this.colorBlindMode = colorBlindMode;
    this.colorStyle = colorStyle;
  }
}
