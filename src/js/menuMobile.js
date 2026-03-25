function menuMobile() {
  const body = document.body;
  const togglers = document.querySelectorAll('.m-item');

  if (!body || !togglers.length) return;

  togglers.forEach(btn => {
    btn.addEventListener('click', () => body.classList.toggle('menu-in'));
  });
}

export default menuMobile;