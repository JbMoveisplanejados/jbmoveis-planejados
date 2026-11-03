const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImg');
const modalCaption = document.getElementById('modalCaption');

for (const button of document.querySelectorAll('[data-image]')) {
  button.addEventListener('click', () => {
    modalImage.src = button.dataset.image;
    modalImage.alt = button.querySelector('img').alt;
    modalCaption.textContent = button.dataset.caption;
    modal.showModal();
    document.body.classList.add('modal-open');
  });
}

modal.querySelector('.modal-close').addEventListener('click', () => modal.close());
modal.addEventListener('click', (event) => {
  if (event.target === modal) modal.close();
});
modal.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
});
document.getElementById('year').textContent = new Date().getFullYear();

// The complete catalog is present in HTML; JavaScript adds search and pagination.
const catalog = document.querySelector('.catalog');
const catalogCards = [...catalog.querySelectorAll('.catalog-card')];
const catalogSearch = document.getElementById('catalog-search');
const catalogCategory = document.getElementById('catalog-category');
const catalogStatus = document.getElementById('catalog-status');
const catalogMore = catalog.querySelector('.catalog-more');
const catalogEmpty = catalog.querySelector('.catalog-empty');
const pageSize = 12;
let visibleLimit = pageSize;

const normalize = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
const searchableCards = catalogCards.map((card) => ({
  element: card,
  text: normalize(`${card.querySelector('h3').textContent} ${card.querySelector('p').textContent} ${card.dataset.category}`),
}));

function updateCatalog() {
  const terms = normalize(catalogSearch.value.trim()).split(/\s+/).filter(Boolean);
  const matches = searchableCards.filter(({element, text}) =>
    (!catalogCategory.value || element.dataset.category === catalogCategory.value) &&
    terms.every((term) => text.includes(term)),
  );
  const shown = new Set(matches.slice(0, visibleLimit).map(({element}) => element));
  for (const card of catalogCards) card.hidden = !shown.has(card);
  catalogMore.hidden = matches.length <= visibleLimit;
  catalogEmpty.hidden = matches.length > 0;
  catalogStatus.textContent = matches.length
    ? `Mostrando ${shown.size} de ${matches.length} ${matches.length === 1 ? 'ideia encontrada' : 'ideias encontradas'}`
    : 'Nenhuma ideia encontrada com esses filtros.';
}

function resetCatalogPage() {
  visibleLimit = pageSize;
  updateCatalog();
}

catalogSearch.addEventListener('input', resetCatalogPage);
catalogCategory.addEventListener('change', resetCatalogPage);
catalogMore.addEventListener('click', () => {
  const previous = new Set(catalogCards.filter((card) => !card.hidden));
  visibleLimit += pageSize;
  updateCatalog();
  // Keep keyboard focus in the newly revealed items, even on the final page.
  const next = catalogCards.find((card) => !card.hidden && !previous.has(card));
  next?.querySelector('button').focus({preventScroll: true});
});
catalog.querySelector('.catalog-clear').addEventListener('click', () => {
  catalogSearch.value = '';
  catalogCategory.value = '';
  resetCatalogPage();
  catalogSearch.focus();
});
catalog.querySelector('.catalog-tools').hidden = false;
updateCatalog();
