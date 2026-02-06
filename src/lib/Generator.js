import { GenerationSettings } from '../../shared/types/GenerationSettings.js';
import { ColorHarmony } from '../../shared/utils/constants.js';
import { Palette } from '../../shared/types/Palette.js';
import { Complementary } from '../harmony/ComplementaryHSL.js';
import { Monochromatic } from '../harmony/Monochromatic.js';
import { Triadic } from '../harmony/Triadic.js';



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
   * @author Ian Timchak
   * @param {GenerationSettings} settings
   */
  applySettings(settings) {
    this.generationSettings = settings;

    // build strategy based on settings
    //Todo: change the signature of GenerationSettings to pass in strategy objects directly.
    // e.g., settings.strategy = new ComplimentaryHSL();
    // Then, we can do polymorphic calls without the switch statement.
    // For prototype, this will be sufficient.
    
    console.log('applySettings harmonyType:', settings.harmonyType);
    console.log('applySettings type:', typeof settings.harmonyType);

    switch (settings.harmonyType) {
      case ColorHarmony.COMPLEMENTARY:
        this.selectedStrategy = new Complementary();
        break;

      case ColorHarmony.MONOCHROMATIC:
        // Monochromatic harmony strategy
        // Added by DeAndre Josey (CAP-23)
        console.log('CAP-23: Monochromatic strategy selected');
        this.selectedStrategy = new Monochromatic();
        break;


      case ColorHarmony.TRIADIC:
        // Triadic harmony strategy
        // Added by DeAndre Josey (CAP-24)
        console.log('CAP-24: Triadic strategy selected');
        this.selectedStrategy = new Triadic();
        break;



      default:
        throw new Error(`Unsupported harmony type: ${settings.harmonyType}`);
    }
  }

  generate() {
    if (!this.selectedStrategy) {
      throw new Error('No generation strategy selected. Please apply settings first.');
    }

    const numberOfPalettes = this.generationSettings.numberOfPalettes || 1;
    const baseSeed = this.generationSettings.seed;

    let palettes = [];


    for (let i = 0; i < numberOfPalettes; i++) {
      // update seed predictably for each palette to ensure reproducibility
      this.generationSettings.seed = baseSeed + i;
      const palette = this.selectedStrategy.buildPalette(this.generationSettings);
      palettes.push(palette);
    }

    return palettes;
  }
}
