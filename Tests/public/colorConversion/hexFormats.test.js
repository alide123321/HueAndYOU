import {describe, it, expect} from '@jest/globals';
import {convertColor} from '../../../shared/utils/colorConversion.js';
import {ColorFormat} from '../../../shared/utils/constants.js';

describe('convertColor', () => {
  it('should handle different hex formats', () => {
    const result1 = convertColor('#fff', ColorFormat.RGB);
    expect(result1.r).toBeCloseTo(1);
    expect(result1.g).toBeCloseTo(1);
    expect(result1.b).toBeCloseTo(1);

    const result2 = convertColor('#ffffff', ColorFormat.RGB);
    expect(result2.r).toBeCloseTo(1);
    expect(result2.g).toBeCloseTo(1);
    expect(result2.b).toBeCloseTo(1);
  });
});
