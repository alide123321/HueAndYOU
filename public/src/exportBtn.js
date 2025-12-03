export function exportPalette(event, palette) {
  // Convert palette.colorMap into a clean export structure
  const exportObj = {};

  for (const [color, role] of palette.colorMap) {
    exportObj[color.getHEX().value.toUpperCase()] = role ?? 'unassigned';
  }

  // File contents
  const jsonString = JSON.stringify(exportObj, null, 2);
  const blob = new Blob([jsonString], {type: 'application/json'});

  // File name
  const filename = `palette.json`;

  // Trigger download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();

  // Cleanup
  URL.revokeObjectURL(link.href);
}
