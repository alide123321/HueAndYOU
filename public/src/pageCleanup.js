function normalizeText(value) {
  return (value || '').trim().toLowerCase();
}

function removeSectionByHeading(headingText) {
  const target = normalizeText(headingText);
  const headings = document.querySelectorAll('h1, h2, h3, h4, strong');

  headings.forEach((heading) => {
    if (normalizeText(heading.textContent) !== target) return;

    const container = heading.closest(
      'section, nav, aside, article, div, footer'
    );
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });
}

function removeRedirectParagraphs() {
  const paragraphs = document.querySelectorAll('p');

  paragraphs.forEach((paragraph) => {
    if (/^redirecting to/i.test((paragraph.textContent || '').trim())) {
      paragraph.remove();
    }
  });
}

function removeUnwantedBottomSections() {
  removeSectionByHeading('Additional Links');
  removeRedirectParagraphs();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', removeUnwantedBottomSections);
} else {
  removeUnwantedBottomSections();
}
