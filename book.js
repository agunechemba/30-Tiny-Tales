// book.js
(function () {
  'use strict';

  var STORAGE_KEY = 'coding-storybook-read';
  var TOTAL = 21;

  function readList() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
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

  var body = document.body;
  var chapter = body.getAttribute('data-chapter');

  // Mark this chapter as read
  if (chapter) markRead(chapter);

  // Animate the progress bar on story pages
  if (chapter) {
    var fill = document.querySelector('.bar i');
    if (fill) {
      var n = parseInt(chapter, 10) || 0;
      setTimeout(function () {
        fill.style.width = (n / TOTAL * 100) + '%';
      }, 200);
    }
  }

  // Mark read cards on the index page
  var read = readList();
  var cards = document.querySelectorAll('.chapter-card[data-chapter]');
  Array.prototype.forEach.call(cards, function (card) {
    if (read.indexOf(card.getAttribute('data-chapter')) !== -1) {
      card.classList.add('is-read');
    }
  });

  var counter = document.querySelector('[data-read-count]');
  if (counter) counter.textContent = read.length;

  // Keyboard page turning
  var prev = document.querySelector('.page-nav .prev');
  var next = document.querySelector('.page-nav .next');

  document.addEventListener('keydown', function (e) {
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    if (e.key === 'ArrowLeft' && prev) window.location.href = prev.getAttribute('href');
    if (e.key === 'ArrowRight' && next) window.location.href = next.getAttribute('href');
  });

  // Friendly hint under the nav
  if (prev && next) {
    var hint = document.createElement('p');
    hint.className = 'key-hint';
    hint.textContent = 'Tip: press ← and → on your keyboard to turn the page.';
    var nav = document.querySelector('.page-nav');
    if (nav && nav.parentNode) {
      nav.parentNode.insertBefore(hint, nav.nextSibling);
    }
  }
})();