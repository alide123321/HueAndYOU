import { FilterType } from '/shared/utils/constants.js';
import { toggleTheme } from '/src/toggleThemeBtn.js';

const themeToggleBtn = document.getElementById('about-theme-toggle');

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