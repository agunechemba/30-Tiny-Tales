/* ============================================================
   30 TINY TALES — navigation engine
   ============================================================ */

document.body.classList.add('js-ready');

const pages        = Array.from(document.querySelectorAll('.book-page'));
const progressFill = document.querySelector('.reading-progress-fill');
const pageIndicator = document.querySelector('.page-indicator');
const pageHint      = document.querySelector('.page-hint');
const navButtons    = Array.from(document.querySelectorAll('[data-nav]'));

let currentPage = 0;

/* ------------------------------------------------------------
   Core: show a page by index
   ------------------------------------------------------------ */
function showPage(index, { animate = true } = {}) {
  if (index < 0 || index >= pages.length) return;
  currentPage = index;

  pages.forEach((p, i) => {
    const isActive = i === index;
    p.classList.toggle('active', isActive);
    if (isActive) {
      p.classList.remove('page-enter');
      if (animate) {
        // Force reflow so the animation replays on every visit
        void p.offsetWidth;
        p.classList.add('page-enter');
      }
    }
  });

  // Progress bar
  const pct = ((index + 1) / pages.length) * 100;
  if (progressFill) progressFill.style.width = pct + '%';

  // Page indicator
  if (pageIndicator) {
    pageIndicator.textContent = `Page ${index + 1} of ${pages.length}`;
  }

  // Hide the keyboard hint once the reader has left the cover
  if (pageHint) {
    pageHint.classList.toggle('hidden', index === 0);
  }

  // Keep the URL hash in sync (without jumping)
  const id = pages[index].id;
  if (id) {
    history.replaceState(null, '', '#' + id);
  }

  // Start each fresh page at its beginning
  window.scrollTo({ top: 0, behavior: 'smooth' });

  updateNavButtons();
}

/* ------------------------------------------------------------
   Disable Previous on the first page and Next on the last
   ------------------------------------------------------------ */
function updateNavButtons() {
  navButtons.forEach(btn => {
    const dir = btn.dataset.nav;
    if (dir === 'prev') {
      btn.disabled = currentPage === 0;
    } else if (dir === 'next') {
      btn.disabled = currentPage === pages.length - 1;
    }
  });
}

/* ------------------------------------------------------------
   Nav buttons
   ------------------------------------------------------------ */
navButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const dir = btn.dataset.nav;
    if (dir === 'prev')       showPage(currentPage - 1);
    else if (dir === 'next')  showPage(currentPage + 1);
    else if (dir === 'first') showPage(0);
  });
});

/* ------------------------------------------------------------
   Keyboard navigation
   ------------------------------------------------------------ */
document.addEventListener('keydown', (e) => {
  // Ignore while typing in a form field
  const tag = (e.target && e.target.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

  switch (e.key) {
    case 'ArrowRight':
    case 'PageDown':
      showPage(currentPage + 1);
      e.preventDefault();
      break;
    case 'ArrowLeft':
    case 'PageUp':
      showPage(currentPage - 1);
      e.preventDefault();
      break;
    case 'Home':
      showPage(0);
      e.preventDefault();
      break;
    case 'End':
      showPage(pages.length - 1);
      e.preventDefault();
      break;
  }
});

/* ------------------------------------------------------------
   Table of Contents links
   ------------------------------------------------------------ */
document.querySelectorAll('.toc-page a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href').slice(1);
    const idx = pages.findIndex(p => p.id === targetId);
    if (idx >= 0) showPage(idx);
  });
});

/* ------------------------------------------------------------
   Browser back / forward buttons
   ------------------------------------------------------------ */
window.addEventListener('hashchange', () => {
  const id = window.location.hash.slice(1);
  if (!id) return;
  const idx = pages.findIndex(p => p.id === id);
  if (idx >= 0 && idx !== currentPage) showPage(idx);
});

/* ------------------------------------------------------------
   Initial page: honour the hash, otherwise start at the cover
   ------------------------------------------------------------ */
(function init() {
  const id  = window.location.hash.slice(1);
  const idx = id ? pages.findIndex(p => p.id === id) : 0;
  showPage(idx >= 0 ? idx : 0, { animate: false });
})();