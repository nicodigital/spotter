function scrollMarkers (device_data) {
  // console.log(device_data)
  const body = device_data.body
  const footer = device_data.footer
  const isDesktop = device_data.isDesktop
  const isMobile = device_data.isMobile
  const isTablet = device_data.isTablet
  const platform = device_data.platform

  body.setAttribute('data-scroll', window.scrollY < 100 ? 'top' : 'down')
  body.dataset.stack = 'off'

  let lastScrollTop = window.scrollY

  // Opciones para el IntersectionObserver
  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
  }

  // Función de callback que se ejecuta cuando el footer entra/sale del viewport
  const callback = function (entries, observer) {
    entries.forEach(entry => {
      const scrollPosition = window.scrollY

      if (entry.isIntersecting) {
        body.setAttribute('data-scroll', 'bottom')
      } else {
        if (scrollPosition < 100) {
          body.setAttribute('data-scroll', 'top')
        } else {
          body.setAttribute('data-scroll', 'down')
        }
      }
    })
  }

  // Crear UNA SOLA instancia del IntersectionObserver
  const observer = new IntersectionObserver(callback, options)
  observer.observe(footer)

  function updateScrollPosition () {
    const scrollPosition = window.scrollY

    // Detectar si estamos en el top
    if (scrollPosition < 100) {
      body.setAttribute('data-scroll', 'top')
    } else if (body.getAttribute('data-scroll') !== 'bottom') {
      // Solo cambiar a 'down' si no estamos en el footer
      body.setAttribute('data-scroll', 'down')
    }
  }

  function smart_menu () {
    const st = window.scrollY

    if (st <= 8) {
      body.dataset.stack = 'off'
      lastScrollTop = 0
      return
    }

    if (st > lastScrollTop) {
      body.dataset.stack = 'off'
    } else if (st < lastScrollTop) {
      body.dataset.stack = 'on'
    }

    lastScrollTop = st
  }

  window.onscroll = (e) => {
    updateScrollPosition()
    smart_menu()
  }

  updateScrollPosition()
}

export default scrollMarkers
