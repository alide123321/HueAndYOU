import {describe, it, expect} from '@jest/globals';
import {convertColor} from '../../../shared/utils/colorConversion.js';
import {ColorFormat} from '../../../shared/utils/constants.js';

describe('convertColor', () => {
  it('OKLCH with L=0 should produce black', () => {
    const result = convertColor({l: 0, c: 0, h: 120}, ColorFormat.RGB);
    expect(result).toHaveProperty('mode', 'rgb');
    expect(result.r).toBeCloseTo(0);
    expect(result.g).toBeCloseTo(0);
    expect(result.b).toBeCloseTo(0);
  });
});
