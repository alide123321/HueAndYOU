import {ColorRole} from '/shared/utils/constants.js';
import {Color} from '/shared/types/Color.js';
import {getTextColor} from '/shared/utils/textColorOverlay.js';

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
    .addEventListener('click', togglePreviewPanel);
  document
    .getElementById('preview-close-btn')
    .addEventListener('click', togglePreviewPanel);
}

/**
 * Reveals the preview toggle tab when a palette is loaded.
 * @author Ali Aldaghishy
 */
export function showPreviewTab() {
  document.getElementById('preview-toggle-tab').classList.remove('hidden');
}

/**
 * Hides the preview toggle tab and closes the panel if it is currently open.
 * @author Ali Aldaghishy
 */
export function hidePreviewTab() {
  document.getElementById('preview-toggle-tab').classList.add('hidden');
  if (_previewPanelOpen) togglePreviewPanel();
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
  const chevron = tab.querySelector('.preview-tab-chevron');

  if (_previewPanelOpen) {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    tab.classList.add('panel-open');
    chevron.textContent = '\u2039'; // ‹ close direction
    updatePreviewPanel();
  } else {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    tab.classList.remove('panel-open');
    chevron.textContent = '\u203A'; // › open direction
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
  const bgColor = roleColors[ColorRole.BACKGROUND];
  const textColorRole = roleColors[ColorRole.TEXT];

  const primary = (primaryColor && primaryColor.getHEX().value) || '#406BA0';
  const secondary =
    (secondaryColor && secondaryColor.getHEX().value) || '#334155';
  const accent = (accentColor && accentColor.getHEX().value) || '#f59e0b';
  const bg = (bgColor && bgColor.getHEX().value) || '#f8fafc';
  const text = (textColorRole && textColorRole.getHEX().value) || '#1e293b';

  const onPrimary = getTextColor(primaryColor || Color.fromHex(primary)).value;
  const onSecondary = getTextColor(
    secondaryColor || Color.fromHex(secondary)
  ).value;
  const onAccent = getTextColor(accentColor || Color.fromHex(accent)).value;

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
          <div class="mock-section-label" style="color:${text}">Recent Activity</div>
          <div class="mock-list">
            <div class="mock-list-item" style="border-left:3px solid ${primary}">
              <span class="mock-list-title" style="color:${text}">Project Alpha updated</span>
              <span class="mock-list-badge" style="background:${primary}; color:${onPrimary}">New</span>
            </div>
            <div class="mock-list-item" style="border-left:3px solid ${accent}">
              <span class="mock-list-title" style="color:${text}">New user registered</span>
              <span class="mock-list-badge" style="background:${accent}; color:${onAccent}">Alert</span>
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
    </div>
  `;
}
