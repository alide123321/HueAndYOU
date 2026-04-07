import {describe, it, expect} from '@jest/globals';
import {convertColor} from '../../../shared/utils/colorConversion.js';
import {ColorFormat} from '../../../shared/utils/constants.js';

describe('OKLCH chroma range', () => {
  it('should produce chroma in 0–0.4 range for a vivid color (not inflated by un-normalized RGB)', () => {
    // Pure red #ff0000: RGB values must be normalized to 0–1 before conversion
    const result = convertColor(
      {mode: 'rgb', r: 1, g: 0, b: 0},
      ColorFormat.OKLCH
    );
    expect(result).toHaveProperty('mode', 'oklch');
    expect(result.c).toBeGreaterThan(0);
    expect(result.c).toBeLessThanOrEqual(0.4);
  });
});
