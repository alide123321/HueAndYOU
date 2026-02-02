import {describe, it, expect} from '@jest/globals';
import {convertColor} from '../../../shared/utils/colorConversion.js';
import {ColorFormat} from '../../../shared/utils/constants.js';

describe('convertColor', () => {
  it('hex -> OKLCH -> hex should round-trip approximately', () => {
    const start = '#e9007a';
    const oklch = convertColor(start, ColorFormat.OKLCH);
    const back = convertColor(oklch, ColorFormat.HEX);
    // formatHex returns lowercase hex in this codebase, compare directly
    expect(back.value.toLowerCase()).toBe(start);
  });
});
