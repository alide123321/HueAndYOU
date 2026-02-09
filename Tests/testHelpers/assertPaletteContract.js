import {Palette} from '@shared/types/Palette.js';

export function assertPaletteContract(palette) {
  expect(palette).toBeInstanceOf(Palette);
  expect(palette.colorMap).toBeInstanceOf(Map);
  expect(palette.colorMap.size).toBeGreaterThan(0);
}