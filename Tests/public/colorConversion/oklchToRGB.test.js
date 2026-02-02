import {describe, it, expect} from '@jest/globals';
import {convertColor} from '../../../shared/utils/colorConversion.js';
import {ColorFormat} from '../../../shared/utils/constants.js';

describe('convertColor', () => {
  it('should convert OKLCH to RGB', () => {
    const result = convertColor({l: 0.5, c: 0.2, h: 30}, ColorFormat.RGB);
    expect(result).toHaveProperty('mode', 'rgb');
    expect(result.r).toBeCloseTo(0.7294117647);
    expect(result.g).toBeCloseTo(0.0509803922);
    expect(result.b).toBeCloseTo(0.0039215686);
  });
});
