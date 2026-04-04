import { FilterType, ColorRole } from '/shared/utils/constants.js';
import { toggleTheme } from '/src/toggleThemeBtn.js';
import { buildPaletteCard } from '/src/paletteCardBuilder.js';
import { Color } from '/shared/types/Color.js';
import { Palette } from '/shared/types/Palette.js';

const themeToggleBtn = document.getElementById('about-theme-toggle');
const examplePaletteContainer = document.getElementById('example-palette');

const savedTheme = localStorage.getItem('theme');

if (savedTheme === FilterType.DARK_MODE) {
  document.body.classList.add('dark-mode');
  document.body.classList.remove('light-mode');
} else {
  document.body.classList.add('light-mode');
  document.body.classList.remove('dark-mode');
}

themeToggleBtn.addEventListener('click', () => {
  toggleTheme(true);
});

function createExamplePalette() {
  const primary = Color.fromHex('#406ba0');
  const secondary = Color.fromHex('#5f8cc7');
  const accent = Color.fromHex('#8fb3e3');
  const background = Color.fromHex('#c4d8f2');
  const text = Color.fromHex('#1f2a36');

  const colorMap = new Map([
    [primary, ColorRole.PRIMARY],
    [secondary, ColorRole.SECONDARY],
    [accent, ColorRole.ACCENT],
    [background, ColorRole.BACKGROUND],
    [text, ColorRole.TEXT],
  ]);

  return new Palette(colorMap, document.body.classList.contains('dark-mode'));
}

if (examplePaletteContainer) {
  const examplePalette = createExamplePalette();
  const paletteCard = buildPaletteCard(examplePalette, 1, () => {});

  // Disable all action buttons
  const buttons = paletteCard.querySelectorAll('button');
  buttons.forEach((btn) => {
  btn.setAttribute('aria-disabled', 'true');
  btn.tabIndex = -1;
  btn.style.pointerEvents = 'none';
  btn.style.opacity = '0.75';
  btn.style.cursor = 'not-allowed';
});

  // Make color swatches display-only
  const swatches = paletteCard.querySelectorAll('.palette-color');
  swatches.forEach((swatch) => {
    swatch.style.cursor = 'default';
    swatch.removeAttribute('title');

    const clone = swatch.cloneNode(true);
    swatch.replaceWith(clone);
  });

  examplePaletteContainer.appendChild(paletteCard);
}
