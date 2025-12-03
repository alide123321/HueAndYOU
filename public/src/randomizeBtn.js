import {FilterType} from '/shared/utils/constants.js';
/**
 * randomize function to set random values for harmony type, base color, number of swatches, and filter type.
 *
 * @author Ali Aldaghishy
 * @param {object} colorPickerInstance - Instance of the ColorPicker class
 * @param {boolean} [changeHarmonyType=true] - Whether to change the harmony type           |
 * @param {boolean} [changeNumOfSwatches=true] - Whether to change the number of swatches   |   To allow reusability of the function
 * @param {boolean} [changeFilterType=true] - Whether to change the filter type             |
 * @returns {void} | Directly changes the values of various elements in the document
 */
export function randomize(
  colorPickerInstance,
  changeHarmonyType = true,
  changeNumOfSwatches = true,
  changeFilterType = true
) {
  const body = document.body;

  // pick a random harmony type
  if (changeHarmonyType) {
    const harmonyTypeSelect = document.getElementById('harmony-type');
    const harmonyTypes = Array.from(harmonyTypeSelect.options).map(
      (option) => option.value
    );
    harmonyTypeSelect.value =
      harmonyTypes[Math.floor(Math.random() * harmonyTypes.length)];
  }

  // pick a random base color
  if (
    colorPickerInstance &&
    typeof colorPickerInstance.setColor === 'function'
  ) {
    const baseColorBtn = document.getElementById('base-color');
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    console.log('Random Color:', randomColor);
    document.querySelector('.color-preview').style.backgroundColor =
      randomColor;
    colorPickerInstance.setColor(randomColor);
  }

  // pick a random number of swatches between 3 and 10
  if (changeNumOfSwatches) {
    const numSwatchesInput = document.getElementById('num-swatches');
    numSwatchesInput.value = Math.floor(Math.random() * 8) + 3;
  }

  // pick either light or dark mode filter based on current mode
  if (changeFilterType) {
    localStorage.getItem('theme') === FilterType.LIGHT_MODE
      ? (document.getElementById('filter-type').value = FilterType.LIGHT_MODE)
      : (document.getElementById('filter-type').value = FilterType.DARK_MODE);
  }
}
