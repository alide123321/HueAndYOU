/**
 * @file analyzePalette.test.js
 * Tests for WCAGAnalyzer palette analysis.
 */

import {WCAGAnalyzer} from '../../../../shared/accessibility/WCAGAnalyzer.js';
import {WCAGReport} from '../../../../shared/types/WCAGReport.js';
import {WCAGColorResult} from '../../../../shared/types/WCAGColorResult.js';
import {Palette} from '../../../../shared/types/Palette.js';
import {Color} from '../../../../shared/types/Color.js';

describe('WCAGAnalyzer', () => {
  test('analyzePalette returns WCAGReport with correct structure', () => {
    const colors = new Map([
      [new Color(255, 255, 255), null], // white
      [new Color(0, 0, 0), null], // black
      [new Color(200, 0, 0), null], // red
    ]);

    const palette = new Palette(colors, false);

    const report = WCAGAnalyzer.analyzePalette(palette);
    //console.warn(report);

    expect(report).toBeInstanceOf(WCAGReport);

    // background / text mapping
    expect(report.background).toEqual(colors[0]);
    expect(report.text).toEqual(colors[1]);

    // results structure
    expect(report.results.length).toBe(3);
    expect(report.results[0]).toBeInstanceOf(WCAGColorResult);

    // summary correctness
    expect(report.summary.total).toBe(3);
    expect(
      report.summary.passAA + report.summary.passAAA + report.summary.fail
    ).toBe(3);
  });
});
