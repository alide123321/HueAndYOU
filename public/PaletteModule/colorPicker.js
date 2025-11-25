import {convertColor} from '../commonCode/colorConversion.js';
import {ColorFormat} from '../commonCode/constants.js';

export class ColorPicker {
  constructor(buttonElement, onColorSelect) {
    this.button = buttonElement;
    this.onColorSelect = onColorSelect;
    this.currentHue = 220; // Blue hue
    this.currentSaturation = 100;
    this.currentLightness = 60;
    this.isDraggingCanvas = false;
    this.isDraggingHue = false;

    // Initialize formatValues as a class property
    this.formatValues = ['HEX', '', ''];

    this.createModal();
    this.attachEventListeners();
    this.updateColor();
  }

  createModal() {
    const overlay = document.createElement('div');
    overlay.className = 'color-picker-overlay';

    // Generate format options dynamically from ColorFormat
    const formatOptions = Object.entries(ColorFormat)
      .map(([key, value]) => `<option value="${value}">${key}</option>`)
      .join('');

    overlay.innerHTML = `
      <div class="color-picker-modal">
        <div class="color-picker-container">
          <div class="color-canvas" id="color-canvas">
            <canvas width="640" height="600"></canvas>
            <div class="color-canvas-cursor" id="canvas-cursor"></div>
          </div>
          
          <div class="hue-slider-container">
            <div class="hue-slider" id="hue-slider">
              <div class="hue-slider-thumb" id="hue-thumb"></div>
            </div>
          </div>
          
          <div class="color-info">
            <div class="color-preview-large" id="color-preview"></div>
            <div class="color-values">
              <div class="color-value">
                <span class="color-value-label">${this.formatValues[0]}</span>
                <span class="color-value-number" id="r-value" contenteditable="true"></span>
              </div>
              <div class="color-value">
                <span class="color-value-label">${this.formatValues[1]}</span>
                <span class="color-value-number" id="g-value" contenteditable="false"></span>
              </div>
              <div class="color-value">
                <span class="color-value-label">${this.formatValues[2]}</span>
                <span class="color-value-number" id="b-value" contenteditable="false"></span>
              </div>
            </div>
            <div class="format-selector">
              <select id="format-select">
                ${formatOptions}
              </select>
            </div>
          </div>
          
          <div class="color-picker-actions">
            <button class="color-picker-btn color-picker-btn-cancel" id="cancel-btn">Cancel</button>
            <button class="color-picker-btn color-picker-btn-select" id="select-btn">Select</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.overlay = overlay;
    this.canvas = overlay.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvasElement = overlay.querySelector('#color-canvas');
    this.canvasCursor = overlay.querySelector('#canvas-cursor');
    this.hueSlider = overlay.querySelector('#hue-slider');
    this.hueThumb = overlay.querySelector('#hue-thumb');
    this.colorPreview = overlay.querySelector('#color-preview');
    this.rValue = overlay.querySelector('#r-value');
    this.gValue = overlay.querySelector('#g-value');
    this.bValue = overlay.querySelector('#b-value');
  }

  attachEventListeners() {
    // Open picker
    this.button.addEventListener('click', () => this.open());

    // Close on overlay click
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    // Cancel button
    this.overlay
      .querySelector('#cancel-btn')
      .addEventListener('click', () => this.close());

    // Select button
    this.overlay.querySelector('#select-btn').addEventListener('click', () => {
      const hslColor = {
        h: this.currentHue,
        s: this.currentSaturation / 100,
        l: this.currentLightness / 100,
        mode: ColorFormat.HSL,
      };
      const hexColor = convertColor(hslColor, ColorFormat.HEX);

      if (this.onColorSelect) {
        this.onColorSelect(hexColor.value);
      }
      // Update the button's color preview
      const colorPreview = this.button.querySelector('.color-preview');
      if (colorPreview) {
        colorPreview.style.backgroundColor = hexColor.value;
      }
      this.close();
    });

    // Canvas interaction
    this.canvasElement.addEventListener('mousedown', (e) => {
      this.isDraggingCanvas = true;
      this.updateFromCanvas(e);
    });

    document.addEventListener('mousemove', (e) => {
      if (this.isDraggingCanvas) {
        this.updateFromCanvas(e);
      }
      if (this.isDraggingHue) {
        this.updateFromHueSlider(e);
      }
    });

    document.addEventListener('mouseup', () => {
      this.isDraggingCanvas = false;
      this.isDraggingHue = false;
    });

    // Hue slider interaction
    this.hueSlider.addEventListener('mousedown', (e) => {
      this.isDraggingHue = true;
      this.updateFromHueSlider(e);
    });

    // Add event listener for format selection
    const formatSelect = this.overlay.querySelector('#format-select');
    formatSelect.addEventListener('change', (e) => {
      // Update format labels
      const selectedFormat = e.target.value;
      if (selectedFormat === ColorFormat.RGB) {
        this.formatValues = ['R', 'G', 'B'];
      } else if (selectedFormat === ColorFormat.HSL) {
        this.formatValues = ['H', 'S', 'L'];
      } else if (selectedFormat === ColorFormat.HEX) {
        this.formatValues = ['HEX', '', ''];
      } else if (selectedFormat === ColorFormat.OKLCH) {
        this.formatValues = ['L', 'C', 'H'];
      }
      // Update labels in the modal
      this.overlay
        .querySelectorAll('.color-value-label')
        .forEach((label, index) => {
          label.textContent = this.formatValues[index];
        });
      this.updateColor();
    });

    // Add event listeners for editable spans
    this.rValue.addEventListener('blur', () => this.updateFromEditable());
    this.gValue.addEventListener('blur', () => this.updateFromEditable());
    this.bValue.addEventListener('blur', () => this.updateFromEditable());
  }

  updateFromCanvas(e) {
    const rect = this.canvasElement.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Clamp values
    x = Math.max(0, Math.min(x, rect.width));
    y = Math.max(0, Math.min(y, rect.height));

    // Convert to saturation and lightness (0-100)
    this.currentSaturation = (x / rect.width) * 100;
    this.currentLightness = 100 - (y / rect.height) * 100;

    // Update cursor position
    this.canvasCursor.style.left = x + 'px';
    this.canvasCursor.style.top = y + 'px';

    this.updateColor();
  }

  updateFromHueSlider(e) {
    const rect = this.hueSlider.getBoundingClientRect();
    let x = e.clientX - rect.left;

    // Clamp value
    x = Math.max(0, Math.min(x, rect.width));

    // Convert to hue (0-360)
    this.currentHue = (x / rect.width) * 360;

    // Update thumb position
    this.hueThumb.style.left = x + 'px';

    this.drawCanvas();
    this.updateColor();
  }

  drawCanvas() {
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Create gradient from white to pure hue
    const gradientH = this.ctx.createLinearGradient(0, 0, width, 0);
    gradientH.addColorStop(0, '#ffffff');
    gradientH.addColorStop(1, `hsl(${this.currentHue}, 100%, 50%)`);

    this.ctx.fillStyle = gradientH;
    this.ctx.fillRect(0, 0, width, height);

    // Create gradient from transparent to black
    const gradientV = this.ctx.createLinearGradient(0, 0, 0, height);
    gradientV.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradientV.addColorStop(1, 'rgba(0, 0, 0, 1)');

    this.ctx.fillStyle = gradientV;
    this.ctx.fillRect(0, 0, width, height);
  }

  updateColor() {
    const hslColor = {
      h: this.currentHue,
      s: this.currentSaturation / 100,
      l: this.currentLightness / 100,
      mode: ColorFormat.HSL,
    };

    const rgbColor = convertColor(hslColor, ColorFormat.RGB);
    const hexColor = convertColor(hslColor, ColorFormat.HEX);

    // Get selected format
    const formatSelect = this.overlay.querySelector('#format-select');
    const selectedFormat = formatSelect.value;

    // Update preview
    this.colorPreview.style.backgroundColor = hexColor.value;

    // Update color values based on selected format
    if (selectedFormat === ColorFormat.RGB) {
      this.rValue.textContent = Math.round(rgbColor.r * 255);
      this.gValue.textContent = Math.round(rgbColor.g * 255);
      this.bValue.textContent = Math.round(rgbColor.b * 255);

      this.gValue.contentEditable = 'true';
      this.bValue.contentEditable = 'true';
    } else if (selectedFormat === ColorFormat.HEX) {
      this.rValue.textContent = hexColor.value;
      this.gValue.textContent = '';
      this.bValue.textContent = '';

      this.gValue.contentEditable = 'false';
      this.bValue.contentEditable = 'false';
    } else if (selectedFormat === ColorFormat.HSL) {
      this.rValue.textContent = Math.round(hslColor.h);
      this.gValue.textContent = Math.round(hslColor.s * 100);
      this.bValue.textContent = Math.round(hslColor.l * 100);

      this.gValue.contentEditable = 'true';
      this.bValue.contentEditable = 'true';
    } else if (selectedFormat === ColorFormat.OKLCH) {
      const oklchColor = convertColor(hslColor, ColorFormat.OKLCH);
      this.rValue.textContent = oklchColor.l.toFixed(4);
      this.gValue.textContent = oklchColor.c.toFixed(4);
      this.bValue.textContent = oklchColor.h.toFixed(2);

      this.gValue.contentEditable = 'true';
      this.bValue.contentEditable = 'true';
    }
  }

  /**
   * Update internal state from editable spans while ensuring
   * values are valid for the selected format.
   * Code is confusing best to read it in parts
   * @author Ali Aldaghishy
   */
  updateFromEditable() {
    const formatSelect = this.overlay.querySelector('#format-select');
    const selectedFormat = formatSelect.value;

    if (selectedFormat === ColorFormat.RGB) {
      // Parse RGB values
      if (
        parseInt(this.rValue.textContent) === NaN ||
        parseInt(this.gValue.textContent) === NaN ||
        parseInt(this.bValue.textContent) === NaN
      )
        return;

      const r = Math.max(
        0,
        Math.min(255, parseInt(this.rValue.textContent) || 0)
      );
      const g = Math.max(
        0,
        Math.min(255, parseInt(this.gValue.textContent) || 0)
      );
      const b = Math.max(
        0,
        Math.min(255, parseInt(this.bValue.textContent) || 0)
      );

      // Convert RGB to HSL and update internal state
      const hslColor = convertColor(
        {r: r / 255, g: g / 255, b: b / 255, mode: ColorFormat.RGB},
        ColorFormat.HSL
      );
      this.currentHue = hslColor.h;
      this.currentSaturation = hslColor.s * 100;
      this.currentLightness = hslColor.l * 100;
    } else if (selectedFormat === ColorFormat.HSL) {
      // Parse HSL values

      if (
        parseInt(this.rValue.textContent) === NaN ||
        parseInt(this.gValue.textContent) === NaN ||
        parseInt(this.bValue.textContent) === NaN
      )
        return;

      const h = Math.max(
        0,
        Math.min(360, parseInt(this.rValue.textContent) || 0)
      );
      const s = Math.max(
        0,
        Math.min(100, parseInt(this.gValue.textContent) || 0)
      );
      const l = Math.max(
        0,
        Math.min(100, parseInt(this.bValue.textContent) || 0)
      );

      // Update internal state
      this.currentHue = h;
      this.currentSaturation = s;
      this.currentLightness = l;
    } else if (selectedFormat === ColorFormat.HEX) {
      // Parse HEX value
      const hex = /^#[0-9A-Fa-f]{6}$/.test(this.rValue.textContent.trim())
        ? this.rValue.textContent.trim()
        : '#000000';

      const hslColor = convertColor(hex, ColorFormat.HSL);
      this.currentHue = hslColor.h;
      this.currentSaturation = hslColor.s * 100;
      this.currentLightness = hslColor.l * 100;
    } else if (selectedFormat === ColorFormat.OKLCH) {
      // Parse OKLCH values

      if (
        parseFloat(this.rValue.textContent) === NaN ||
        parseFloat(this.gValue.textContent) === NaN ||
        parseFloat(this.bValue.textContent) === NaN
      )
        return;

      const l = Math.max(
        0,
        Math.min(1, parseFloat(this.rValue.textContent) || 0)
      );
      const c = Math.max(
        0,
        Math.min(1, parseFloat(this.gValue.textContent) || 0)
      );
      const h = Math.max(
        0,
        Math.min(360, parseFloat(this.bValue.textContent) || 0)
      );

      // Convert OKLCH to HSL and update internal state
      const hslColor = convertColor(
        {l, c, h, mode: ColorFormat.OKLCH},
        ColorFormat.HSL
      );
      this.currentHue = hslColor.h;
      this.currentSaturation = hslColor.s * 100;
      this.currentLightness = hslColor.l * 100;
    }

    // Update the canvas and preview
    this.drawCanvas();
    this.updateColor();
  }

  open() {
    this.overlay.classList.add('active');
    this.drawCanvas();

    // Set initial cursor position
    const rect = this.canvasElement.getBoundingClientRect();
    const x = (this.currentSaturation / 100) * rect.width;
    const y = (1 - this.currentLightness / 100) * rect.height;
    this.canvasCursor.style.left = x + 'px';
    this.canvasCursor.style.top = y + 'px';

    // Set initial hue thumb position
    const hueRect = this.hueSlider.getBoundingClientRect();
    const hueX = (this.currentHue / 360) * hueRect.width;
    this.hueThumb.style.left = hueX + 'px';
  }

  close() {
    this.overlay.classList.remove('active');
  }
}
