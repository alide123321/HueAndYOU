import {describe, it, expect} from '@jest/globals';
import {convertColor} from '../../../shared/utils/colorConversion.js';

describe('convertColor', () => {
  it('should throw error when format is unsupported', () => {
    expect(() => convertColor('#ff0000', 'invalid')).toThrow(
      'Unsupported color format: invalid'
    );
    expect(() => convertColor('#ff0000', 'cmyk')).toThrow(
      'Unsupported color format: cmyk'
    );
  });
});
