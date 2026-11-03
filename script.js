const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImg');
const modalCaption = document.getElementById('modalCaption');
const modalFrame = document.getElementById('modalImageFrame');
let modalOpener;

for (const button of document.querySelectorAll('[data-image]')) {
  button.addEventListener('click', () => {
    modalOpener = button;
    const isCatalogPhoto = button.dataset.photoColumn !== undefined;
    modalFrame.classList.toggle('catalog-photo-frame', isCatalogPhoto);
    modalFrame.style.setProperty('--photo-left', `${-100 * Number(button.dataset.photoColumn || 0)}%`);
    modalFrame.style.setProperty('--photo-top', `${-100 * Number(button.dataset.photoRow || 0)}%`);
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
  modalOpener?.focus({preventScroll: true});
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

// The vendor receives a link that opens the exact product reference, not the photo sheet.
const finder = document.getElementById('finderDialog');
const finderSearch = document.getElementById('finder-search');
const finderResults = document.getElementById('finder-results');
const finderStatus = document.getElementById('finder-status');
const finderMore = document.getElementById('finder-more');
const finderSelected = document.getElementById('finder-selected');
const finderHint = document.getElementById('finder-hint');
const finderSessionKey = 'jb-finder-visited';
let finderLimit = 6;
let selectedProduct = null;
let finderOpener;

function openFinder(opener) {
  finderOpener = opener;
  renderFinder();
  finder.showModal();
  try { sessionStorage.setItem(finderSessionKey, '1'); } catch { /* Storage may be unavailable. */ }
  document.body.classList.add('modal-open');
  finderSearch.focus({preventScroll: true});
  finder.scrollTop = 0;
}

function selectProduct(card) {
  selectedProduct = card;
  document.getElementById('finder-selected-name').textContent = card.querySelector('h3').textContent;
  document.getElementById('finder-send').href = card.querySelector('.catalog-details a').href;
  finderSelected.hidden = false;
  finderHint.hidden = true;
  for (const option of finderResults.querySelectorAll('button')) {
    option.setAttribute('aria-pressed', String(option.dataset.product === card.dataset.product));
  }
}

function clearFinderSelection() {
  selectedProduct = null;
  finderSelected.hidden = true;
  finderHint.hidden = false;
  document.getElementById('finder-send').removeAttribute('href');
}

function renderFinder() {
  const terms = normalize(finderSearch.value.trim()).split(/\s+/).filter(Boolean);
  const matches = searchableCards.filter(({text}) => terms.every((term) => text.includes(term)));
  if (!terms.length) {
    // Start with a mix of niches, tables, living room, bedroom and other categories.
    const order = (card) => {
      const index = catalogCards.indexOf(card);
      return (index % 8) * 7 + Math.floor(index / 8);
    };
    matches.sort((a, b) => order(a.element) - order(b.element));
  }
  finderResults.replaceChildren();
  for (const {element: card} of matches.slice(0, finderLimit)) {
    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'finder-option';
    option.dataset.product = card.dataset.product;
    option.setAttribute('aria-pressed', String(card === selectedProduct));
    const source = card.querySelector('.catalog-image');
    const photo = document.createElement('span');
    photo.className = 'finder-photo';
    photo.style.cssText = source.style.cssText;
    const image = source.querySelector('img').cloneNode();
    image.alt = '';
    photo.append(image);
    const details = document.createElement('span');
    const name = document.createElement('strong');
    name.textContent = card.querySelector('h3').textContent;
    const category = document.createElement('small');
    category.textContent = card.dataset.category;
    details.append(name, category);
    option.append(photo, details);
    option.addEventListener('click', () => selectProduct(card));
    finderResults.append(option);
  }
  const shown = Math.min(finderLimit, matches.length);
  finderStatus.textContent = matches.length
    ? `${shown} de ${matches.length} opções. Toque no móvel para escolher.`
    : 'Nenhuma opção encontrada com esse nome.';
  finderMore.hidden = matches.length <= finderLimit;
  document.getElementById('finder-empty').hidden = matches.length > 0;
  const customMessage = `Olá! Estou procurando um móvel em MDF: ${finderSearch.value.trim()}. Podemos conversar sobre um orçamento?`;
  document.getElementById('finder-custom').href = `https://wa.me/5521989300187?text=${encodeURIComponent(customMessage)}`;
}

finderSearch.addEventListener('input', () => {
  finderLimit = 6;
  clearFinderSelection();
  renderFinder();
});
finderMore.addEventListener('click', () => {
  const previousCount = finderResults.childElementCount;
  finderLimit += 6;
  renderFinder();
  finderResults.children[previousCount]?.focus({preventScroll: true});
});
finder.querySelector('.finder-close').addEventListener('click', () => finder.close());
finder.querySelector('.finder-dismiss').addEventListener('click', () => finder.close());
finder.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    finder.close();
  }
});
finder.addEventListener('click', (event) => {
  if (event.target === finder) finder.close();
});
finder.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  try { sessionStorage.setItem(finderSessionKey, '1'); } catch { /* Storage may be unavailable. */ }
  finderOpener?.focus({preventScroll: true});
});
for (const trigger of document.querySelectorAll('[data-finder-open]')) {
  trigger.hidden = false;
  trigger.addEventListener('click', () => openFinder(trigger));
}

const requestedProduct = new URLSearchParams(location.search).get('movel');
const linkedCard = catalogCards.find((card) => card.dataset.product === requestedProduct);
if (linkedCard) {
  catalogSearch.value = linkedCard.querySelector('h3').textContent;
  catalogCategory.value = '';
  resetCatalogPage();
  linkedCard.scrollIntoView({block: 'center', behavior: 'instant'});
  linkedCard.querySelector('.catalog-image').click();
} else {
  let visited = false;
  try { visited = sessionStorage.getItem(finderSessionKey) === '1'; } catch { /* Show on entry if unavailable. */ }
  if (!visited) openFinder();
}
