import {createExportModal} from './exportModal.js';
import {Palette} from '/shared/types/Palette.js';
import {Color} from '/shared/types/Color.js';
import {ColorRole} from '/shared/utils/constants.js';

const exportModal = createExportModal();

const samplePalette = new Palette(
  new Map([
    [new Color(245, 247, 250), ColorRole.BACKGROUND],
    [new Color(220, 231, 243), ColorRole.SECONDARY],
    [new Color(64, 107, 160), ColorRole.PRIMARY],
    [new Color(127, 179, 213), ColorRole.ACCENT],
    [new Color(127, 179, 123), null],
  ]),
  false
);

function paletteToExportModalData(palette, name = 'Ocean Balance') {
  const colors = [];

  for (const [color, role] of palette.colorMap.entries()) {
    colors.push({
      role: role,
      hex: color.getHEX().value.toUpperCase(),
    });
  }

  return {
    name,
    colors,
    isDarkTheme: palette.isDarkTheme,
  };
}

const modalPaletteData = paletteToExportModalData(
  samplePalette,
  'Ocean Balance'
);

const sandboxThemeToggle = document.getElementById('sandbox-theme-toggle');

if (sandboxThemeToggle) {
  sandboxThemeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });
}

document.querySelectorAll('.export-btn').forEach((button) => {
  button.addEventListener('click', () => {
    exportModal.open(modalPaletteData, 'css');
  });
});
