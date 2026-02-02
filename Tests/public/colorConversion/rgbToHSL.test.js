import {describe, it, expect} from '@jest/globals';
import {convertColor} from '../../../shared/utils/colorConversion.js';
import {ColorFormat} from '../../../shared/utils/constants.js';

describe('convertColor', () => {
  it('should convert RGB object to HSL', () => {
    const result = convertColor({r: 1, g: 0, b: 0}, ColorFormat.HSL);
    expect(result).toHaveProperty('mode', 'hsl');
    expect(result.h).toBeCloseTo(0);
    expect(result.s).toBeCloseTo(1);
    expect(result.l).toBeCloseTo(0.5);
  });
});
