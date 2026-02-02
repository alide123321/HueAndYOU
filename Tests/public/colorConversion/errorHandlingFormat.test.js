import {describe, it, expect} from '@jest/globals';
import {convertColor} from '../../../shared/utils/colorConversion.js';

describe('convertColor', () => {
  it('should throw error when format is not provided', () => {
    expect(() => convertColor('#ff0000', null)).toThrow(
      'Format is required for color conversion'
    );
    expect(() => convertColor('#ff0000', undefined)).toThrow(
      'Format is required for color conversion'
    );
  });
});
