import {describe, it, expect} from '@jest/globals';
import {convertColor} from '../../../shared/utils/colorConversion.js';
import {ColorFormat} from '../../../shared/utils/constants.js';

describe('convertColor', () => {
  it('should convert RGB object to HEX', () => {
    const result = convertColor({r: 0, g: 0, b: 25 / 255}, ColorFormat.HEX);
    expect(result).toHaveProperty('mode', 'hex');
    expect(result.value).toBe('#000019');
  });
});
