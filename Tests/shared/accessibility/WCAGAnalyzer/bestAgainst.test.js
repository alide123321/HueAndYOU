/**
 * @file bestAgainst.test.js
 * Tests for WCAGAnalyzer bestAgainst logic.
 */

import {WCAGAnalyzer} from '../../../../shared/accessibility/WCAGAnalyzer.js';
import {Palette} from '../../../../shared/types/Palette.js';
import {Color} from '../../../../shared/types/Color.js';
import {ColorRole} from '../../../../shared/utils/constants.js';

describe('WCAGAnalyzer', () => {
  test('bestAgainst correctly identifies bg or text as higher contrast', () => {
    const colors = [
      [new Color(180, 180, 180), null],
      [new Color(50, 50, 50), 'bg'],
    ];

    const palette = new Palette(new Map(colors), false);

    const report = WCAGAnalyzer.analyzePalette(palette);
    const result0 = report.results[0];

    expect([ColorRole.BACKGROUND, ColorRole.TEXT]).toContain(
      result0.bestAgainst
    );
  });
});
