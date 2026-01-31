import {describe, it, expect} from '@jest/globals';
import {convertColor} from '../../../shared/utils/colorConversion.js';
import {ColorFormat} from '../../../shared/utils/constants.js';

describe('convertColor', () => {
  it('should convert HSL to HEX', () => {
    const result = convertColor({h: 0, s: 1, l: 0.5}, ColorFormat.HEX);
    expect(result).toHaveProperty('mode', 'hex');
    expect(result.value).toBe('#ff0000');
  });
});
