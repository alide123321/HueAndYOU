import {Analogous} from '@src/harmony/Analogous.js';
import {GenerationSettings} from '@shared/types/GenerationSettings.js';
import {Color} from '@shared/types/Color.js';
import {Palette} from '@shared/types/Palette.js';
import {ColorRole, ColorHarmony} from '@shared/utils/constants.js';

import {assertPaletteContract} from '@testHelpers/assertPaletteContract.js'; // adjust path to your helper


describe('Analogous Harmony Strategy', () => {
  test('buildPalette returns a valid Palette instance and a valid colorMap', () => {
    const strategy = new Analogous();

    const gs = new GenerationSettings({
      harmonyType: ColorHarmony.ANALOGOUS,
      baseColor: Color.fromHex('#00ff00'),
      includeBgTextColors: true,
      isLightMode: true,
      opts: {
        hueOffset: 45,
      },
    });

    const palette = strategy.buildPalette(gs);

    // Shared "contract" assertions (Palette + Map + non-empty)
    assertPaletteContract(palette);

    // Keys should be Color instances; roles should be defined strings/constants
    for (const [color, role] of palette.colorMap.entries()) {
      expect(color).toBeInstanceOf(Color);
      expect(role).toBeDefined();
      expect(typeof role).toBe('string');
    }

    // Ensure the roles you assign in the switch are present
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