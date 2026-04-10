import {
  FilterType,
  ColorRole,
  ColorFormat,
  ColorHarmony,
} from '../shared/utils/constants.js';
import {toggleTheme} from './toggleThemeBtn.js';
import {buildPaletteCard} from './paletteCardBuilder.js';
import {Color} from '../shared/types/Color.js';
import {Palette} from '../shared/types/Palette.js';
import {WCAGAnalyzer} from '../shared/accessibility/WCAGAnalyzer.js';
import {convertColor} from '../shared/utils/colorConversion.js';

// init theme
const themeToggleBtn = document.getElementById('about-theme-toggle');
const examplePaletteContainer = document.getElementById('example-palette');

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
  drawHarmonyWheel(currentHarmony, baseHue); // Re-render canvas elements for new theme colors
});

/** Hex values shared between the example palette card and Tab 4 visuals. */
const exampleColors = {
  primary: '#406ba0',
  secondary: '#5f8cc7',
  accent: '#8fb3e3',
  background: '#c4d8f2',
  text: '#1f2a36',
};

/**
 * Creates a hardcoded example palette for display on the About page.
 * @returns {Palette} A Palette instance with Primary, Secondary, Accent, Background, and Text colors.
 */
function createExamplePalette() {
  const colorMap = new Map([
    [Color.fromHex(exampleColors.primary), ColorRole.PRIMARY],
    [Color.fromHex(exampleColors.secondary), ColorRole.SECONDARY],
    [Color.fromHex(exampleColors.accent), ColorRole.ACCENT],
    [Color.fromHex(exampleColors.background), ColorRole.BACKGROUND],
    [Color.fromHex(exampleColors.text), ColorRole.TEXT],
  ]);

  return new Palette(colorMap, document.body.classList.contains('dark-mode'));
}

if (examplePaletteContainer) {
  const examplePalette = createExamplePalette();
  const paletteCard = buildPaletteCard(examplePalette, 1, () => {});

  const buttons = paletteCard.querySelectorAll('button');
  buttons.forEach((btn) => {
    btn.setAttribute('aria-disabled', 'true');
    btn.tabIndex = -1;
    btn.classList.add('about-btn-disabled');
  });

  examplePaletteContainer.appendChild(paletteCard);
}

// code for revealing sections while scrolling (just looks nicer than them all popping in at once)
const revealSections = document.querySelectorAll('[data-reveal]');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {threshold: 0.1}
);
revealSections.forEach((s) => revealObserver.observe(s));

// TABBED INTERFACE - handles switching between the 4 "Base Color", "Harmony Type", "Offsets", and "Palette" tabs
const tabButtons = document.querySelectorAll('.about-tab');
const tabPanels = document.querySelectorAll('.about-tab-panel');
tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabButtons.forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    tabPanels.forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

/**
 * Builds animated hero swatch circles from a spread of OKLCH hues.
 * Appends colored div elements to the #hero-swatches container.
 * @author: Ali Aldaghishy
 */
(function buildHeroSwatches() {
  const container = document.getElementById('hero-swatches');
  if (!container) return;
  const hues = [210, 30, 150, 330, 270];
  hues.forEach((h) => {
    const el = document.createElement('div');
    el.className = 'hero-swatch';
    el.style.backgroundColor = convertColor(
      {mode: 'oklch', l: 0.72, c: 0.14, h},
      ColorFormat.HEX
    ).value;
    container.appendChild(el);
  });
})();

const baseHue = 210;

/**
 * Populates the four tab panels in the "How It Works" section with
 * inline visual elements (swatches, offset diagrams, role-labeled palette).
 * @author Ali Aldaghishy
 */
