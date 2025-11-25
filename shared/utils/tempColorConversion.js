// tempColorConversion.js
// Explicit culori-based RGB <-> OKLCH conversion helpers

import { converter } from 'culori';

// Create culori converters
const toRgb = converter('rgb');
const toOklch = converter('oklch');

// Normalize your 0–255 rgb → culori's 0–1 rgb
function normalizeRgbInput(color) {
    return {
        mode: 'rgb',
        r: color.r / 255,
        g: color.g / 255,
        b: color.b / 255
    };
}

// Convert culori 0–1 rgb → your 0–255 rgb
function denormalizeRgbOutput(color) {
    return {
        mode: 'rgb',
        r: Math.round(color.r * 255),
        g: Math.round(color.g * 255),
        b: Math.round(color.b * 255)
    };
}

/**
 * rgbToOklch(rgb)
 * Input:  { r,g,b,mode:'rgb' } with 0–255 values
 * Output: { l,c,h,mode:'oklch' }
 */
export function rgbToOklch(rgb) {
    if (!rgb || rgb.mode !== 'rgb') {
        throw new Error('rgbToOklch: input must be { r,g,b, mode:"rgb" }');
    }

    // Convert to culori-compatible rgb (0–1)
    const culoriRgb = normalizeRgbInput(rgb);

    // Convert to oklch
    const ok = toOklch(culoriRgb); // { l,c,h, mode:'oklch' }

    return {
        mode: 'oklch',
        l: ok.l,
        c: ok.c,
        h: ok.h
    };
}

/**
 * oklchToRgb(oklch)
 * Input:  { l,c,h,mode:'oklch' }
 * Output: { r,g,b,mode:'rgb' } with 0–255 ints
 */
export function oklchToRgb(ok) {
    if (!ok || ok.mode !== 'oklch') {
        throw new Error('oklchToRgb: input must be { l,c,h, mode:"oklch" }');
    }

    // Convert to culori-format
    const culoriOklch = {
        mode: 'oklch',
        l: ok.l,
        c: ok.c,
        h: ok.h
    };

    // Convert using culori
    const rgb01 = toRgb(culoriOklch); // { r,g,b,mode:'rgb' } in 0–1

    // Back to your expected 0–255
    return denormalizeRgbOutput(rgb01);
}
