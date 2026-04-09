import {WCAGAnalyzer} from '/shared/accessibility/WCAGAnalyzer.js';
import {ColorRole} from '/shared/utils/constants.js';
import {exportPalette} from '/src/exportBtn.js';
import {savePaletteToStorage} from '/shared/utils/paletteUtils.js';
import {addCopyListener} from '/src/clipboardUtils.js';

/**
 * Builds and returns a palette card DOM element.
 * @author Ali Aldaghishy
 * @param {Palette} palette
 * @param {number} paletteNumber - 1-based number shown in the card label
 * @param {Function} [onPreview] - If provided, a Preview button is added with this as its click handler
 * @returns {HTMLElement}
 */
export function buildPaletteCard(palette, paletteNumber, onPreview) {
  const card = document.createElement('div');
  card.className = 'palette-card';

  // --- Colors section ---
  const colorsContainer = document.createElement('div');
  colorsContainer.className = 'palette-colors';

  const report = WCAGAnalyzer.analyzePalette(palette);

  for (const [color, role] of palette.colorMap) {
    // Create the color swatch element
    const colorDiv = document.createElement('div');
    colorDiv.className = 'palette-color';
    const hexValue = color.getHEX().value;
    colorDiv.style.backgroundColor = hexValue;
    colorDiv.style.cursor = 'pointer';
    colorDiv.title = `Click to copy ${hexValue}`;

    // Create top and bottom groups for labels
    const topGroup = document.createElement('div');
    topGroup.className = 'palette-top-group';
    const bottomGroup = document.createElement('div');
    bottomGroup.className = 'palette-bottom-group';
    colorDiv.appendChild(topGroup);
    colorDiv.appendChild(bottomGroup);

    const colorReport = report.findResultForColor(color);
    if (!colorReport) {
      console.error('No WCAG report found for color:', hexValue);
      continue;
    }

    // text or background color
    const targetColor =
      colorReport.getBestAgainst() === ColorRole.BACKGROUND
        ? palette.getBackgroundColor()
        : palette.getTextColor();
    const textHex = targetColor.getHEX().value;

    const valueLabel = document.createElement('span');
    valueLabel.className = 'color-bold-label';
    valueLabel.textContent = hexValue.toUpperCase();
    valueLabel.style.color = textHex;
    topGroup.appendChild(valueLabel);

    addCopyListener(colorDiv, hexValue, valueLabel);

    // role label
    const roleLabel = document.createElement('span');
    roleLabel.className = 'color-normal-label';
    roleLabel.textContent = role != null ? role.toUpperCase() : '';
    roleLabel.style.color = textHex;
    topGroup.appendChild(roleLabel);

    // contrast info
    const contrastLabel = document.createElement('span');
    contrastLabel.className = 'color-normal-label';
    contrastLabel.textContent = `WCAG ${colorReport.getLabel()}`;
    contrastLabel.style.color = textHex;
    bottomGroup.appendChild(contrastLabel);

    // contrast ratio
    const ratioLabel = document.createElement('span');
    ratioLabel.className = 'color-normal-label';
    ratioLabel.textContent = `${colorReport.getBestContrast().toFixed(2)}:1`;
    ratioLabel.style.color = textHex;
    bottomGroup.appendChild(ratioLabel);

    colorsContainer.appendChild(colorDiv);
  }
  card.appendChild(colorsContainer);

  // --- Info / actions section ---
  const info = document.createElement('div');
  info.className = 'palette-info';

  const label = document.createElement('span');
  label.className = 'palette-label';
  label.textContent = `Palette ${paletteNumber}`;
  if (palette.varied) {
    const icon = document.createElement('span');
    icon.className = 'palette-varied-icon';
    icon.title =
      'Variation: Primary color adjusted from your input to increase palette diversity';
    icon.innerHTML =
      '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.04 10 9c0 3.31-2.69 6-6 6h-1.77a1 1 0 0 0-.73 1.69c.47.47.73 1.1.73 1.75 0 .95-.68 1.56-1.23 1.56zm0-18a8 8 0 0 0 0 16c.01-.01.22-.01.22-.44 0-.15-.07-.3-.18-.42a3 3 0 0 1-.05-4.22A3 3 0 0 1 14.23 14H16c2.21 0 4-1.79 4-4 0-3.86-3.59-7-8-7zM6.5 13a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>';
    label.appendChild(icon);
  }
  info.appendChild(label);

  const actions = document.createElement('div');
  actions.className = 'palette-actions';

  const buttonDefs = [
    {label: 'Export', handler: () => exportPalette(palette)},
    ...(onPreview ? [{label: 'Preview', handler: onPreview}] : []),
    {
      label: 'Edit',
      handler: () => {
        savePaletteToStorage(palette);
        window.location.href = '/edit';
      },
    },
  ];
  buttonDefs.forEach(({label: text, handler}) => {
    const btn = document.createElement('button');
    btn.className = 'text-btn';
    btn.textContent = text;
    btn.addEventListener('click', handler);
    actions.appendChild(btn);
  });

  info.appendChild(actions);
  card.appendChild(info);

  return card;
}
