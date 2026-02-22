import {ColorRole, ColorFormat} from '/shared/utils/constants.js';
import {Color} from '/shared/types/Color.js';
import {convertColor} from '/shared/utils/colorConversion.js';
import {WCAGAnalyzer} from '/shared/accessibility/WCAGAnalyzer.js';

/**
 * Returns '#ffffff' or '#000000' based on the luminance of the given Color,
 * ensuring pure neutral contrast for UI elements in the mock preview.
 * @param {Color} color
 * @returns {string}
 */
function contrastText(color) {
  const {r, g, b} = color.getRGB();
  // WCAGAnalyzer.luminance takes 0–255 channels directly.
  const L = WCAGAnalyzer.luminance(r, g, b);
  // 0.179 is the midpoint between black and white in contrast-ratio space.
  return L > 0.179 ? '#000000' : '#ffffff';
}

/**
 * Returns a hue-preserving text color for an alert background that satisfies
 * WCAG AAA (≥ 7:1 contrast). Binary-searches OKLCH lightness toward the
 * background shade, stopping at the closest value that still passes.
 * @param {Color} bgColor
 * @returns {string} hex color string
 */
function alertTextColor(bgColor) {
  const {r, g, b} = bgColor.getRGB();
  // Convert to OKLCH so we can adjust brightness while keeping the same hue.
  const oklch = convertColor(
    {mode: 'rgb', r: r / 255, g: g / 255, b: b / 255},
    ColorFormat.OKLCH
  );
  const isDark = oklch.l < 0.5;

  // Start the search just past the background and walk toward white or black.
  let lo = isDark ? oklch.l : 0;
  let hi = isDark ? 1 : oklch.l;
  let bestHex = isDark ? '#ffffff' : '#000000'; // safe fallback

  // 24 halvings give accuracy to ~1/16 million — plenty for a color value.
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    // ?? 0 handles achromatic colors where hue is undefined.
    const candidate = {mode: 'oklch', l: mid, c: oklch.c, h: oklch.h ?? 0};
    const rgb = convertColor(candidate, ColorFormat.RGB);
    // Wrap in a Color so computePairContrast can accept it (expects 0–255).
    const candidateColor = new Color(
      Math.round(rgb.r * 255),
      Math.round(rgb.g * 255),
      Math.round(rgb.b * 255)
    );
    const contrast = WCAGAnalyzer.computePairContrast(bgColor, candidateColor);

    if (contrast >= 7) {
      bestHex = convertColor(candidate, ColorFormat.HEX).value;
      // Passes — try moving back toward the background for a subtler shade.
      if (isDark) hi = mid;
      else lo = mid;
    } else {
      // Fails — push further from the background to gain more contrast.
      if (isDark) lo = mid;
      else hi = mid;
    }
  }

  return bestHex;
}

let _paletteGetter = null;
let _previewPanelOpen = false;

/**
 * Initializes the preview panel, storing a palette getter and wiring up event listeners.
 * Must be called once after the DOM is ready.
 * @param {Function} paletteGetter - Returns the current Palette object.
 * @author Ali Aldaghishy
 */
export function initPreviewPanel(paletteGetter) {
  _paletteGetter = paletteGetter;
  document
    .getElementById('preview-toggle-tab')
    ?.addEventListener('click', togglePreviewPanel);
  document
    .getElementById('preview-close-btn')
    .addEventListener('click', togglePreviewPanel);
}

/**
 * Reveals the preview toggle tab when a palette is loaded.
 * @author Ali Aldaghishy
 */
export function showPreviewTab() {
  document.getElementById('preview-toggle-tab')?.classList.remove('hidden');
}

/**
 * Hides the preview toggle tab and closes the panel if it is currently open.
 * @author Ali Aldaghishy
 */
export function hidePreviewTab() {
  document.getElementById('preview-toggle-tab')?.classList.add('hidden');
  if (_previewPanelOpen) togglePreviewPanel();
}

/**
 * Opens the preview panel if closed, or refreshes it if already open.
 * @author Ali Aldaghishy
 */
export function openPreviewPanel() {
  if (!_previewPanelOpen) {
    togglePreviewPanel();
  } else {
    updatePreviewPanel();
  }
}

/**
 * Re-renders the preview panel content with the latest palette state.
 * No-ops when the panel is closed or no palette is loaded.
 * @author Ali Aldaghishy
 */
export function updatePreviewPanel() {
  if (!_previewPanelOpen || !_paletteGetter || !_paletteGetter()) return;
  const container = document.getElementById('preview-content');
  if (!container) return;
  container.innerHTML = buildMockWebsiteHTML();
}

/**
 * Toggles the preview panel open or closed.
 * @author Ali Aldaghishy
 */
