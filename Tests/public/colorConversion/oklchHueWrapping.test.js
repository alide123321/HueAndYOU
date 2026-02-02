import {describe, it, expect} from '@jest/globals';
import {convertColor} from '../../../shared/utils/colorConversion.js';
import {ColorFormat} from '../../../shared/utils/constants.js';

describe('convertColor', () => {
  it('OKLCH hue wrapping (h and h+360) should yield same RGB', () => {
    const a = convertColor({l: 0.5, c: 0.2, h: 30}, ColorFormat.RGB);
    const b = convertColor({l: 0.5, c: 0.2, h: 390}, ColorFormat.RGB);
    expect(a.r).toBeCloseTo(b.r, 6);
    expect(a.g).toBeCloseTo(b.g, 6);
    expect(a.b).toBeCloseTo(b.b, 6);
  });
});
