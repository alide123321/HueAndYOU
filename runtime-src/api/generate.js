import {Generator} from '../lib/Generator.js';
import {GenerationSettings} from '../../shared/types/GenerationSettings.js';
import {ColorHarmony, ColorFormat} from '../../shared/utils/constants.js';
import {Color} from '../../shared/types/Color.js';
import {convertColor} from '../../shared/utils/colorConversion.js';

/**
 * Generate a batch of palettes from a base color and harmony settings.
 * The request body should include `baseColor` (RGB string), and may include
 * `harmonyType`, `numberOfColors`, and harmony-specific `opts`.
 *
 * @author Ali Aldaghishy, Ian Timchak
 * @param {import('express').Request} req - Express request with generation settings in `req.body`.
 * @param {import('express').Response} res - Express response that returns serialized palette data.
 * @returns {void}
 */
const generateBatchPalettes = (req, res) => {
  const generator = new Generator();
  const settings = req.body;

  const baseColor = Color.fromRGBString(settings.baseColor);

  // Fewer palettes for low-chroma colors to avoid near-duplicates
  const rgb = baseColor.getRGB();
  const oklch = convertColor(
    {mode: 'rgb', r: rgb.r / 255, g: rgb.g / 255, b: rgb.b / 255},
    ColorFormat.OKLCH
  );
  const chroma = oklch.c ?? 0;
  const numberOfPalettes = chroma >= 0.1 ? 8 : chroma >= 0.04 ? 6 : 4;

  const gs = new GenerationSettings({
    harmonyType: settings.harmonyType || ColorHarmony.MONOCHROMATIC,
    baseColor: baseColor,
    includeBgTextColors: true,
    isLightMode: true,
    numberOfPalettes,
    numberOfColors: Number(settings.numberOfColors) || 5,
    opts: settings.opts || {},
  });

  generator.applySettings(gs);
  const palettes = generator.generate();

  for (let palette of palettes) {
    if (typeof palette?.serializeColorMap !== 'function') {
      throw new Error('Expected Palette instance with serializeColorMap().');
    }
    palette.serializeColorMap();
  }

  res.json(palettes);
};

export {generateBatchPalettes};
