//Concrete Complementary Harmony Strategy
import { GenerationSettings } from '../../shared/types/GenerationSettings.js';
import { Palette } from '../../shared/types/Palette.js';
import { Color } from '../../shared/types/Color.js';
import { HarmonyStrategy } from './HarmonyStrategy.js';

//temporary conversion code.
import { rgbToOklch, oklchToRgb } from '../../shared/utils/tempColorConversion.js';

// lighten and darken helpers
// const lighten = (colorOK, amount) => {
//     return {
//         ...colorOK,
//         l: Math.min(colorOK.l + amount, 1)
//     }
// };

const darken = (colorOK, amount) => {
    return {
        ...colorOK,
        l: Math.max(colorOK.l - amount, 0)
    }
};

/**
 * Complementary.js
 * Implements the Complementary color harmony strategy.
 * @author Ian Timchak
 * @module src/harmony/Complementary
 * @extends HarmonyStrategy
 */
export class Complementary extends HarmonyStrategy {
    /**
     * constructor
     * Constructor for Complementary harmony strategy.
     * @author Ian Timchak
     * @constructor
     * @param {GenerationSettings} gs - The generation settings.
     */
    constructor() {
        super();
    }

    /**
     * buildPalette(gs: GenerationSettings): Palette
     * Generates a complementary color palette based on the provided generation settings.
     * @author Ian Timchak
     * @param {GenerationSettings} gs - The generation settings.
     * @returns {Palette} The generated complementary color palette.
     */
    buildPalette(gs) {
        const baseColor = {
            ...gs.baseColor.getRGB(),
            mode: 'rgb'
        } // {r:..., g:..., b:..., mode:'rgb'}

        // convert to okLCH
        // {l:..., c:..., h:..., mode:'oklch'}
        const baseColorOK = rgbToOklch(baseColor);

        // calculate complementary color in okLCH
        const complementaryOK = {
            ...baseColorOK,
            h: (baseColorOK.h + 180) % 360
        }


        //const baseLight = lighten(baseColorOK, .20);
        const baseDarkOK = darken(baseColorOK, .20);

        const complementaryDarkOK = darken(complementaryOK, .20);

        const paletteOK = [
            baseColorOK,
            complementaryOK,
            baseDarkOK,
            complementaryDarkOK
        ]

        // generates bg and text colors if specified
        if (gs.includeBgTextColors) {
            // Background + Text colors use the BASE hue.
            // Light mode → near-white background + near-black text
            // Dark mode → near-black background + near-white text

            const hue = baseColorOK.h;
            const chroma = baseColorOK.c * 0.05;
            // small chroma keeps the tint extremely subtle but present

            if (gs.isLightMode) {
                // Light background (very slightly tinted)
                const bgOK = {
                    l: 0.98,          // near-white
                    c: chroma,
                    h: hue,
                    mode: 'oklch',
                };


                // Text color (dark, slightly tinted)
                const textOK = {
                    l: 0.10,          // near-black
                    c: chroma,
                    h: hue,
                    mode: 'oklch',
                };

                paletteOK.push(bgOK, textOK);
            } else {
                // Dark background (deep, subtle tint)
                const bgOK = {
                    l: 0.08,         // near-black
                    c: chroma,
                    h: hue,
                    mode: 'oklch',
                };


                // Light text color (near-white)
                const textOK = {
                    l: 0.95,         // near-white
                    c: chroma,
                    h: hue,
                    mode: 'oklch',
                };

                paletteOK.push(bgOK, textOK);
            }
        }

        //Map to rgb and return Color object
        const colors = paletteOK.map(ok => {
            const rgb = oklchToRgb(ok);
            return new Color(rgb.r, rgb.g, rgb.b);
        });

        return new Palette(colors);
    }
}

