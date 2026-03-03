import {WCAGAnalyzer} from '/shared/accessibility/WCAGAnalyzer.js';
import {ColorRole} from '/shared/utils/constants.js';
import {exportPalette} from '/src/exportBtn.js';
import {savePaletteToStorage} from '/shared/utils/paletteUtils.js';
import {addCopyListener} from '/shared/utils/clipboardUtils.js';

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
