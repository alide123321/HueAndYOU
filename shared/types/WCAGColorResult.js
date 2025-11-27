/**
 * WCAGColorResult, contains the contrast result of a specific color against background and text.
 * @author Ian Timchak
 */
export class WCAGColorResult {
  /**
   *
   * @param {Number} index - index of color in palette, null if no palette
   * @param {Color} color - Color() object, the testing color.
   * @param {Number} contrastOnBg - Contrast ratio value (#.##) onBG
   * @param {Number} contrastOnText - Contrast ratio value (#.##) onText
   * @param {Number} bestContrast - What the best contrast is based on the test
   * @param {Object} bestAgainst - {role: ColorRole, color: Color}
   * @param {String} wcagLabel
   */
  constructor(
    index,
    color,
    contrastOnBg,
    contrastOnText,
    bestContrast,
    bestAgainst,
    wcagLabel
  ) {
    this.index = index;
    this.color = color;
    this.contrastOnBg = contrastOnBg;
    this.contrastOnText = contrastOnText;
    this.bestContrast = bestContrast;
    this.bestAgainst = bestAgainst; // 'background' or 'text'
    this.wcagLabel = wcagLabel; // AA, AAA, or FAIL
  }

  //accessors
  /**
   * @author Ian Timchak
   * @returns index [int of color in palette, otherwise 'null'], color (Color)
   */
  getColorMapping() {
    return this.index, this.color;
  }

  /**
   * @author Ian Timchak
   * @returns best contrast value of compared colors.
   */
  getBestContrast() {
    return this.bestContrast;
  }

  /**
   * @author Ian Timchak
   * @returns which role (bg/text) had a higher contrast as {role: ColorRole, color: Color}.
   */
  getBestAgainst() {
    return this.bestAgainst;
  }

  /**
   * @author Ian Timchak
   * @returns AA, AAA, or 'FAIL' depending on the best contrast ratio.
   */
  getLabel() {
    return this.wcagLabel;
  }

  passes() {
    return this.wcagLabel == 'FAIL';
  }
}
