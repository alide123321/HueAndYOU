import {describe, it, expect} from '@jest/globals';
import {convertColor} from '../../../shared/utils/colorConversion.js';
import {ColorFormat} from '../../../shared/utils/constants.js';

describe('convertColor', () => {
  it('OKLCH achromatic (c = 0) should produce equal RGB channels', () => {
    const result = convertColor({l: 0.5, c: 0, h: 0}, ColorFormat.RGB);
    expect(result).toHaveProperty('mode', 'rgb');
    // achromatic should have r ~= g ~= b
    expect(result.r).toBeCloseTo(result.g, 6);
    expect(result.g).toBeCloseTo(result.b, 6);
  });
});
