import {describe, it, expect} from '@jest/globals';
import {convertColor} from '../../../shared/utils/colorConversion.js';
import {ColorFormat} from '../../../shared/utils/constants.js';

describe('convertColor', () => {
  it('should convert OKLCH to HEX', () => {
    const result = convertColor(
      {l: 0.6, c: 0.25, h: 0, mode: 'oklch'},
      ColorFormat.HEX
    );
    expect(result).toHaveProperty('mode', 'hex');
    expect(result.value).toBe('#e9007a');
  });
});
