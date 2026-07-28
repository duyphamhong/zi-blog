;(function () {
  var enabled = document.documentElement.dataset.darkMode === 'true'
  if (!enabled) return

  var match = document.cookie.match(/(?:^|;\s*)zi-blog-theme=(light|dark|system)(?:;|$)/)
  var preference = match ? match[1] : 'system'
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  var dark = preference === 'dark' || (preference === 'system' && prefersDark)

  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.dataset.theme = preference
})()
