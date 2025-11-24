export class ColorHarmony {

  static complementary(hex) {
    return [hex, ColorHarmony.rotateHue(hex, 180)];
  }

  static analogous(hex) {
    return [
      ColorHarmony.rotateHue(hex, -30),
      hex,
      ColorHarmony.rotateHue(hex, 30)
    ];
  }

  static monochromatic(hex) {
    return [
      ColorHarmony.adjustLightness(hex, 20),
      hex,
      ColorHarmony.adjustLightness(hex, -20)
    ];
  }

  // --- Helper functions ---
  static rotateHue(hex, degrees) {
    let { h, s, l } = ColorHarmony.hexToHSL(hex);
    h = (h + degrees) % 360;
    if (h < 0) h += 360;
    return ColorHarmony.hslToHex(h, s, l);
  }

  static adjustLightness(hex, amount) {
    let { h, s, l } = ColorHarmony.hexToHSL(hex);
    l = Math.min(100, Math.max(0, l + amount));
    return ColorHarmony.hslToHex(h, s, l);
  }

  static hexToHSL(hex) {
    hex = hex.replace("#", "");
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return ColorHarmony.rgbToHsl(r, g, b);
  }

  static rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    const d = max - min;

    if (d === 0) h = s = 0;
    else {
      s = d / (1 - Math.abs(2 * l - 1));
      switch (max) {
        case r: h = ((g - b) / d) * 60; break;
        case g: h = (2 + (b - r) / d) * 60; break;
        case b: h = (4 + (r - g) / d) * 60; break;
      }
    }

    return { h: (h + 360) % 360, s: s * 100, l: l * 100 };
  }

  static hslToHex(h, s, l) {
    s /= 100;
    l /= 100;

    const a = s * Math.min(l, 1 - l);
    const f = (n) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
      return Math.round(255 * color).toString(16).padStart(2, "0");
    };

    return `#${f(0)}${f(8)}${f(4)}`;
  }
}