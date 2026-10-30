// Run before the application and its styles to avoid flashing the opposite theme.
;(function () {
  var preference = 'system'
  try {
    var stored = localStorage.getItem('galdcup-theme')
    if (['light', 'dark', 'system'].includes(stored)) preference = stored
  } catch (_) { /* A blocked storage must not prevent rendering. */ }
  var dark = preference === 'dark' || (preference === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
})()
