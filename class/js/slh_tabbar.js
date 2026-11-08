/* 底部导航：事件委托，只绑定一个监听器 */
(function () {
  var tabbar = document.getElementById('slh_tabbar');
  if (!tabbar) {
    return;
  }

  tabbar.addEventListener('click', function (event) {
    var tab = event.target.closest('.slh_tab');
    if (!tab || !tabbar.contains(tab)) {
      return;
    }

    var tabs = tabbar.querySelectorAll('.slh_tab');
    for (var i = 0; i < tabs.length; i++) {
      var isActive = tabs[i] === tab;
      tabs[i].classList.toggle('slh_active', isActive);
      tabs[i].setAttribute('aria-current', isActive ? 'true' : 'false');
    }
  });
})();
