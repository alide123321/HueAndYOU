let activeToast = null;
let dismissTimeoutId = null;

function ensureToastStyles() {
  if (document.getElementById('coming-soon-toast-styles')) return;

  const style = document.createElement('style');
  style.id = 'coming-soon-toast-styles';
  style.textContent = `
    .coming-soon-toast {
      position: fixed;
      right: 1rem;
      bottom: 1rem;
      z-index: 9999;
      max-width: min(90vw, 28rem);
      padding: 0.85rem 1rem;
      border-radius: 0.75rem;
      background: rgba(19, 27, 36, 0.96);
      color: #f4f7fb;
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.12);
      font-size: 0.95rem;
      line-height: 1.4;
      transform: translateY(12px);
      opacity: 0;
      transition: opacity 180ms ease, transform 180ms ease;
    }

    .coming-soon-toast.visible {
      opacity: 1;
      transform: translateY(0);
    }

    @media (max-width: 640px) {
      .coming-soon-toast {
        left: 1rem;
        right: 1rem;
        max-width: none;
      }
    }
  `;

  document.head.appendChild(style);
}

export function showComingSoonToast(featureName) {
  ensureToastStyles();

  if (dismissTimeoutId) {
    clearTimeout(dismissTimeoutId);
    dismissTimeoutId = null;
  }

  if (activeToast) {
    activeToast.remove();
    activeToast = null;
  }

  const toast = document.createElement('div');
  toast.className = 'coming-soon-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = `${featureName} is not done yet, sorry. It will be done soon.`;

  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));

  dismissTimeoutId = window.setTimeout(() => {
    toast.classList.remove('visible');
    window.setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
      if (activeToast === toast) activeToast = null;
    }, 180);
  }, 2600);

  activeToast = toast;
}
