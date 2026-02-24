import {convertColor} from '/shared/utils/colorConversion.js';
import {ColorFormat} from '/shared/utils/constants.js';

export class ColorPicker {
  constructor(buttonElement, onColorSelect) {
    const hslColor = convertColor(
      buttonElement.querySelector('.color-preview').style.backgroundColor ||
        '#3399FF',
      ColorFormat.HSL
    );

    this.button = buttonElement;
    this.onColorSelect = onColorSelect;
    this.currentHue = hslColor.h;
    this.currentSaturation = hslColor.s * 100;
    this.currentLightness = hslColor.l * 100;
    this.isDraggingCanvas = false;
    this.isDraggingHue = false;

    // Initialize formatValues as a class property
    this.formatValues = ['HEX', '', ''];

    this.createModal();
    this.attachEventListeners();
    this.updateColor();
  }

  /**
   * Sets the color picker to a specific color
   *
   * @author Ali Aldaghishy
   * @param {object|string} color - Color object or hex string
   */
  setColor(color) {
    const hslColor = convertColor(color, ColorFormat.HSL);
    // For achromatic colors (white, black, grays), hue may be undefined
    // In that case, keep the current hue to maintain UI state
    this.currentHue = hslColor.h !== undefined ? hslColor.h : this.currentHue;
    this.currentSaturation = hslColor.s * 100;
    this.currentLightness = hslColor.l * 100;
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
    const cssWidth = this.canvasElement.offsetWidth;
    const cssHeight = this.canvasElement.offsetHeight;
    const zoom = cssWidth > 0 ? rect.width / cssWidth : 1;
    let x = (e.clientX - rect.left) / zoom + 0.5;
    let y = (e.clientY - rect.top) / zoom + 0.5;

    // Clamp values
    x = Math.max(0, Math.min(x, cssWidth));
    y = Math.max(0, Math.min(y, cssHeight));

    // Convert to saturation and lightness (0-100)
    const xRatio = x / cssWidth;
    const yRatio = y / cssHeight;

    // Saturation: 0% (left) to 100% (right)
    this.currentSaturation = xRatio * 100;

    // Lightness calculation for standard HSL picker
    // Top edge (yRatio = 0): lightness ranges from 100% (left, white) to 50% (right, pure hue)
    // Bottom edge (yRatio = 1): lightness is 0% (black) everywhere
    const topLightness = 100 - xRatio * 50;
    this.currentLightness = topLightness * (1 - yRatio);

    // Update cursor position

    this.updateColor();
    this.updateThumbPositions();
  }

  updateFromHueSlider(e) {
    const rect = this.hueSlider.getBoundingClientRect();
    const cssWidth = this.hueSlider.offsetWidth;
    const zoom = cssWidth > 0 ? rect.width / cssWidth : 1;
    let x = (e.clientX - rect.left) / zoom;

    // Clamp value
    x = Math.max(0, Math.min(x, cssWidth));

    // Convert to hue (0-360)
    this.currentHue = (x / cssWidth) * 360;

    this.drawCanvas();
    this.updateColor();
    this.updateThumbPositions();
  }

  drawCanvas() {
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Draw the saturation-lightness gradient for the current hue
    // Standard HSL color picker:
    // - Top-right: pure saturated hue
    // - Top-left: white
    // - Bottom: black
    // - Left edge: greyscale
    // - Right edge: saturated color

    //Fill with pure saturated hue
    this.ctx.fillStyle = `hsl(${this.currentHue}, 100%, 50%)`;
    this.ctx.fillRect(0, 0, width, height);

    //Add white gradient from left (reduces saturation)
    const gradientH = this.ctx.createLinearGradient(0, 0, width, 0);
    gradientH.addColorStop(0, '#ffffff');
    gradientH.addColorStop(1, 'rgba(255, 255, 255, 0)');
    this.ctx.fillStyle = gradientH;
    this.ctx.fillRect(0, 0, width, height);

    //Add black gradient from top to bottom (reduces lightness)
    const gradientV = this.ctx.createLinearGradient(0, 0, 0, height);
    gradientV.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradientV.addColorStop(1, 'rgba(0, 0, 0, 1)');
    this.ctx.fillStyle = gradientV;
    this.ctx.fillRect(0, 0, width, height);
  }

  /**
   * Update color preview and value displays based on current HSL state
   * @author Ali Aldaghishy
   */
  updateColor() {
    const hslColor = {
      h: this.currentHue,
      s: this.currentSaturation / 100,
      l: this.currentLightness / 100,
      mode: ColorFormat.HSL,
    };

    // Get selected format
    const formatSelect = this.overlay.querySelector('#format-select');
    const selectedFormat = formatSelect.value;

    // Update preview
    this.colorPreview.style.backgroundColor = convertColor(
      hslColor,
      ColorFormat.HEX
    ).value;

    // Update color values based on selected format
    if (selectedFormat === ColorFormat.RGB) {
      const rgbColor = convertColor(hslColor, ColorFormat.RGB);

      this.rValue.textContent = Math.round(rgbColor.r * 255);
      this.gValue.textContent = Math.round(rgbColor.g * 255);
      this.bValue.textContent = Math.round(rgbColor.b * 255);

      this.gValue.contentEditable = 'true';
      this.bValue.contentEditable = 'true';
    } else if (selectedFormat === ColorFormat.HEX) {
      const hexColor = convertColor(hslColor, ColorFormat.HEX);

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

      this.setColor({
        r: r / 255,
        g: g / 255,
        b: b / 255,
        mode: ColorFormat.RGB,
      });
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
      this.setColor({
        h,
        s: s / 100,
        l: l / 100,
        mode: ColorFormat.HSL,
      });
    } else if (selectedFormat === ColorFormat.HEX) {
      // Parse HEX value
      const hex = /^#[0-9A-Fa-f]{6}$/.test(this.rValue.textContent.trim())
        ? this.rValue.textContent.trim()
        : '#000000';

      this.setColor(hex);
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

      this.setColor({
        l,
        c,
        h,
        mode: ColorFormat.OKLCH,
      });
    }

    // Update the canvas and preview and thumb positions
    this.drawCanvas();
    this.updateColor();
    this.updateThumbPositions();
  }

  /**
   * Update thumb positions based on current HSL state
   * @author Ali Aldaghishy
   */
  updateThumbPositions() {
    // Use offsetWidth/offsetHeight (CSS pixels) for positioning,
    // since cursor left/top are set in CSS pixels
    const cssWidth = this.canvasElement.offsetWidth;
    const cssHeight = this.canvasElement.offsetHeight;

    // X position is straightforward - based on saturation (0% left to 100% right)
    const x = (this.currentSaturation / 100) * cssWidth;
    const xRatio = x / cssWidth;

    // Y position: solve for y from lightness equation
    // currentLightness = topLightness * (1 - yRatio)
    // where topLightness = 100 - xRatio * 50
    const topLightness = 100 - xRatio * 50;
    const yRatio =
      topLightness > 0 ? 1 - this.currentLightness / topLightness : 1;
    const y = yRatio * cssHeight;

    this.canvasCursor.style.left = x + 'px';
    this.canvasCursor.style.top = y + 'px';
    // Update hue thumb position
    const hueCssWidth = this.hueSlider.offsetWidth;
    const hueX = (this.currentHue / 360) * hueCssWidth;
    this.hueThumb.style.left = hueX + 'px';
  }

  open() {
    this.overlay.classList.add('active');
    this.drawCanvas();

    this.updateThumbPositions();
  }

  close() {
    this.overlay.classList.remove('active');
  }
}
