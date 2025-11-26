import {FilterType} from '/commonCode/constants.js';

/**
 * Toggles the theme between light and dark mode.
 *
 * @author Ali Aldaghishy
 * @param {boolean} [isPersistent=true] - Whether to persist the theme choice in localStorage
 * @returns {void} | Directly changes the theme of the document body
 */
export function toggleTheme(isPersistent = true) {
  const isDarkMode = document.body.classList.toggle('dark-mode');
  document.body.classList.toggle('light-mode');

  if (isPersistent) {
    localStorage.setItem(
      'theme',
      localStorage.getItem('theme') === FilterType.LIGHT_MODE
        ? FilterType.DARK_MODE
        : FilterType.LIGHT_MODE
    );
  }
}
