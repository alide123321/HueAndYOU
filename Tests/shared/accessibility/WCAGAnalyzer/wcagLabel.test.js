/**
 * @file wcagLabel.test.js
 * Tests for WCAGAnalyzer WCAG label assignment.
 */

import {WCAGAnalyzer} from '../../../../shared/accessibility/WCAGAnalyzer.js';

describe('WCAGAnalyzer', () => {
  test('wcagLabel assigns AA and AAA correctly', () => {
    expect(WCAGAnalyzer.wcagLabel(7.1)).toBe('AAA');
    expect(WCAGAnalyzer.wcagLabel(5.0)).toBe('AA');
    expect(WCAGAnalyzer.wcagLabel(3.0)).toBe('FAIL');
  });
});
