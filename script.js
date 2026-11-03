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
