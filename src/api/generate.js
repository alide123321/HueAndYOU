import {Generator} from '../lib/Generator.js';

//debug
import {GenerationSettings} from '../../shared/types/GenerationSettings.js';
import {ColorHarmony} from '../../shared/utils/constants.js';
import {Color} from '../../shared/types/Color.js';

const generateBatchPalettes = (req, res) => {
  // Implementation for generating batch palettes
  const generator = new Generator();
  const settings = req.body; // Assume settings are sent in the request body as a JSON object, using express.json() middleware

  //temporarily use a default setting for testing
  const gs = new GenerationSettings({
    harmonyType: settings.harmonyType || ColorHarmony.COMPLEMENTARY,
    baseColor: Color.fromRGBString(settings.baseColor),
    includeBgTextColors: true,
    isLightMode: true,
  });

  // apply settings to generator
  generator.applySettings(gs);

  // generate palettes
  let palettes = generator.generate();

  // Serialize and send palette list as response
  for (let palette of palettes) {
    console.log('palette type:', typeof palette);
    console.log('palette keys:', Object.getOwnPropertyNames(palette));
    console.log('palette proto:', Object.getPrototypeOf(palette)?.constructor?.name);

    if (typeof palette?.serializeColorMap !== 'function') {
  throw new Error('Expected Palette instance with serializeColorMap().');
}
    palette.serializeColorMap();
  }
  res.json(palettes);
};

export {generateBatchPalettes};
