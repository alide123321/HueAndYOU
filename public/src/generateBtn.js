// Function to toggle between empty state and palette grid
export function toggleView(emptyStateId, palettesGridId) {
  const emptyState = document.getElementById(emptyStateId);
  const palettesGrid = document.getElementById(palettesGridId);

  emptyState.classList.toggle('hidden');
  palettesGrid.classList.toggle('hidden');
}

// Initialize event listeners for the generate buttons
export function initializeGenerateButtons(primaryBtnSelector, generateBtnSelector, emptyStateId, palettesGridId) {
  const primaryBtn = document.querySelector(primaryBtnSelector);
  const generateBtn = document.querySelector(generateBtnSelector);

  if (primaryBtn) {
    primaryBtn.addEventListener('click', () => toggleView(emptyStateId, palettesGridId));
  }

  if (generateBtn) {
    generateBtn.addEventListener('click', () => toggleView(emptyStateId, palettesGridId));
  }
}