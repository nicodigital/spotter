/* ///////////////////////////////////////////////////////////////////// */
/* //////////////////////////// GET DEVICE ///////////////////////////// */
/* ///////////////////////////////////////////////////////////////////// */

function getDevice () {
  const html = document.querySelector('html')
  const body = document.querySelector('body')
  const header = document.querySelector('header')
  const footer = document.querySelector('footer')
  const winW = document.documentElement.clientWidth
  const winH = document.documentElement.clientHeight
  const docH = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)
  const headerH = header.offsetHeight
  const platform = document.querySelector('html').dataset.platform
  const page = document.querySelector('body').dataset.page

  let isDesktop = false
  let isMobile = false
  let isTablet = false
  let isBigTablet = false
  let device = ''

  if (winW >= 1064) {
    isDesktop = true
    device = 'desktop'
  } else if (winW < 1064 && winW > 992) {
    isBigTablet = true
    device = 'tablet'
  } else if (winW < 992 && winW > 680) {
    isTablet = true
    device = 'tablet'
  } else if (winW < 680) {
    isMobile = true
    device = 'mobile'
  }

  function isIphone () {
    return /iPhone/i.test(navigator.userAgent)
  }

  /* Set Device on HTML tag */
  html.dataset.device = device

  const deviceData = {
    html,
    body,
    winW,
    winH,
    docH,
    header,
    footer,
    isDesktop,
    isMobile,
    isBigTablet,
    isTablet,
    headerH,
    platform,
    page,
    isIphone: isIphone()
  }

  return deviceData
}

export default getDevice
