/**
 * @class WCAGReport
 * The structure to be returned when requesting a palette evaluation.
 *
 * @author Ian Timchak
 *
 */
export class WCAGReport {
  /**
   *
   * @param {Color} background
   * @param {Color} text
   * @param {WCAGColorResult[]} results
   */
  constructor(background, text, results) {
    this.background = background;
    this.text = text;
    this.results = results;

    // derive summary
    let passAA = 0;
    let passAAA = 0;
    let fail = 0;

    for (const r of results) {
      if (r.wcagLabel === 'AAA') passAAA++;
      else if (r.wcagLabel === 'AA') passAA++;
      else fail++;
    }

    this.summary = {
      total: results.length,
      passAA,
      passAAA,
      fail,
    };
  }

  //accessors
  /**
   * getSummary()
   * @author Ian Timchak
   * @returns summary object total checks, #AA passes, #AAA passes, #fails.
   */
  getSummary() {
    return this.summary;
  }

  /**
   * getColorResults()
   * @author Ian Timchak
   * @returns list of individual color reports
   */
  getColorResults() {
    return this.results;
  }

  /**
   * Finds the WCAGColorResult for a specific Color within this report.
   * @author Ali Aldaghishy
   * @param {Color} color
   * @returns {WCAGColorResult|null}
   */
  findResultForColor(color) {
    const targetHex = color.getHEX().value;
    return (
      this.results.find(
        (result) => result.getColor().getHEX().value === targetHex
      ) ?? null
    );
  }

  //logical operations
  /**
   * passes()
   * @author Ian Timchak
   * @returns true: no fails || false: > 0 fails.
   */
  passes() {
    return this.summary.fail === 0;
  }
}
