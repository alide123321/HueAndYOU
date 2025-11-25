// Implementation for icon buttons functionality

/**
 * Toggles the theme between light and dark mode.
 *
 *
 */
export function toggleTheme() {
  const body = document.body;
  const isDarkMode = body.classList.toggle('dark-mode');

  // Update the theme icon based on the current mode
  const themeIcon = document.querySelector(
    '.icon-btn[aria-label="Toggle theme"] .icon-text'
  );
  if (themeIcon) themeIcon.textContent = isDarkMode ? '🌙' : '☀';
}

/**
 * Placeholder for share functionality.
 *
 * TODO: Implement actual share functionality.
 */
export function share() {
  console.log('Share functionality not implemented yet.');
}

/**
 * Placeholder for randomize functionality.
 *
 * TODO: Implement actual randomize functionality.
 */
export function randomize() {
  console.log('Randomize functionality not implemented yet.');
}
