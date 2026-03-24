function menuMobile( device_data ) {

  if (device_data.isDesktop) return
  
  const html = device_data.html;
  const body = device_data.body;
  const btn_togg = document.querySelectorAll('.togg');

  function menuToggler() {

    const toggler = document.querySelector('body.toggler');

    if ( toggler.classList.contains('menu-in') ) {

      toggler.classList.toggle('menu-in');
      body.style.paddingRight = '0';

    } else {
      toggler.classList.toggle('menu-in');
    }

  }

  btn_togg.forEach(btn => {
    btn.onclick = () => menuToggler();
  });


}

export default menuMobile