(function buildTabVisuals() {
  // Tab 1: Base Color - show a large swatch
  const baseVis = document.getElementById('tab-base-visual');
  if (baseVis) {
    const swatch = document.createElement('div');
    swatch.className = 'tab-swatch-large';
    const baseHex = convertColor(
      {mode: 'oklch', l: 0.58, c: 0.14, h: baseHue},
      ColorFormat.HEX
    ).value;
    swatch.style.backgroundColor = baseHex;
    baseVis.appendChild(swatch);

    const label = document.createElement('span');
    label.className = 'about-body';
    label.style.margin = '0';
    label.textContent = baseHex.toUpperCase();
    label.style.fontFamily = 'monospace';
    label.style.fontWeight = '600';
    baseVis.appendChild(label);
  }

  // Tab 2: Harmony Type - show harmony names with mini swatches
  const harmVis = document.getElementById('tab-harmony-visual');
  if (harmVis) {
    const harmonies = [
      {name: 'Analogous', offsets: [0, 45, -45]},
      {name: 'Complementary', offsets: [0, 180]},
      {name: 'Triadic', offsets: [0, 120, 240]},
      {name: 'Tetradic', offsets: [0, 90, 180, 270]},
      {name: 'Monochromatic', offsets: [0], mono: true},
    ];
    harmonies.forEach((h) => {
      const row = document.createElement('div');
      row.className = 'tab-harmony-row';
      const swatches = document.createElement('div');
      swatches.className = 'tab-harmony-swatches';
      if (h.mono) {
        [0.4, 0.58, 0.75].forEach((l) => {
          const s = document.createElement('div');
          s.className = 'tab-harmony-dot';
          s.style.backgroundColor = convertColor(
            {mode: 'oklch', l, c: 0.08, h: baseHue},
            ColorFormat.HEX
          ).value;
          swatches.appendChild(s);
        });
      } else {
        h.offsets.forEach((o) => {
          const s = document.createElement('div');
          s.className = 'tab-harmony-dot';
          s.style.backgroundColor = convertColor(
            {mode: 'oklch', l: 0.65, c: 0.14, h: (baseHue + o + 360) % 360},
            ColorFormat.HEX
          ).value;
          swatches.appendChild(s);
        });
      }
      const label = document.createElement('span');
      label.className = 'tab-harmony-name';
      label.textContent = h.name;
      row.appendChild(swatches);
      row.appendChild(label);
      harmVis.appendChild(row);
    });
  }

  // Tab 3: Offsets - show base + offset = result
  const offVis = document.getElementById('tab-offsets-visual');
  if (offVis) {
    const offsets = [
      {label: `${baseHue}° + 0°`, hue: baseHue},
      {label: `${baseHue}° + 120°`, hue: (baseHue + 120) % 360},
      {label: `${baseHue}° + 240°`, hue: (baseHue + 240) % 360},
    ];
    offsets.forEach((o) => {
      const item = document.createElement('div');
      item.className = 'tab-offset-item';
      const swatch = document.createElement('div');
      swatch.className = 'tab-offset-swatch';
      swatch.style.backgroundColor = convertColor(
        {mode: 'oklch', l: 0.65, c: 0.14, h: o.hue},
        ColorFormat.HEX
      ).value;
      const text = document.createElement('span');
      text.textContent = `${o.label} = ${o.hue}°`;
      item.appendChild(swatch);
      item.appendChild(text);
      offVis.appendChild(item);
    });
  }

  // Tab 4: Palette - show 5 role-labeled swatches
  const palVis = document.getElementById('tab-palette-visual');
  if (palVis) {
    const roles = [
      {role: ColorRole.PRIMARY, color: exampleColors.primary},
      {role: ColorRole.SECONDARY, color: exampleColors.secondary},
      {role: ColorRole.ACCENT, color: exampleColors.accent},
      {role: ColorRole.BACKGROUND, color: exampleColors.background},
      {role: ColorRole.TEXT, color: exampleColors.text},
    ];
    const palette = document.createElement('div');
    palette.className = 'tab-mini-palette';
    roles.forEach((r) => {
      const wrapper = document.createElement('div');
      const swatch = document.createElement('div');
      swatch.className = 'tab-palette-swatch';
      swatch.style.backgroundColor = r.color;
      const label = document.createElement('span');
      label.className = 'tab-palette-label';
      label.textContent = r.role;
      wrapper.appendChild(swatch);
      wrapper.appendChild(label);
      palette.appendChild(wrapper);
    });
    palVis.appendChild(palette);
  }
})();

let currentHarmony = ColorHarmony.ANALOGOUS;

