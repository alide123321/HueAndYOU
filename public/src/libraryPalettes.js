import {Color} from '/shared/types/Color.js';
import {ColorRole} from '/shared/utils/constants.js';
import {Palette} from '/shared/types/Palette.js';

/**
 * @author Ali Aldaghishy
 * @description Provides a set of predefined color palettes for use in the application.
 * @returns {Palette[]} A list of predefined color palettes.
 */
export function getLibraryPalettes() {
  let paletteList = [];
  let maps = [
    new Map(),
    new Map(),
    new Map(),
    new Map(),
    new Map(),
    new Map(),
    new Map(),
    new Map(),
    new Map(),
    new Map(),
  ];
  maps[0].set(Color.fromHex('#4A90E2'), ColorRole.PRIMARY);
  maps[0].set(Color.fromHex('#67A3E8'), ColorRole.SECONDARY);
  maps[0].set(Color.fromHex('#85B6ED'), ColorRole.ACCENT);
  maps[0].set(Color.fromHex('#A2C9F3'), ColorRole.BACKGROUND);
  maps[0].set(Color.fromHex('#C0DCF8'), ColorRole.TEXT);

  maps[1].set(Color.fromHex('#E24A90'), ColorRole.PRIMARY);
  maps[1].set(Color.fromHex('#E867A3'), ColorRole.SECONDARY);
  maps[1].set(Color.fromHex('#ED85B6'), ColorRole.ACCENT);
  maps[1].set(Color.fromHex('#F3A2C9'), ColorRole.BACKGROUND);
  maps[1].set(Color.fromHex('#F8C0DC'), ColorRole.TEXT);

  maps[2].set(Color.fromHex('#90E24A'), ColorRole.PRIMARY);
  maps[2].set(Color.fromHex('#A3E867'), ColorRole.SECONDARY);
  maps[2].set(Color.fromHex('#B6ED85'), ColorRole.ACCENT);
  maps[2].set(Color.fromHex('#C9F3A2'), ColorRole.BACKGROUND);
  maps[2].set(Color.fromHex('#DCF8C0'), ColorRole.TEXT);

  maps[3].set(Color.fromHex('#E2904A'), ColorRole.PRIMARY);
  maps[3].set(Color.fromHex('#E8A367'), ColorRole.SECONDARY);
  maps[3].set(Color.fromHex('#EDB685'), ColorRole.ACCENT);
  maps[3].set(Color.fromHex('#F3C9A2'), ColorRole.BACKGROUND);
  maps[3].set(Color.fromHex('#F8DCC0'), ColorRole.TEXT);

  maps[4].set(Color.fromHex('#1ABC9C'), ColorRole.PRIMARY);
  maps[4].set(Color.fromHex('#29bda0'), ColorRole.SECONDARY);
  maps[4].set(Color.fromHex('#44c1a8'), ColorRole.ACCENT);
  maps[4].set(Color.fromHex('#69c3b1'), ColorRole.BACKGROUND);
  maps[4].set(Color.fromHex('#90c7bc'), ColorRole.TEXT);

  maps[5].set(Color.fromHex('#9B59B6'), ColorRole.PRIMARY);
  maps[5].set(Color.fromHex('#B07FCF'), ColorRole.SECONDARY);
  maps[5].set(Color.fromHex('#C598E6'), ColorRole.ACCENT);
  maps[5].set(Color.fromHex('#d0b1e6'), ColorRole.BACKGROUND);
  maps[5].set(Color.fromHex('#d7c3e6'), ColorRole.TEXT);

  maps[6].set(Color.fromHex('#E67E22'), ColorRole.PRIMARY);
  maps[6].set(Color.fromHex('#E99048'), ColorRole.SECONDARY);
  maps[6].set(Color.fromHex('#F0A66E'), ColorRole.ACCENT);
  maps[6].set(Color.fromHex('#eeb182'), ColorRole.BACKGROUND);
  maps[6].set(Color.fromHex('#edc3a2'), ColorRole.TEXT);

  maps[7].set(Color.fromHex('#34495E'), ColorRole.PRIMARY);
  maps[7].set(Color.fromHex('#4F6B82'), ColorRole.SECONDARY);
  maps[7].set(Color.fromHex('#7B8FA6'), ColorRole.ACCENT);
  maps[7].set(Color.fromHex('#8998a9'), ColorRole.BACKGROUND);
  maps[7].set(Color.fromHex('#95a0ac'), ColorRole.TEXT);

  paletteList.push(new Palette(maps[0]));
  paletteList.push(new Palette(maps[1]));
  paletteList.push(new Palette(maps[2]));
  paletteList.push(new Palette(maps[3]));
  paletteList.push(new Palette(maps[4]));
  paletteList.push(new Palette(maps[5]));
  paletteList.push(new Palette(maps[6]));
  paletteList.push(new Palette(maps[7]));

  return paletteList;
}
