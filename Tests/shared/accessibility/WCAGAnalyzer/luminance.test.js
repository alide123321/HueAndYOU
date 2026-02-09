/**
 * @file luminance.test.js
 * Tests for WCAGAnalyzer luminance calculation.
 */

import {WCAGAnalyzer} from '../../../../shared/accessibility/WCAGAnalyzer.js';

describe('WCAGAnalyzer', () => {
  test('luminance should compute correct relative luminance for known values', () => {
    const whiteLum = WCAGAnalyzer.luminance(255, 255, 255); // should be ~1
    const blackLum = WCAGAnalyzer.luminance(0, 0, 0); // should be 0

    expect(whiteLum).toBeCloseTo(1, 3);
    expect(blackLum).toBeCloseTo(0, 3);
  });
});
