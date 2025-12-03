import { Complementary } from '../../../src/harmony/ComplementaryHSL.js';
import { GenerationSettings } from '../../../shared/types/GenerationSettings.js';
import { Color } from '../../../shared/types/Color.js';
import { Palette } from '../../../shared/types/Palette.js';

// HSL conversion module
import { rgbToHsl } from '../../../shared/utils/tempColorConversion.js';

describe('Complementary Harmony Strategy (HSL)', () => {

    test('should instantiate without errors', () => {
        const strat = new Complementary();
        expect(strat).toBeInstanceOf(Complementary);
    });

    test('should generate a Palette instance', () => {
        const gs = new GenerationSettings({
            baseColor: Color.fromHex('#00ff00'),
            includeBgTextColors: false
        });

        const strat = new Complementary();
        const palette = strat.buildPalette(gs);

        expect(palette).toBeInstanceOf(Palette);
        expect(Array.isArray(palette.colorMap)).toBe(true);
    });

    test('should generate complementary colors correctly (HSL hue)', () => {
        const base = Color.fromHex('#00ff00');

        const gs = new GenerationSettings({
            baseColor: base,
            includeBgTextColors: false
        });

        const strat = new Complementary();
        const palette = strat.buildPalette(gs);

        const baseHsl = rgbToHsl({ ...base.getRGB(), mode: 'rgb' });

        const complement = palette.colorMap[1];
        const complementHsl = rgbToHsl({ ...complement.getRGB(), mode: 'rgb' });

        const expectedHue = (baseHsl.h + 180) % 360;
        const diff = Math.abs(complementHsl.h - expectedHue);

        expect(diff).toBeLessThan(0.5); // small floating point error tolerance
    });

    test('should add bg/text colors when includeBgTextColors = true', () => {
        const gs = new GenerationSettings({
            baseColor: Color.fromHex('#526aec'),
            includeBgTextColors: true,
            isLightMode: true
        });

        const strat = new Complementary();
        const palette = strat.buildPalette(gs);

        // Base + complement + two dark variants = 4
        // BG + Text = +2
        console.log(palette.visualize());
        expect(palette.colorMap.length).toBe(6);
    });

    test('should create light-mode bg as near-white (HSL)', () => {
        const gs = new GenerationSettings({
            baseColor: Color.fromHex('#00ff00'),
            includeBgTextColors: true,
            isLightMode: true
        });

        const strat = new Complementary();
        const palette = strat.buildPalette(gs);

        const bg = palette.colorMap[4]; // bg index
        const bgHsl = rgbToHsl({ ...bg.getRGB(), mode: 'rgb' });

        // In HSL:
        //   near-white → lightness close to 1
        expect(bgHsl.l).toBeGreaterThan(0.90);
    });

    test('should create dark-mode bg as near-black (HSL)', () => {
        const gs = new GenerationSettings({
            baseColor: Color.fromHex('#3366ff'),
            includeBgTextColors: true,
            isLightMode: false
        });

        const strat = new Complementary();
        const palette = strat.buildPalette(gs);
        console.log(palette);

        const bg = palette.colorMap[4];
        const bgHsl = rgbToHsl({ ...bg.getRGB(), mode: 'rgb' });

        // In HSL:
        //   near-black → lightness close to 0
        expect(bgHsl.l).toBeLessThan(0.15);
    });
});
