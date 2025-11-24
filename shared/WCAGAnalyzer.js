// WCAGAnalyzer.js

import { WCAGReport } from "./models/WCAGReport.js";

export class WCAGAnalyzer {

    // Calculate contrast ratio between two hex colors
    static calculatePairContrast(foreground, background) {
        const L1 = this._relativeLuminance(foreground);
        const L2 = this._relativeLuminance(background);

        const lighter = Math.max(L1, L2);
        const darker  = Math.min(L1, L2);

        return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
    }

    // Generate a WCAG contrast report for a full palette
    static calculatePalette(palette) {
        const report = new WCAGReport();

        // Look for roles assigned by the palette generator
        const bgRole  = palette.roles?.background || "#FFFFFF";
        const textRole = palette.roles?.text || "#000000";

        for (const color of palette.colors) {
            const contrastOnText = this.calculatePairContrast(textRole, color);
            const contrastOnBackground = this.calculatePairContrast(color, bgRole);

            const best = Math.max(contrastOnText, contrastOnBackground);

            report.entries.push({
                color,
                contrastOnText,
                contrastOnBackground,
                bestContrast: best
            });
        }

        return report;
    }

    // --- Internal Helper Methods ---

    static _relativeLuminance(hex) {
        const rgb = this._hexToRgb(hex).map(channel => {
            const c = channel / 255;
            return c <= 0.03928
                ? c / 12.92
                : Math.pow((c + 0.055) / 1.055, 2.4);
        });

        return (0.2126 * rgb[0]) + (0.7152 * rgb[1]) + (0.0722 * rgb[2]);
    }

    static _hexToRgb(hex) {
        hex = hex.replace("#", "");
        return [
            parseInt(hex.substring(0, 2), 16),
            parseInt(hex.substring(2, 4), 16),
            parseInt(hex.substring(4, 6), 16)
        ];
    }
}
