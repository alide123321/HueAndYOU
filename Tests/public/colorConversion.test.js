import {describe, it, expect} from '@jest/globals';
import {convertColor} from '../../shared/utils/colorConversion.js';
import {ColorFormat} from '../../shared/utils/constants.js';

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
    const result = convertColor({r: 0, g: 0, b: 25 / 255}, ColorFormat.HEX);
    expect(result).toHaveProperty('mode', 'hex');
    expect(result.value).toBe('#000019');
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
    const result = convertColor('#000019', ColorFormat.OKLCH);
    expect(result).toHaveProperty('mode', 'oklch');
    expect(result.l).toBeCloseTo(0.0965);
    expect(result.c).toBeCloseTo(0.0668);
    expect(result.h).toBeCloseTo(264.05);
  });

  it('should convert RGB object to OKLCH', () => {
    const result = convertColor({r: 0, g: 0, b: 25 / 255}, ColorFormat.OKLCH);
    expect(result).toHaveProperty('mode', 'oklch');
    expect(result.l).toBeCloseTo(0.0965);
    expect(result.c).toBeCloseTo(0.0668);
    expect(result.h).toBeCloseTo(264.05);
  });

  it('should convert OKLCH to RGB', () => {
    const result = convertColor({l: 0.5, c: 0.2, h: 30}, ColorFormat.RGB);
    expect(result).toHaveProperty('mode', 'rgb');
    expect(result.r).toBeCloseTo(0.7294117647);
    expect(result.g).toBeCloseTo(0.0509803922);
    expect(result.b).toBeCloseTo(0.0039215686);
  });

  it('should convert OKLCH to HEX', () => {
    const result = convertColor(
      {l: 0.6, c: 0.25, h: 0, mode: 'oklch'},
      ColorFormat.HEX
    );
    expect(result).toHaveProperty('mode', 'hex');
    expect(result.value).toBe('#e9007a');
  });

  it('OKLCH achromatic (c = 0) should produce equal RGB channels', () => {
    const result = convertColor({l: 0.5, c: 0, h: 0}, ColorFormat.RGB);
    expect(result).toHaveProperty('mode', 'rgb');
    // achromatic should have r ~= g ~= b
    expect(result.r).toBeCloseTo(result.g, 6);
    expect(result.g).toBeCloseTo(result.b, 6);
  });

  it('OKLCH with L=0 should produce black', () => {
    const result = convertColor({l: 0, c: 0, h: 120}, ColorFormat.RGB);
    expect(result).toHaveProperty('mode', 'rgb');
    expect(result.r).toBeCloseTo(0);
    expect(result.g).toBeCloseTo(0);
    expect(result.b).toBeCloseTo(0);
  });

  it('OKLCH with L=1 should produce white', () => {
    const result = convertColor({l: 1, c: 0, h: 240}, ColorFormat.RGB);
    expect(result).toHaveProperty('mode', 'rgb');
    expect(result.r).toBeCloseTo(1);
    expect(result.g).toBeCloseTo(1);
    expect(result.b).toBeCloseTo(1);
  });

  it('OKLCH hue wrapping (h and h+360) should yield same RGB', () => {
    const a = convertColor({l: 0.5, c: 0.2, h: 30}, ColorFormat.RGB);
    const b = convertColor({l: 0.5, c: 0.2, h: 390}, ColorFormat.RGB);
    expect(a.r).toBeCloseTo(b.r, 6);
    expect(a.g).toBeCloseTo(b.g, 6);
    expect(a.b).toBeCloseTo(b.b, 6);
  });

  it('hex -> OKLCH -> hex should round-trip approximately', () => {
    const start = '#e9007a';
    const oklch = convertColor(start, ColorFormat.OKLCH);
    const back = convertColor(oklch, ColorFormat.HEX);
    // formatHex returns lowercase hex in this codebase, compare directly
    expect(back.value.toLowerCase()).toBe(start);
  });
});
