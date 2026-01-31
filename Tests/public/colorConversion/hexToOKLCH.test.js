import {describe, it, expect} from '@jest/globals';
import {convertColor} from '../../../shared/utils/colorConversion.js';
import {ColorFormat} from '../../../shared/utils/constants.js';

describe('convertColor', () => {
  it('should convert hex to OKLCH', () => {
    const result = convertColor('#000019', ColorFormat.OKLCH);
    expect(result).toHaveProperty('mode', 'oklch');
    expect(result.l).toBeCloseTo(0.0965);
    expect(result.c).toBeCloseTo(0.0668);
    expect(result.h).toBeCloseTo(264.05);
  });
});
