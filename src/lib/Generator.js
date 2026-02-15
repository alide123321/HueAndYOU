import {GenerationSettings} from '../../shared/types/GenerationSettings.js';
import {ColorHarmony} from '../../shared/utils/constants.js';
import {Complementary as ComplementaryOKLCH} from '../harmony/ComplementaryOKLCH.js';
import {Complementary as ComplementaryHSL} from '../harmony/ComplementaryHSL.js';
import {Monochromatic} from '../harmony/Monochromatic.js';
import {Triadic} from '../harmony/Triadic.js';
import {Analogous} from '../harmony/Analogous.js';
import {Tetradic} from '../harmony/Tetradic.js';

/**
 * Generator class
 * @author Ian Timchak
 */
export class Generator {
  constructor() {
    this.generationSettings = null;
    this.selectedStrategy = null;
  }

  applySettings(settings) {
    this.generationSettings = settings;

    switch (settings.harmonyType) {
      case ColorHarmony.COMPLEMENTARY:
        // Switch between OKLCH and HSL if desired
        this.selectedStrategy = new ComplementaryOKLCH();
        // this.selectedStrategy = new ComplementaryHSL();
        break;

      case ColorHarmony.MONOCHROMATIC:
        console.log('CAP-23: Monochromatic strategy selected');
        this.selectedStrategy = new Monochromatic();
        break;

      case ColorHarmony.TRIADIC:
        console.log('CAP-24: Triadic strategy selected');
        this.selectedStrategy = new Triadic();
        break;

      case ColorHarmony.ANALOGOUS:
        this.selectedStrategy = new Analogous();
        break;

      case ColorHarmony.TETRADIC:
        console.log('CAP-25: Tetradic strategy selected');
        this.selectedStrategy = new Tetradic();
        break;

      default:
        throw new Error(`Unsupported harmony type: ${settings.harmonyType}`);
    }
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
      this.generationSettings.seed = baseSeed + i;
      const palette = this.selectedStrategy.buildPalette(this.generationSettings);
      palettes.push(palette);
    }

    return palettes;
  }
}