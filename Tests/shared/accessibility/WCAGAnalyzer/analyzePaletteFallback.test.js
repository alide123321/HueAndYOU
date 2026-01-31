/**
 * @file analyzePaletteFallback.test.js
 * Tests for WCAGAnalyzer palette analysis fallback behavior.
 */

import {WCAGAnalyzer} from '../../../../shared/accessibility/WCAGAnalyzer.js';
import {Palette} from '../../../../shared/types/Palette.js';
import {Color} from '../../../../shared/types/Color.js';

describe('WCAGAnalyzer', () => {
  test('analyzePalette uses fallback bg/text when none are provided (light mode)', () => {
    const palette = new Palette(
      new Map([[new Color(50, 50, 50), null]]), // single color
      false // light theme
    );

    const report = WCAGAnalyzer.analyzePalette(palette);

    // bg should default to white, text to black
    expect(report.background.r).toBe(255);
    expect(report.background.g).toBe(255);
    expect(report.background.b).toBe(255);

    expect(report.text.r).toBe(0);
    expect(report.text.g).toBe(0);
    expect(report.text.b).toBe(0);
  });

  test('analyzePalette uses fallback bg/text in dark theme', () => {
    const palette = new Palette(
      new Map([[new Color(200, 200, 200), null]]),
      true // dark theme
    );

    const report = WCAGAnalyzer.analyzePalette(palette);

    // dark theme defaults → bg=black text=white
    expect(report.background.r).toBe(0);
    expect(report.text.r).toBe(255);
  });
});
