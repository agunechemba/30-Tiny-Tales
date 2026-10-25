// book.js
(function () {
  'use strict';

  // ─── Version bump: invalidates the old 21-chapter read list ──────────────
  var STORAGE_KEY = 'coding-storybook-read-v2';

  // ─── Derive total from the DOM (index page), else from "Chapter X of N" ──
  function getTotal() {
    var cards = document.querySelectorAll('.chapter-card[data-chapter]');
    if (cards.length) return cards.length;

    var prog = document.querySelector('.progress span:first-child');
    if (prog) {
      var m = prog.textContent.match(/of\s+(\d+)/i);
      if (m) return parseInt(m[1], 10);
    }
    return 30; // safe default
  }

  var TOTAL = getTotal();

  // ─── Read-list helpers ───────────────────────────────────────────────────
  function readList() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function saveList(arr) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch (e) {}
  }

  function markRead(id) {
    var arr = readList();
    if (arr.indexOf(id) === -1) {
      arr.push(id);
      saveList(arr);
    }
  }

  // ─── Build a set of chapter IDs that actually exist in this book ────────
  function validChapters() {
    var cards = document.querySelectorAll('.chapter-card[data-chapter]');
    if (!cards.length) return null; // story page: no card list available
    var set = Object.create(null);
    Array.prototype.forEach.call(cards, function (c) {
      set[c.getAttribute('data-chapter')] = true;
    });
    return set;
  }

  // ─── Update the index page's card badges and counter ────────────────────
  function paintIndexState() {
    var existing = validChapters();
    var read = readList();

    var cards = document.querySelectorAll('.chapter-card[data-chapter]');
    var validReadCount = 0;

    Array.prototype.forEach.call(cards, function (card) {
      var id = card.getAttribute('data-chapter');
      if (read.indexOf(id) !== -1) {
        card.classList.add('is-read');
        validReadCount++;
      } else {
        card.classList.remove('is-read');
      }
    });

    var counter = document.querySelector('[data-read-count]');
    if (counter) {
      counter.textContent = existing ? validReadCount : read.length;
    }

    // Optional: reflect read count in the topbar progress on the index page
    var topFill = document.querySelector('.topbar .bar i');
    if (topFill && existing) {
      var pct = TOTAL ? (validReadCount / TOTAL) * 100 : 0;
      topFill.style.width = pct + '%';
    }
  }

  // ─── Main init ──────────────────────────────────────────────────────────
  function init() {
    var body = document.body;
    var chapter = body.getAttribute('data-chapter');

    // Story page: record this chapter as read
    if (chapter) markRead(chapter);

    // Story page: animate the progress bar after the browser has painted
    if (chapter) {
      var fill = document.querySelector('.bar i');
      if (fill) {
        var n = parseInt(chapter, 10) || 0;
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            fill.style.width = (n / TOTAL * 100) + '%';
          });
        });
      }
    }

    // Index page: mark cards as read and update the counter
    if (document.querySelectorAll('.chapter-card[data-chapter]').length) {
      paintIndexState();
    }

    // ─── Keyboard page turning ──────────────────────────────────────────
    var prev = document.querySelector('.page-nav .prev');
    var next = document.querySelector('.page-nav .next');

    if (prev || next) {
      document.addEventListener('keydown', function (e) {
        // Don't hijack typing or modifier combos
        if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
        if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;

        if (e.key === 'ArrowLeft' && prev) {
          e.preventDefault();
          window.location.href = prev.getAttribute('href');
        } else if (e.key === 'ArrowRight' && next) {
          e.preventDefault();
          window.location.href = next.getAttribute('href');
        }
      });

      // Friendly hint under the nav
      var hint = document.createElement('p');
      hint.className = 'key-hint';
      hint.textContent = 'Tip: press ← and → on your keyboard to turn the page.';
      var nav = document.querySelector('.page-nav');
      if (nav && nav.parentNode) nav.parentNode.insertBefore(hint, nav.nextSibling);
    }

    // ─── Cross-tab sync: if another tab updates the read list, refresh ───
    window.addEventListener('storage', function (e) {
      if (e.key === STORAGE_KEY) {
        if (document.querySelectorAll('.chapter-card[data-chapter]').length) {
          paintIndexState();
        }
      }
    });
  }

  // ─── Boot ───────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();