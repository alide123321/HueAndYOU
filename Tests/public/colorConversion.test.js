import {describe, it, expect} from '@jest/globals';
import {convertColor} from '../../public/CommonCode/colorConversion.js';
import {ColorFormat} from '../../public/CommonCode/constants.js';

describe('convertColor', () => {
  it('should throw error when format is not provided', () => {
    expect(() => convertColor('#ff0000', null)).toThrow(
      'Format is required for color conversion'
    );
    expect(() => convertColor('#ff0000', undefined)).toThrow(
      'Format is required for color conversion'
    );
  });

  it('should throw error when format is unsupported', () => {
    expect(() => convertColor('#ff0000', 'invalid')).toThrow(
      'Unsupported color format: invalid'
    );
    expect(() => convertColor('#ff0000', 'cmyk')).toThrow(
      'Unsupported color format: cmyk'
    );
  });

  it('should convert hex to RGB', () => {
    const result = convertColor('#ff0000', ColorFormat.RGB);
    expect(result).toHaveProperty('mode', 'rgb');
    expect(result.r).toBeCloseTo(1);
    expect(result.g).toBeCloseTo(0);
    expect(result.b).toBeCloseTo(0);
  });

  it('should convert hex to HSL', () => {
    const result = convertColor('#00ff00', ColorFormat.HSL);
    expect(result).toHaveProperty('mode', 'hsl');
    expect(result.h).toBeCloseTo(120);
    expect(result.s).toBeCloseTo(1);
    expect(result.l).toBeCloseTo(0.5);
  });

  it('should convert RGB object to HEX', () => {
    const result = convertColor({r: 0, g: 0, b: 1}, ColorFormat.HEX);
    expect(result).toHaveProperty('mode', 'hex');
    expect(result.value).toBe('#0000ff');
  });

  it('should convert RGB object to HSL', () => {
    const result = convertColor({r: 1, g: 0, b: 0}, ColorFormat.HSL);
    expect(result).toHaveProperty('mode', 'hsl');
    expect(result.h).toBeCloseTo(0);
    expect(result.s).toBeCloseTo(1);
    expect(result.l).toBeCloseTo(0.5);
  });

  it('should handle different hex formats', () => {
    const result1 = convertColor('#fff', ColorFormat.RGB);
    expect(result1.r).toBeCloseTo(1);
    expect(result1.g).toBeCloseTo(1);
    expect(result1.b).toBeCloseTo(1);

    const result2 = convertColor('#ffffff', ColorFormat.RGB);
    expect(result2.r).toBeCloseTo(1);
    expect(result2.g).toBeCloseTo(1);
    expect(result2.b).toBeCloseTo(1);
  });

  it('should convert HSL to RGB', () => {
    const result = convertColor({h: 240, s: 1, l: 0.5}, ColorFormat.RGB);
    expect(result).toHaveProperty('mode', 'rgb');
    expect(result.r).toBeCloseTo(0);
    expect(result.g).toBeCloseTo(0);
    expect(result.b).toBeCloseTo(1);
  });

  it('should convert HSL to HEX', () => {
    const result = convertColor({h: 0, s: 1, l: 0.5}, ColorFormat.HEX);
    expect(result).toHaveProperty('mode', 'hex');
    expect(result.value).toBe('#ff0000');
  });

  it('should convert hex to OKLCH', () => {
    const result = convertColor('#ff0000', ColorFormat.OKLCH);
    expect(result).toHaveProperty('mode', 'oklch');
    expect(result.l).toBeCloseTo(0.628);
    expect(result.c).toBeCloseTo(0.2577);
    expect(result.h).toBeCloseTo(29.23);
  });

  it('should convert RGB object to OKLCH', () => {
    const result = convertColor({r: 1, g: 0, b: 0}, ColorFormat.OKLCH);
    expect(result).toHaveProperty('mode', 'oklch');
    expect(result.l).toBeCloseTo(0.628);
    expect(result.c).toBeCloseTo(0.2577);
    expect(result.h).toBeCloseTo(29.23);
  });

  it('should convert OKLCH to RGB', () => {
    const result = convertColor({l: 0.5, c: 0.2, h: 30}, ColorFormat.RGB);
    expect(result).toHaveProperty('mode', 'rgb');
    expect(result.r).toBeCloseTo(0.73);
    expect(result.g).toBeCloseTo(0.052);
    expect(result.b).toBeCloseTo(0);
  });

  it('should convert OKLCH to HEX', () => {
    const result = convertColor({l: 0.6, c: 0.25, h: 0}, ColorFormat.HEX);
    expect(result).toHaveProperty('mode', 'hex');
    expect(result.value).toBe('#e9007a');
  });
});
