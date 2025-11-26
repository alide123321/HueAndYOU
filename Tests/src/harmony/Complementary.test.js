// import { Complementary } from '../../../src/harmony/ComplementaryHSL.js';
// import { GenerationSettings } from '../../../shared/types/GenerationSettings.js';
// import { Color } from '../../../shared/types/Color.js';
// import { convertColor } from '../../../public/CommonCode/colorConversion.js';
// import { Palette } from '../../../shared/types/Palette.js';
// import { ColorFormat } from '../../../public/CommonCode/constants.js';

// //debug
// import { rgbToHsl, oklchToRgb, rgbToHsl } from '../../../shared/utils/tempColorConversion.js';

// describe('Complementary Harmony Strategy', () => {
//     test('should instantiate without errors', () => {
//         const strat = new Complementary();
//         expect(strat).toBeInstanceOf(Complementary);
//     });

//     test('should generate a Palette instance', () => {
//         const gs = new GenerationSettings({
//             baseColor: Color.fromHex('#00ff00'),   // blue
//             includeBgTextColors: false
//         });

//         const strat = new Complementary();
//         const palette = strat.buildPalette(gs);

//         expect(palette).toBeInstanceOf(Palette);
//         expect(Array.isArray(palette.colors)).toBe(true);
//         //Uncomment the console.log sections to generate an html block that can view the results
//         //console.log(palette.visualize());
//     });

//     test('should generate complementary colors correctly', () => {
//         const base = Color.fromHex('#00ff00');  // blue

//         const gs = new GenerationSettings({
//             baseColor: base,
//             includeBgTextColors: false
//         });

//         const strat = new Complementary();
//         const palette = strat.buildPalette(gs);

//         // Convert base → OKLCH to check expected complement hue
//         const baseOK = rgbToHsl(
//             { ...base.getRGB(), mode: 'rgb' }
//         );

//         const complement = palette.colors[1]; // expected: complementary color
//         const complementOK = rgbToHsl(
//             { ...complement.getRGB(), mode: 'rgb' }
//         );

//         const expectedHue = (baseOK.h + 180) % 360;
//         const diff = Math.abs(complementOK.h - expectedHue);

//         expect(diff).toBeLessThan(.5);    // floating point tolerance
//     });

//     test('should add bg/text colors when includeBgTextColors = true', () => {
//         const gs = new GenerationSettings({
//             baseColor: Color.fromHex('#00ff00'),
//             includeBgTextColors: true,
//             isLightMode: true
//         });

//         const strat = new Complementary();
//         const palette = strat.buildPalette(gs);

//         // Original palette entries: 4
//         // BG + Text: +2
//         //console.log(palette.visualize());
//         expect(palette.colors.length).toBe(6);
//     });

//     test('should create light-mode bg as near-white', () => {
//         const gs = new GenerationSettings({
//             baseColor: Color.fromHex('#00ff00'),
//             includeBgTextColors: true,
//             isLightMode: true
//         });

//         const strat = new Complementary();
//         const palette = strat.buildPalette(gs);

//         const bg = palette.colors[4]; // 4th index == bg

//         const bgOK = rgbToOklch({ ...bg.getRGB(), mode: 'rgb' });

//         //console.log(palette.visualize());
//         expect(bgOK.l).toBeGreaterThan(0.90);       // near-white
//         expect(bgOK.c).toBeLessThan(0.10);          // low chroma tint
//     });

//     test('should create dark-mode bg as near-black', () => {
//         const gs = new GenerationSettings({
//             baseColor: Color.fromHex('#3366ff'),
//             includeBgTextColors: true,
//             isLightMode: false
//         });

//         const strat = new Complementary();
//         const palette = strat.buildPalette(gs);

//         const bg = palette.colors[4]; // 4th index == bg
//         const bgOK = rgbToOklch({ ...bg.getRGB(), mode: 'rgb' });

//         console.log(palette.visualize());
//         expect(bgOK.l).toBeLessThan(0.15);   // near-black
//         expect(bgOK.c).toBeLessThan(0.10);   // low chroma tint  
//     });
// });



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
        expect(Array.isArray(palette.colors)).toBe(true);
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

        const complement = palette.colors[1];
        const complementHsl = rgbToHsl({ ...complement.getRGB(), mode: 'rgb' });

        const expectedHue = (baseHsl.h + 180) % 360;
        const diff = Math.abs(complementHsl.h - expectedHue);

        expect(diff).toBeLessThan(0.5); // small floating point error tolerance
    });

    test('should add bg/text colors when includeBgTextColors = true', () => {
        const gs = new GenerationSettings({
            baseColor: Color.fromHex('#00ff00'),
            includeBgTextColors: true,
            isLightMode: true
        });

        const strat = new Complementary();
        const palette = strat.buildPalette(gs);

        // Base + complement + two dark variants = 4
        // BG + Text = +2
        expect(palette.colors.length).toBe(6);
    });

    test('should create light-mode bg as near-white (HSL)', () => {
        const gs = new GenerationSettings({
            baseColor: Color.fromHex('#00ff00'),
            includeBgTextColors: true,
            isLightMode: true
        });

        const strat = new Complementary();
        const palette = strat.buildPalette(gs);

        const bg = palette.colors[4]; // bg index
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

        const bg = palette.colors[4];
        const bgHsl = rgbToHsl({ ...bg.getRGB(), mode: 'rgb' });

        // In HSL:
        //   near-black → lightness close to 0
        expect(bgHsl.l).toBeLessThan(0.15);
    });
});
