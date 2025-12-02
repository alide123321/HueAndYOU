import {Generator} from '../lib/Generator.js';

//debug
import {GenerationSettings} from '../../shared/types/GenerationSettings.js';
import {ColorHarmony} from '../../shared/utils/constants.js';
import {Color} from '../../shared/types/Color.js';

const generateBatchPalettes = (req, res) => {
  // Implementation for generating batch palettes
  const generator = new Generator();
  const settings = req.body; // Assume settings are sent in the request body as a JSON object, using express.json() middleware
  console.log(settings);

  //temporarily use a default setting for testing
  const test = new GenerationSettings({
    harmonyType: ColorHarmony.COMPLEMENTARY,
    baseColor: Color.fromHex('#00ff00'),
    includeBgTextColors: true,
    isLightMode: true,
  });

  // apply settings to generator
  generator.applySettings(test);

  // generate palettes
  const palettes = generator.generate();

  // Serialize and send palette list as response
  res.json(palettes);
};

export {generateBatchPalettes};
