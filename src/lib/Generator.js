import {GenerationSettings} from '../../shared/types/GenerationSettings.js';
import {getHarmony} from '../harmony/HarmonyRegistry.js';

// Harmony Strategy imports are not unused!
// They are necessary for type annotations and registry functionality, even if not directly referenced in the code.
import {Complementary} from '../harmony/ComplementaryOKLCH.js';
import {Monochromatic} from '../harmony/Monochromatic.js';
import {Triadic} from '../harmony/Triadic.js';
import {Analogous} from '../harmony/Analogous.js';
import {Tetradic} from '../harmony/Tetradic.js';

/**
 * Generator class
 * @author Ian Timchak
 */
export class Generator {
  // controller for turning requests into palette generation
  constructor() {
    this.generationSettings = null;
    this.selectedStrategy = null;
  }

  /**
   * @author Ian Timchak, Ali Aldaghishy, DeAndre Josey
   * @param {GenerationSettings} settings
   */
  applySettings(settings) {
    this.generationSettings = settings;

    // build strategy using registry lookup
    this.selectedStrategy = getHarmony(settings.harmonyType);
  }

  generate() {
    if (!this.selectedStrategy) {
      throw new Error(
        'No generation strategy selected. Please apply settings first.'
      );
    }

    const numberOfPalettes = this.generationSettings.numberOfPalettes || 1;
    const baseSeed = this.generationSettings.seed;

    let palettes = [];

    for (let i = 0; i < numberOfPalettes; i++) {
      // update seed predictably for each palette to ensure reproducibility
      this.generationSettings.seed = baseSeed + i;
      const palette = this.selectedStrategy.buildPalette(
        this.generationSettings
      );
      palettes.push(palette);
    }

    return palettes;
  }
}
