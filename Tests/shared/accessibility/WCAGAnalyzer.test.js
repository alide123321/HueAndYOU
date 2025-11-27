/**
 * @file WCAGAnalyzer.test.js
 * Jest tests for WCAGAnalyzer, WCAGReport, and WCAGColorResult.
 */

import { WCAGAnalyzer } from '../../../shared/accessibility/WCAGAnalyzer.js';
import { WCAGReport } from '../../../shared/types/WCAGReport.js';
import { WCAGColorResult } from '../../../shared/types/WCAGColorResult.js';
import { Palette } from '../../../shared/types/Palette.js';
import { Color } from '../../../shared/types/Color.js';
import { ColorRole } from '../../../shared/utils/constants.js';

describe('WCAGAnalyzer', () => {

    // --------------------------
    //  Test luminance()
    // --------------------------
    test('luminance should compute correct relative luminance for known values', () => {
        const analyzer = new WCAGAnalyzer();

        const whiteLum = analyzer.luminance(255, 255, 255); // should be ~1
        const blackLum = analyzer.luminance(0, 0, 0);       // should be 0

        expect(whiteLum).toBeCloseTo(1, 3);
        expect(blackLum).toBeCloseTo(0, 3);
    });

    // --------------------------
    //  computePairContrast()
    // --------------------------
    test('computePairContrast produces correct contrast ratio', () => {
        const white = new Color(255, 255, 255);
        const black = new Color(0, 0, 0);

        const ratio = WCAGAnalyzer.computePairContrast(white, black);

        // WCAG states white on black = 21:1
        expect(ratio).toBeCloseTo(21, 1);
    });

    // --------------------------
    //  wcagLabel()
    // --------------------------
    test('wcagLabel assigns AA and AAA correctly', () => {
        expect(WCAGAnalyzer.wcagLabel(7.1)).toBe('AAA');
        expect(WCAGAnalyzer.wcagLabel(5.0)).toBe('AA');
        expect(WCAGAnalyzer.wcagLabel(3.0)).toBe('FAIL');
    });

    // --------------------------
    //  analyzePalette()
    // --------------------------
    test('analyzePalette returns WCAGReport with correct structure', () => {
        const colors = [
            new Color(255, 255, 255), // white
            new Color(0, 0, 0),       // black
            new Color(200, 0, 0),     // red
        ];

        const palette = new Palette(colors, { 
            0: "bg", 
            1: "text"
        }, false);

        const report = WCAGAnalyzer.analyzePalette(palette);

        expect(report).toBeInstanceOf(WCAGReport);

        // background / text mapping
        expect(report.background).toEqual(colors[0]);
        expect(report.text).toEqual(colors[1]);

        // results structure
        expect(report.results.length).toBe(3);
        expect(report.results[0]).toBeInstanceOf(WCAGColorResult);

        // summary correctness
        expect(report.summary.total).toBe(3);
        expect(report.summary.passAA + report.summary.passAAA + report.summary.fail)
            .toBe(3);
    });

    // --------------------------
    //  analyzePalette defaults when roles missing
    // --------------------------
    test('analyzePalette uses fallback bg/text when none are provided (light mode)', () => {
        const palette = new Palette(
            [new Color(50, 50, 50)],   // single color
            {},                        // no roles
            false                      // light theme
        );

        const report = WCAGAnalyzer.analyzePalette(palette);

        // bg should default to white, text to black
        expect(report.background.r).toBe(255);
        expect(report.background.g).toBe(255);
        expect(report.background.b).toBe(255);

        expect(report.text.r).toBe(0);
        expect(report.text.g).toBe(0);
        expect(report.text.b).toBe(0);
    });

    test('analyzePalette uses fallback bg/text in dark theme', () => {
        const palette = new Palette(
            [new Color(200, 200, 200)],
            {},
            true // dark theme
        );

        const report = WCAGAnalyzer.analyzePalette(palette);

        // dark theme defaults → bg=black text=white
        expect(report.background.r).toBe(0);
        expect(report.text.r).toBe(255);
    });

    // --------------------------
    //  Check bestAgainst logic
    // --------------------------
    test('bestAgainst correctly identifies bg or text as higher contrast', () => {
        const colors = [
            new Color(180, 180, 180),
            new Color(50, 50, 50)
        ];

        const palette = new Palette(
            colors,
            { 0: "bg", 1: "text" },
            false
        );

        const report = WCAGAnalyzer.analyzePalette(palette);
        const result0 = report.results[0];

        expect([ColorRole.BACKGROUND, ColorRole.TEXT]).toContain(result0.bestAgainst);
    });

});
