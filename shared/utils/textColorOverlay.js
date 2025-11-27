import {Color} from '/shared/types/Color.js';
import {convertColor} from '/shared/utils/colorConversion.js';
import {ColorFormat} from '/shared/utils/constants.js';

/**
 *
 * @param {Color} bgColor
 * @returns
 */
export function getTextColor(bgColor) {
  let oklchColor = {l: 0, c: 0, h: 0};
  if (bgColor == null || bgColor === undefined || bgColor === '') {
    oklchColor = {l: 0.25, c: 0, h: 260};
  } else if (bgColor instanceof Color) {
    oklchColor = convertColor(bgColor, ColorFormat.OKLCH);
  } else {
    oklchColor = convertColor(bgColor, ColorFormat.OKLCH);
  }

  if (oklchColor.l >= 0.5)
    return convertColor(
      {
        l:
          oklchColor.l -
          Math.min(oklchColor.l, Math.min(oklchColor.l - 0.2, 0.3)),
        c: oklchColor.c,
        h: oklchColor.h,
        mode: ColorFormat.OKLCH,
      },
      ColorFormat.HEX
    );

  return convertColor(
    {
      l: oklchColor.l + Math.min(1 - oklchColor.l, 0.3),
      c: oklchColor.c,
      h: oklchColor.h,
      mode: ColorFormat.OKLCH,
    },
    ColorFormat.HEX
  );
}
