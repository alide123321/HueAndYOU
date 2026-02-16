import {Tetradic} from '@src/harmony/Tetradic.js';
import {GenerationSettings} from '@shared/types/GenerationSettings.js';
import {Color} from '@shared/types/Color.js';
import {Palette} from '@shared/types/Palette.js';
import {ColorRole, ColorHarmony} from '@shared/utils/constants.js';

import {assertPaletteContract} from '@testHelpers/assertPaletteContract.js';

describe('Tetradic Harmony Strategy', () => {
  test('buildPalette returns a valid Palette and valid colorMap', () => {
    const strategy = new Tetradic();

    const gs = new GenerationSettings({
      harmonyType: ColorHarmony.TETRADIC,
      baseColor: Color.fromHex('#a122c4'),
      includeBgTextColors: true,
      isLightMode: true,
    });

    const palette = strategy.buildPalette(gs);

    // Shared contract checks
    assertPaletteContract(palette);

    // Keys should be Color instances; roles should be defined
    for (const [color, role] of palette.colorMap.entries()) {
      expect(color).toBeInstanceOf(Color);
      expect(role).toBeDefined();
      expect(typeof role).toBe('string');
    }

    // Ensure expected roles exist
    const roles = Array.from(palette.colorMap.values());
    expect(roles).toEqual(
      expect.arrayContaining([
        ColorRole.PRIMARY,
        ColorRole.SECONDARY,
        ColorRole.ACCENT,
        ColorRole.BACKGROUND,
        ColorRole.TEXT,
      ]),
    );
  });
});