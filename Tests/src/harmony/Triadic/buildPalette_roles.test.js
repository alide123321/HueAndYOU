import {Triadic} from '../../../../src/harmony/Triadic.js';
import {GenerationSettings} from '../../../../shared/types/GenerationSettings.js';
import {Color} from '../../../../shared/types/Color.js';
import {ColorHarmony, ColorRole} from '../../../../shared/utils/constants.js';

test('buildPalette assigns correct roles when bg/text enabled', () => {
  const triadic = new Triadic();

  const gs = new GenerationSettings({
    harmonyType: ColorHarmony.TRIADIC,
    baseColor: Color.fromRGBString('rgb(161, 34, 196)'),
    includeBgTextColors: true,
    isLightMode: true,
  });

  const palette = triadic.buildPalette(gs);

  // map values are roles
  const roles = Array.from(palette.colorMap.values());

  expect(roles).toContain(ColorRole.PRIMARY);
  expect(roles).toContain(ColorRole.SECONDARY);
  expect(roles).toContain(ColorRole.ACCENT);
  expect(roles).toContain(ColorRole.BACKGROUND);
  expect(roles).toContain(ColorRole.TEXT);

  // Triadic + bg/text should be 5 colors total
  expect(palette.colorMap.size).toBe(5);
});