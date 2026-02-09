import {Complementary} from '../../../../src/harmony/ComplementaryOKLCH.js';
import {GenerationSettings} from '../../../../shared/types/GenerationSettings.js';
import {Color} from '../../../../shared/types/Color.js';
import {rgbToOklch} from '../../../../shared/utils/tempColorConversion.js';

describe('ComplementaryOKLCH', () => {
  test('should generate complementary colors correctly', () => {
    const base = Color.fromHex('#00ff00'); // blue

    const gs = new GenerationSettings({
      baseColor: base,
      includeBgTextColors: false,
    });

    const strat = new Complementary();
    const palette = strat.buildPalette(gs);

    // Convert base → OKLCH to check expected complement hue
    const baseOK = rgbToOklch({...base.getRGB(), mode: 'rgb'});

    const complement = palette.colorMap[1]; // expected: complementary color
    const complementOK = rgbToOklch({...complement.getRGB(), mode: 'rgb'});

    const expectedHue = (baseOK.h + 180) % 360;
    const diff = Math.abs(complementOK.h - expectedHue);

    expect(diff).toBeLessThan(0.5); // floating point tolerance
  });
});
