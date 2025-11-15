// Sort gallery cards by image area from bigger to smaller
(function () {
  function computeArea(img) {
    try {
      const nw = img.naturalWidth || 0;
      const nh = img.naturalHeight || 0;
      if (nw && nh) return nw * nh;
      const rect = img.getBoundingClientRect();
      return Math.max(1, Math.round(rect.width * rect.height));
    } catch (e) {
      return 1;
    }
  }

  function sortGallery(grid, order) {
    const cards = Array.from(grid.querySelectorAll('.gallery-card'));
    const entries = cards.map(card => {
      const img = card.querySelector('.gallery-img');
      const area = img ? computeArea(img) : 1;
      return { card, area };
    });
    entries.sort((a, b) => {
      return order === 'asc' ? a.area - b.area : b.area - a.area;
    });
    const frag = document.createDocumentFragment();
    entries.forEach(e => frag.appendChild(e.card));
    while (grid.firstChild) grid.removeChild(grid.firstChild);
    grid.appendChild(frag);
  }

  function init() {
    const grids = document.querySelectorAll('.gallery-grid');
    if (!grids.length) return;
    const images = Array.from(document.querySelectorAll('.gallery-img'));
    // Ensure images have dimensions before sorting
    Promise.all(images.map(img => img.decode ? img.decode().catch(() => {}) : Promise.resolve()))
      .finally(() => {
        grids.forEach(grid => sortGallery(grid, 'desc'));
      });
  }

  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init, { once: true });
  }
})();
