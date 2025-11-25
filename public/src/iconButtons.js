// Implementation for icon buttons functionality

import {FilterType} from '/CommonCode/constants.js';

/**
 * Toggles the theme between light and dark mode.
 *
 * @author Ali Aldaghishy
 * @returns {void} | Directly changes the theme of the document body
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
 */
export function randomize() {
  const body = document.body;

  //pick a random harmony type
  const harmonyTypeSelect = document.getElementById('harmony-type');
  const harmonyTypes = Array.from(harmonyTypeSelect.options).map(
    (option) => option.value
  );
  harmonyTypeSelect.value =
    harmonyTypes[Math.floor(Math.random() * harmonyTypes.length)];

  //pick a random base color
  const baseColorInput = document.getElementById('base-color');
  document.querySelector(
    '.color-preview'
  ).style.backgroundColor = `#${Math.floor(Math.random() * 16777215).toString(
    16
  )}`;

  //pick a random number of swatches between 3 and 10
  const numSwatchesInput = document.getElementById('num-swatches');
  numSwatchesInput.value = Math.floor(Math.random() * 8) + 3;

  //pick either light or dark mode filter based on current mode
  document.querySelector('.icon-btn[aria-label="Toggle theme"] .icon-text')
    .textContent === '☀'
    ? (document.getElementById('filter-type').value = FilterType.LIGHT_MODE)
    : (document.getElementById('filter-type').value = FilterType.DARK_MODE);
}
