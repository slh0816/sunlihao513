/* 底部导航选中态切换（iconfont-3.html / iconfont-4.html 共用）
   事件委托：只在导航容器上绑定一个监听器，用 closest 识别被点的导航项 */
var slh_tabbar = document.getElementById('slh_tabbar');
var slh_tabClass = 'slh_tab';
var slh_activeClass = 'slh_active';

slh_tabbar.addEventListener('click', function (slh_event) {
  var slh_tab = slh_event.target.closest('.' + slh_tabClass);
  if (!slh_tab || slh_tab.classList.contains(slh_activeClass)) {
    return; /* 点到容器空白处，或点的就是当前选中项 */
  }
  var slh_current = slh_tabbar.querySelector('.' + slh_activeClass);
  if (slh_current) {
    slh_current.classList.remove(slh_activeClass);
  }
  slh_tab.classList.add(slh_activeClass);
});
