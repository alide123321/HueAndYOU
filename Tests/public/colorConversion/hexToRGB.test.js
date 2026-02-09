import {describe, it, expect} from '@jest/globals';
import {convertColor} from '../../../shared/utils/colorConversion.js';
import {ColorFormat} from '../../../shared/utils/constants.js';

describe('convertColor', () => {
  it('should convert hex to RGB', () => {
    const result = convertColor('#ff0000', ColorFormat.RGB);
    expect(result).toHaveProperty('mode', 'rgb');
    expect(result.r).toBeCloseTo(1);
    expect(result.g).toBeCloseTo(0);
    expect(result.b).toBeCloseTo(0);
  });
});
