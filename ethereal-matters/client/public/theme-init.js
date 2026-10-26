// Applies the saved theme before the page paints, so there's no flash of the wrong colours.
(function () {
  var theme = 'dark';
  try {
    theme = localStorage.getItem('em-theme') || 'dark';
  } catch (e) {}
  document.documentElement.dataset.theme = theme === 'light' ? 'light' : 'dark';
})();
