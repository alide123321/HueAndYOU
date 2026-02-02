/**
 * @file computePairContrast.test.js
 * Tests for WCAGAnalyzer contrast ratio computation.
 */

import {WCAGAnalyzer} from '../../../../shared/accessibility/WCAGAnalyzer.js';
import {Color} from '../../../../shared/types/Color.js';

describe('WCAGAnalyzer', () => {
  test('computePairContrast produces correct contrast ratio', () => {
    const white = new Color(255, 255, 255);
    const black = new Color(0, 0, 0);

    const ratio = WCAGAnalyzer.computePairContrast(white, black);
    //console.warn(ratio);

    // WCAG states white on black = 21:1
    expect(ratio).toBeCloseTo(21, 1);
  });
});