function togglePreviewPanel() {
  _previewPanelOpen = !_previewPanelOpen;
  const panel = document.getElementById('preview-panel');
  const tab = document.getElementById('preview-toggle-tab');
  const chevron = tab?.querySelector('.preview-tab-chevron');

  if (_previewPanelOpen) {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    tab?.classList.add('panel-open');
    if (chevron) chevron.textContent = '\u2039'; // ‹ close direction
    updatePreviewPanel();
  } else {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    tab?.classList.remove('panel-open');
    if (chevron) chevron.textContent = '\u203A'; // › open direction
  }
}

/**
 * Builds the mock website HTML string using the current palette's role colors.
 * Falls back to sensible defaults for any unassigned role.
 * @author Ali Aldaghishy
 * @returns {string} HTML string for the mock website preview
 */
function buildMockWebsiteHTML() {
  const palette = _paletteGetter();
  const roleColors = {};
  for (const [color, role] of palette.colorMap) {
    if (role) roleColors[role] = color;
  }

  const primaryColor = roleColors[ColorRole.PRIMARY];
  const secondaryColor = roleColors[ColorRole.SECONDARY];
  const accentColor = roleColors[ColorRole.ACCENT];
  const alertColor = roleColors[ColorRole.ALERT];
  const bgColor = roleColors[ColorRole.BACKGROUND];
  const textColorRole = roleColors[ColorRole.TEXT];

  const primary = (primaryColor && primaryColor.getHEX().value) || '#406BA0';
  const secondary =
    (secondaryColor && secondaryColor.getHEX().value) || '#334155';
  const accent = (accentColor && accentColor.getHEX().value) || '#f59e0b';
  const alert = (alertColor && alertColor.getHEX().value) || '#CFAC4D';
  const bg = (bgColor && bgColor.getHEX().value) || '#f8fafc';
  const text = (textColorRole && textColorRole.getHEX().value) || '#1e293b';

  const onPrimary = contrastText(primaryColor || Color.fromHex(primary));
  const onSecondary = contrastText(secondaryColor || Color.fromHex(secondary));
  const onAccent = contrastText(accentColor || Color.fromHex(accent));
  const onAlert = alertTextColor(alertColor || Color.fromHex(alert));

  // onAlert is a hex string, so wrap it in a Color for computePairContrast.
  const alertContrast = WCAGAnalyzer.computePairContrast(
    alertColor || Color.fromHex(alert),
    Color.fromHex(onAlert)
  ).toFixed(2);

  const roleLegend = [
    {label: 'Primary', color: primary},
    {label: 'Secondary', color: secondary},
    {label: 'Accent', color: accent},
    {label: 'Background', color: bg},
    {label: 'Text', color: text},
  ]
    .map(
      ({label, color}) => `
      <span class="preview-role-badge">
        <span class="preview-role-dot" style="background:${color}"></span>
        ${label}
      </span>`
    )
    .join('');

  const alertLegend = `
    <div style="margin-top:10px; padding-top:10px; border-top:1px solid rgba(128,128,128,0.2);">
      <div style="font-size:0.78em; opacity:0.55; margin-bottom:6px;">
        Alert text color is auto-generated to match the alert hue while aiming for WCAG AAA contrast.
      </div>
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <span class="preview-role-dot" style="background:${alert}; width:18px; height:18px; border-radius:50%; flex-shrink:0;"></span>
        <span style="font-size:1.05em; font-weight:600;">${alert.toUpperCase()}</span>
        <span style="opacity:0.4;"> → </span>
        <span class="preview-role-dot" style="background:${onAlert}; width:18px; height:18px; border-radius:50%; flex-shrink:0; outline:1px solid rgba(128,128,128,0.3);"></span>
        <span style="font-size:1.05em; font-weight:600;">${onAlert.toUpperCase()}</span>
        <span style="font-size:1.1em; font-weight:700; opacity:0.85;">${alertContrast}:1</span>
        <span style="font-size:0.8em; background:rgba(128,128,128,0.15); padding:1px 6px; border-radius:4px;">${WCAGAnalyzer.wcagLabel(parseFloat(alertContrast))}</span>
      </div>
      <div style="font-size:0.78em; opacity:0.55; margin-bottom:6px;">
        In a real application, the alert text color would be used for banners, badges, and other UI elements that require high-contrast text on an alert background.
      </div>
      <div style="font-size:0.78em; opacity:0.55; margin-bottom:6px;">
        Be sure to not only rely on color to convey important information in your designs!
      </div>
    </div>`;

  return `
    <div class="mock-site">
      <div class="mock-navbar" style="background:${primary}">
        <div class="mock-navbar-brand" style="color:${onPrimary}">
          <span class="mock-brand-icon" style="background:${onPrimary}; opacity:0.25"></span>
          Brand
        </div>
        <div class="mock-navbar-links">
          <span style="color:${onPrimary}; opacity:0.65">Home</span>
          <span style="color:${onPrimary}; opacity:0.65">Features</span>
          <span style="color:${onPrimary}">Pricing</span>
        </div>
        <div class="mock-navbar-cta" style="background:${accent}; color:${onAccent}">Sign Up</div>
      </div>
      <div class="mock-layout" style="background:${bg}">
        <div class="mock-sidebar" style="background:${secondary}">
          <div class="mock-sidebar-logo" style="color:${onSecondary}; border-bottom:1px solid rgba(255,255,255,0.12); padding-bottom:7px; margin-bottom:3px">MENU</div>
          <div class="mock-sidebar-item" style="background:${primary}; color:${onPrimary}; border-radius:4px; margin:1px 5px">
            <span class="mock-sidebar-dot" style="background:${onPrimary}"></span>Dashboard
          </div>
          <div class="mock-sidebar-item" style="color:${onSecondary}; opacity:0.65">
            <span class="mock-sidebar-dot" style="background:${onSecondary}"></span>Analytics
          </div>
          <div class="mock-sidebar-item" style="color:${onSecondary}; opacity:0.65">
            <span class="mock-sidebar-dot" style="background:${onSecondary}"></span>Projects
          </div>
          <div class="mock-sidebar-item" style="color:${onSecondary}; opacity:0.65">
            <span class="mock-sidebar-dot" style="background:${onSecondary}"></span>Settings
          </div>
        </div>
        <div class="mock-main">
          <div class="mock-stats">
            <div class="mock-stat-card" style="border-top:3px solid ${primary}">
              <div class="mock-stat-label" style="color:${text}">Users</div>
              <div class="mock-stat-value" style="color:${primary}">2,847</div>
            </div>
            <div class="mock-stat-card" style="border-top:3px solid ${accent}">
              <div class="mock-stat-label" style="color:${text}">Revenue</div>
              <div class="mock-stat-value" style="color:${accent}">$14.5k</div>
            </div>
            <div class="mock-stat-card" style="border-top:3px solid ${secondary}">
              <div class="mock-stat-label" style="color:${text}">Active</div>
              <div class="mock-stat-value" style="color:${secondary}">94%</div>
            </div>
          </div>
          <div class="mock-alert-banner" style="background:${alert}; color:${onAlert}; border-radius:4px; padding:5px 10px; margin:4px 0 6px; font-size:0.82em; display:flex; align-items:center; gap:6px;">
            <span>&#9888;</span>
            <span>Scheduled maintenance Sunday at 2:00 AM</span>
          </div>
          <div class="mock-section-label" style="color:${text}">Recent Activity</div>
          <div class="mock-list">
            <div class="mock-list-item" style="border-left:3px solid ${primary}">
              <span class="mock-list-title" style="color:${text}">Project Alpha updated</span>
              <span class="mock-list-badge" style="background:${primary}; color:${onPrimary}">New</span>
            </div>
            <div class="mock-list-item" style="border-left:3px solid ${alert}">
              <span class="mock-list-title" style="color:${text}">New user registered</span>
              <span class="mock-list-badge" style="background:${alert}; color:${onAlert}">Alert</span>
            </div>
            <div class="mock-list-item" style="border-left:3px solid ${secondary}">
              <span class="mock-list-title" style="color:${text}">Deployment successful</span>
              <span class="mock-list-badge" style="background:${secondary}; color:${onSecondary}">Done</span>
            </div>
          </div>
          <div class="mock-buttons">
            <button class="mock-btn" style="background:${primary}; color:${onPrimary}; border-color:${primary}">Primary</button>
            <button class="mock-btn mock-btn-outline" style="color:${primary}; border-color:${primary}">Outline</button>
            <button class="mock-btn" style="background:${accent}; color:${onAccent}; border-color:${accent}">Accent</button>
          </div>
        </div>
      </div>
    </div>
    <div class="preview-role-legend">
      <span class="preview-role-legend-title">Color Roles</span>

      ${roleLegend}

      ${alertLegend}

      <div class="preview-role-legend-wcag-tips" style="font-size:0.92em; margin:4px 0 8px 0;">
      [Placeholder WCAG compliance tips and suggestions]  
      <strong>♿ Accessibility Tips:</strong>
        <ul style="margin:4px 0; padding-left:18px;">
          <li>Ensure text has 4.5:1 contrast ratio for normal text</li>
          <li>Use 3:1 contrast for large text (18pt+)</li>
          <li>Don't rely on color alone to convey information</li>
        </ul>
      </div>
    </div>
  `;
}
