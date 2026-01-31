import {describe, it, expect} from '@jest/globals';
import {convertColor} from '../../../shared/utils/colorConversion.js';
import {ColorFormat} from '../../../shared/utils/constants.js';

describe('convertColor', () => {
  it('should convert hex to HSL', () => {
    const result = convertColor('#00ff00', ColorFormat.HSL);
    expect(result).toHaveProperty('mode', 'hsl');
    expect(result.h).toBeCloseTo(120);
    expect(result.s).toBeCloseTo(1);
    expect(result.l).toBeCloseTo(0.5);
  });
});
