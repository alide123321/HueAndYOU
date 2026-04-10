//abstract-like class definition

/**
 * HarmonyStrategy serves as a base class for different color harmony strategies.
 * Each subclass should implement the buildPalette method.
 * @author Ian Timchak
 * @module src/harmony/HarmonyStrategy
 * @abstract
 */
export class HarmonyStrategy {
    /**
     * Constructor for HarmonyStrategy
     * @throws {Error} If instantiated directly.
     * @constructor
     */
    constructor() {
        if (this.constructor === HarmonyStrategy) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }
    
    /**
     * buildPalette(gs: GenerationSettings): Palette
     * @author Ian Timchak
     * @abstract
     * @param {GenerationSettings} gs - The generation settings.
     * @returns {Palette} The generated color palette.
     * @throws {Error} If the method is not implemented in the subclass.
     */
    buildPalette(gs) {
        throw new Error("Method 'buildPalette(gs)' must be implemented.");
    }
}