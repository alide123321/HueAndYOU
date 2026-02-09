import {describe, it, expect} from '@jest/globals';
import {convertColor} from '../../../shared/utils/colorConversion.js';
import {ColorFormat} from '../../../shared/utils/constants.js';

describe('convertColor', () => {
  it('should convert RGB object to OKLCH', () => {
    const result = convertColor({r: 0, g: 0, b: 25 / 255}, ColorFormat.OKLCH);
    expect(result).toHaveProperty('mode', 'oklch');
    expect(result.l).toBeCloseTo(0.0965);
    expect(result.c).toBeCloseTo(0.0668);
    expect(result.h).toBeCloseTo(264.05);
  });
});