/**
 * @type {Object<string, number[]>} Hue degree offsets for each harmony type.
 */
const harmonyOffsets = {
  [ColorHarmony.ANALOGOUS]: [0, 45, -45],
  [ColorHarmony.COMPLEMENTARY]: [0, 180],
  [ColorHarmony.TRIADIC]: [0, 120, 240],
  [ColorHarmony.TETRADIC]: [0, 90, 180, 270],
  [ColorHarmony.MONOCHROMATIC]: [0],
};

/**
 * Draws the interactive harmony wheel on the #harmony-wheel canvas.
 * Renders a 360-segment OKLCH hue ring, then overlays dots and connecting
 * lines at the offset angles for the selected harmony type. Handles HiDPI scaling
 * @author Ali Aldaghishy
 * @param {string} harmonyType - One of the keys in harmonyOffsets.
 * @param {number} bHue - Base hue angle in degrees (0-360).
 */
function drawHarmonyWheel(harmonyType, bHue) {
  const canvas = document.getElementById('harmony-wheel');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const dpr = window.devicePixelRatio || 1;
  const cssSize = 320;
  canvas.width = cssSize * dpr;
  canvas.height = cssSize * dpr;
  canvas.style.width = cssSize + 'px';
  canvas.style.height = cssSize + 'px';
  ctx.scale(dpr, dpr);

  const cx = cssSize / 2;
  const cy = cssSize / 2;
  const outerR = cssSize / 2 - 16;
  const innerR = outerR - 30;

  ctx.clearRect(0, 0, cssSize, cssSize);

  // Draw hue ring
  for (let deg = 0; deg < 360; deg++) {
    const startAngle = ((deg - 90) * Math.PI) / 180;
    const endAngle = ((deg - 88.5) * Math.PI) / 180; // slight overlap to avoid gaps
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, startAngle, endAngle);
    ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = convertColor(
      {mode: 'oklch', l: 0.72, c: 0.15, h: deg},
      ColorFormat.HEX
    ).value;
    ctx.fill();
  }

  // Determine angles
  const offsets = harmonyOffsets[harmonyType] || [0];
  const angles = offsets.map((o) => (((bHue + o) % 360) + 360) % 360);
  const dotR = (innerR + outerR) / 2;

  const isDark = document.body.classList.contains('dark-mode');
  const lineColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.35)';

  // Draw connecting lines
  if (angles.length > 1) {
    ctx.beginPath();
    angles.forEach((a, i) => {
      const rad = ((a - 90) * Math.PI) / 180;
      const x = cx + dotR * Math.cos(rad);
      const y = cy + dotR * Math.sin(rad);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    if (angles.length > 2) ctx.closePath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Draw angle arc labels
  if (offsets.length > 1) {
    const labelR = innerR - 20;
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = isDark ? '#aaa' : '#666';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 1; i < offsets.length; i++) {
      const midAngle = bHue + offsets[i] / 2;
      const rad = ((midAngle - 90) * Math.PI) / 180;
      const x = cx + labelR * Math.cos(rad);
      const y = cy + labelR * Math.sin(rad);
      const deg = Math.abs(offsets[i]);
      ctx.fillText(`${deg}°`, x, y);
    }
  }

  // Draw dots
  angles.forEach((a, i) => {
    const rad = ((a - 90) * Math.PI) / 180;
    const x = cx + dotR * Math.cos(rad);
    const y = cy + dotR * Math.sin(rad);
    const dotHex = convertColor(
      {mode: 'oklch', l: 0.72, c: 0.15, h: a},
      ColorFormat.HEX
    ).value;

    // Outer glow
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fillStyle = dotHex;
    ctx.globalAlpha = 0.3;
    ctx.fill();
    ctx.globalAlpha = 1;

    // Main dot
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = dotHex;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Base marker
    if (i === 0) {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? '#000' : '#fff';
      ctx.fill();
    }
  });

  // For monochromatic, show lightness rings in the center
  if (harmonyType === ColorHarmony.MONOCHROMATIC) {
    const lightnesses = [0.35, 0.5, 0.65, 0.8];
    lightnesses.forEach((l, i) => {
      const r = 18 + i * 14;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = convertColor(
        {mode: 'oklch', l, c: 0.1, h: bHue},
        ColorFormat.HEX
      ).value;
      ctx.lineWidth = 6;
      ctx.stroke();
    });
  }
}

/**
 * Populates the mini swatch circles inside a harmony card.
 * For monochromatic, shows lightness variations; for all others,
 * shows the hue-offset colors.
 * @author Ali Aldaghishy
 * @param {string} harmonyType - One of the keys in harmonyOffsets.
 * @param {number} bHue - Base hue angle in degrees (0-360).
 */
function buildMiniSwatches(harmonyType, bHue) {
  const container = document.getElementById(`swatch-${harmonyType}`);
  if (!container) return;
  container.innerHTML = '';
  const offsets = harmonyOffsets[harmonyType] || [0];

  if (harmonyType === ColorHarmony.MONOCHROMATIC) {
    [0.4, 0.58, 0.75].forEach((l) => {
      const s = document.createElement('div');
      s.className = 'mini-swatch';
      s.style.backgroundColor = convertColor(
        {mode: 'oklch', l, c: 0.1, h: bHue},
        ColorFormat.HEX
      ).value;
      container.appendChild(s);
    });
  } else {
    offsets.forEach((o) => {
      const s = document.createElement('div');
      s.className = 'mini-swatch';
      s.style.backgroundColor = convertColor(
        {mode: 'oklch', l: 0.65, c: 0.14, h: (((bHue + o) % 360) + 360) % 360},
        ColorFormat.HEX
      ).value;
      container.appendChild(s);
    });
  }
}

// Initialize swatches for all cards
Object.keys(harmonyOffsets).forEach((type) => buildMiniSwatches(type, baseHue));

// Click handlers
const harmonyCards = document.querySelectorAll('.harmony-card');
harmonyCards.forEach((card) => {
  card.addEventListener('click', () => {
    harmonyCards.forEach((c) => {
      c.classList.remove('active');
      c.setAttribute('aria-pressed', 'false');
    });
    card.classList.add('active');
    card.setAttribute('aria-pressed', 'true');
    currentHarmony = card.dataset.harmony;
    drawHarmonyWheel(currentHarmony, baseHue);
  });
});

// Initial draw
drawHarmonyWheel(currentHarmony, baseHue);

/**
 * Builds the OKLCH color space visualization: three horizontal gradient
 * bars (Lightness, Chroma, Hue) with position markers showing where a
 * sample color sits on each axis.
 * @author Ali Aldaghishy
 */
(function buildOklchVisual() {
  const container = document.getElementById('oklch-visual');
  if (!container) return;

  const sampleL = 0.58,
    sampleC = 0.14,
    sampleH = 210;
  container.className = 'oklch-bar-group';

  const bars = [
    {
      label: 'Lightness',
      value: sampleL,
      min: 0,
      max: 1,
      gradient: () => {
        const stops = [];
        for (let i = 0; i <= 10; i++) {
          const l = i / 10;
          stops.push(
            `${convertColor({mode: 'oklch', l, c: sampleC, h: sampleH}, ColorFormat.HEX).value} ${i * 10}%`
          );
        }
        return `linear-gradient(to right, ${stops.join(', ')})`;
      },
      display: sampleL.toFixed(2),
    },
    {
      label: 'Chroma',
      value: sampleC,
      min: 0,
      max: 0.35,
      gradient: () => {
        const stops = [];
        for (let i = 0; i <= 10; i++) {
          const c = (i / 10) * 0.35;
          stops.push(
            `${convertColor({mode: 'oklch', l: sampleL, c, h: sampleH}, ColorFormat.HEX).value} ${i * 10}%`
          );
        }
        return `linear-gradient(to right, ${stops.join(', ')})`;
      },
      display: sampleC.toFixed(2),
    },
    {
      label: 'Hue',
      value: sampleH,
      min: 0,
      max: 360,
      gradient: () => {
        const stops = [];
        for (let i = 0; i <= 12; i++) {
          const h = (i / 12) * 360;
          stops.push(
            `${convertColor({mode: 'oklch', l: sampleL, c: sampleC, h}, ColorFormat.HEX).value} ${(i / 12) * 100}%`
          );
        }
        return `linear-gradient(to right, ${stops.join(', ')})`;
      },
      display: `${sampleH}°`,
    },
  ];

  bars.forEach((bar) => {
    const wrap = document.createElement('div');
    wrap.className = 'oklch-bar-wrap';

    const label = document.createElement('div');
    label.className = 'oklch-bar-label';
    label.textContent = bar.label;

    const barEl = document.createElement('div');
    barEl.className = 'oklch-bar';

    const gradient = document.createElement('div');
    gradient.className = 'oklch-bar-gradient';
    gradient.style.background = bar.gradient();

    const pct = ((bar.value - bar.min) / (bar.max - bar.min)) * 100;
    const marker = document.createElement('div');
    marker.className = 'oklch-bar-marker';
    marker.style.left = `${pct}%`;

    const valueLabel = document.createElement('div');
    valueLabel.className = 'oklch-bar-value';
    valueLabel.style.left = `${pct}%`;
    valueLabel.textContent = bar.display;

    barEl.appendChild(gradient);
    barEl.appendChild(marker);
    barEl.appendChild(valueLabel);
    wrap.appendChild(label);
    wrap.appendChild(barEl);
    container.appendChild(wrap);
  });
})();

/**
 * Builds three variant comparison cards showing how adjusting lightness,
 * chroma, or hue spacing from the same base produces different palettes.
 * Each card displays a horizontal swatch strip with a label and description.
 * @author Ali Aldaghishy
 */
(function buildVariantCards() {
  const container = document.getElementById('variant-cards');
  if (!container) return;

  const variants = [
    {
      label: 'Lighter',
      desc: 'Increased lightness across all swatches',
      colors: [
        convertColor(
          {mode: 'oklch', l: 0.73, c: 0.14, h: baseHue},
          ColorFormat.HEX
        ).value,
        convertColor(
          {mode: 'oklch', l: 0.78, c: 0.12, h: baseHue + 45},
          ColorFormat.HEX
        ).value,
        convertColor(
          {mode: 'oklch', l: 0.83, c: 0.1, h: baseHue - 45},
          ColorFormat.HEX
        ).value,
        convertColor(
          {mode: 'oklch', l: 0.9, c: 0.06, h: baseHue},
          ColorFormat.HEX
        ).value,
        convertColor(
          {mode: 'oklch', l: 0.3, c: 0.04, h: baseHue},
          ColorFormat.HEX
        ).value,
      ],
    },
    {
      label: 'Muted',
      desc: 'Reduced chroma for a subtle, restrained feel',
      colors: [
        convertColor(
          {mode: 'oklch', l: 0.58, c: 0.06, h: baseHue},
          ColorFormat.HEX
        ).value,
        convertColor(
          {mode: 'oklch', l: 0.65, c: 0.05, h: baseHue + 45},
          ColorFormat.HEX
        ).value,
        convertColor(
          {mode: 'oklch', l: 0.72, c: 0.04, h: baseHue - 45},
          ColorFormat.HEX
        ).value,
        convertColor(
          {mode: 'oklch', l: 0.85, c: 0.02, h: baseHue},
          ColorFormat.HEX
        ).value,
        convertColor(
          {mode: 'oklch', l: 0.25, c: 0.02, h: baseHue},
          ColorFormat.HEX
        ).value,
      ],
    },
    {
      label: 'Wide Spacing',
      desc: 'Wider hue offsets for more contrast between colors',
      colors: [
        convertColor(
          {mode: 'oklch', l: 0.58, c: 0.14, h: baseHue},
          ColorFormat.HEX
        ).value,
        convertColor(
          {mode: 'oklch', l: 0.65, c: 0.12, h: baseHue + 70},
          ColorFormat.HEX
        ).value,
        convertColor(
          {mode: 'oklch', l: 0.72, c: 0.1, h: baseHue - 70},
          ColorFormat.HEX
        ).value,
        convertColor(
          {mode: 'oklch', l: 0.88, c: 0.05, h: baseHue},
          ColorFormat.HEX
        ).value,
        convertColor(
          {mode: 'oklch', l: 0.22, c: 0.03, h: baseHue},
          ColorFormat.HEX
        ).value,
      ],
    },
  ];

  variants.forEach((v) => {
    const card = document.createElement('div');
    card.className = 'variant-card';

    const swatchRow = document.createElement('div');
    swatchRow.className = 'variant-card-swatches';
    v.colors.forEach((c) => {
      const s = document.createElement('div');
      s.style.backgroundColor = c;
      swatchRow.appendChild(s);
    });

    const label = document.createElement('div');
    label.className = 'variant-card-label';
    label.textContent = v.label;

    const desc = document.createElement('div');
    desc.className = 'variant-card-desc';
    desc.textContent = v.desc;

    card.appendChild(swatchRow);
    card.appendChild(label);
    card.appendChild(desc);
    container.appendChild(card);
  });
})();

/**
 * Builds the WCAG contrast demonstration cards, and shows a colored AAA/AA/FAIL badge.
 * @author Ali Aldaghishy
 */
(function buildWcagDemo() {
  const container = document.getElementById('wcag-demo');
  if (!container) return;

  const demos = [
    {fg: '#1f2a36', bg: '#ffffff'},
    {fg: '#406ba0', bg: '#ffffff'},
    {fg: '#8fb3e3', bg: '#ffffff'},
  ];

  demos.forEach((d) => {
    const fgColor = Color.fromHex(d.fg);
    const bgColor = Color.fromHex(d.bg);
    const ratio = WCAGAnalyzer.computePairContrast(fgColor, bgColor);
    const grade = WCAGAnalyzer.wcagLabel(ratio);

    const card = document.createElement('div');
    card.className = 'wcag-demo-card';

    const preview = document.createElement('div');
    preview.className = 'wcag-demo-preview';
    preview.style.backgroundColor = d.bg;
    preview.style.color = d.fg;
    preview.textContent = 'Aa';

    const info = document.createElement('div');
    info.className = 'wcag-demo-info';

    const ratioEl = document.createElement('span');
    ratioEl.className = 'wcag-demo-ratio';
    ratioEl.textContent = `${ratio.toFixed(2)}:1`;

    const badge = document.createElement('span');
    badge.className = `wcag-badge wcag-badge--${grade.toLowerCase()}`;
    badge.textContent = grade;

    info.appendChild(ratioEl);
    info.appendChild(badge);
    card.appendChild(preview);
    card.appendChild(info);
    container.appendChild(card);
  });
})();

/* ============================================================
   SIDE NAVIGATION ACTIVE SECTION TRACKING
   ============================================================ */

const sideNavLinks = Array.from(
  document.querySelectorAll('.about-side-nav-link')
);

const trackedSections = sideNavLinks
  .map((link) => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return null;

    const section = document.querySelector(href);
    if (!section) return null;

    return {link, section};
  })
  .filter(Boolean);

function setActiveSideNavLink(activeId) {
  trackedSections.forEach(({link, section}) => {
    const isActive = section.id === activeId;
    link.classList.toggle('active', isActive);
  });
}

function updateActiveSection() {
  if (trackedSections.length === 0) return;

  const headerOffset = 110;
  let closestSection = trackedSections[0];
  let closestDistance = Infinity;

  trackedSections.forEach(({link, section}) => {
    const rect = section.getBoundingClientRect();
    const distance = Math.abs(rect.top - headerOffset);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestSection = {link, section};
    }
  });

  setActiveSideNavLink(closestSection.section.id);
}

if (trackedSections.length > 0) {
  sideNavLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href');
      if (!href) return;

      const targetSection = document.querySelector(href);
      if (!targetSection) return;

      setActiveSideNavLink(targetSection.id);

      window.requestAnimationFrame(() => {
        window.setTimeout(updateActiveSection, 100);
      });
    });
  });

  window.addEventListener('scroll', updateActiveSection, {passive: true});
  window.addEventListener('load', updateActiveSection);
  window.addEventListener('resize', updateActiveSection);
  updateActiveSection();
}
