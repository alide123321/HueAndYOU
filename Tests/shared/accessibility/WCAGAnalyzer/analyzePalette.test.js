/**
 * @file analyzePalette.test.js
 * Tests for WCAGAnalyzer palette analysis.
 */

import {WCAGAnalyzer} from '../../../../shared/accessibility/WCAGAnalyzer.js';
import {WCAGReport} from '../../../../shared/types/WCAGReport.js';
import {WCAGColorResult} from '../../../../shared/types/WCAGColorResult.js';
import {Palette} from '../../../../shared/types/Palette.js';
import {Color} from '../../../../shared/types/Color.js';
import {ColorRole} from '../../../../shared/utils/constants.js';

describe('WCAGAnalyzer', () => {
  test('analyzePalette returns WCAGReport with correct structure', () => {
    const white = new Color(255, 255, 255);
    const black = new Color(0, 0, 0);
    const red = new Color(200, 0, 0);

    // Mirror real palette role assignment (same as mapColorsToRoles in Complementary.js)
    const colorMap = new Map([
      [white, ColorRole.BACKGROUND],
      [black, ColorRole.TEXT],
      [red, ColorRole.PRIMARY],
    ]);

    const palette = new Palette(colorMap, false);

    const report = WCAGAnalyzer.analyzePalette(palette);

    expect(report).toBeInstanceOf(WCAGReport);

    // background / text mapping
    expect(report.background).toEqual(white);
    expect(report.text).toEqual(black);

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
