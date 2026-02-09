import {describe, it, expect} from '@jest/globals';
import {convertColor} from '../../../shared/utils/colorConversion.js';
import {ColorFormat} from '../../../shared/utils/constants.js';

describe('convertColor', () => {
  it('OKLCH with L=1 should produce white', () => {
    const result = convertColor({l: 1, c: 0, h: 240}, ColorFormat.RGB);
    expect(result).toHaveProperty('mode', 'rgb');
    expect(result.r).toBeCloseTo(1);
    expect(result.g).toBeCloseTo(1);
    expect(result.b).toBeCloseTo(1);
  });
});
