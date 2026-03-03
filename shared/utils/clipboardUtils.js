/**
 * Adds a click listener to `element` that copies `text` to the clipboard.
 * On success, temporarily replaces `labelEl.textContent` with 'COPIED!' for 1 second.
 * @author Ali Aldaghishy
 * @warning This function is browser-only and must NOT be imported or executed in a server-side (Node.js) context.
 *
 * @param {HTMLElement} element - The element to attach the click listener to
 * @param {string} text - The text to copy to the clipboard
 * @param {HTMLElement} labelEl - The element whose text content shows the copy feedback
 */
export function addCopyListener(element, text, labelEl) {
  let restoreTimer = null;
  let originalText = null;
  element.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(text);
      if (!restoreTimer) originalText = labelEl.textContent;
      labelEl.textContent = 'COPIED!';
      clearTimeout(restoreTimer);
      restoreTimer = setTimeout(() => {
        labelEl.textContent = originalText;
        restoreTimer = null;
        originalText = null;
      }, 1000);
    } catch (err) {
      console.error('Failed to copy color:', err);
    }
  });
}
