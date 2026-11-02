/**
 * zbw.js - 汽车导购选项卡交互
 * 所有变量/函数均以 zbw_ / ZBW_ 前缀
 */
(function () {
  "use strict";

  /**
   * 初始化一组选项卡
   * @param {HTMLElement} zbw_root 选项卡容器元素
   */
  function zbwInitOne(zbw_root) {
    var zbw_nav = zbw_root.querySelector(".zbw-tabs__nav");
    if (!zbw_nav) return;

    zbw_nav.addEventListener("click", function (zbw_ev) {
      var zbw_tab = zbw_ev.target.closest(".zbw-tab");
      if (!zbw_tab || !zbw_root.contains(zbw_tab)) return;

      // 1. 清除本组所有 tab 的 active
      var zbw_tabs = zbw_root.querySelectorAll(".zbw-tab");
      for (var i = 0; i < zbw_tabs.length; i++) {
        zbw_tabs[i].classList.remove("zbw-tab--active");
      }

      // 2. 清除本组所有 panel 的 active
      var zbw_panels = zbw_root.querySelectorAll(".zbw-panel");
      for (var j = 0; j < zbw_panels.length; j++) {
        zbw_panels[j].classList.remove("zbw-panel--active");
      }

      // 3. 激活当前 tab
      zbw_tab.classList.add("zbw-tab--active");

      // 4. 找到目标面板并激活
      var zbw_targetId = zbw_tab.getAttribute("data-zbw-target");
      if (zbw_targetId) {
        var zbw_panel = zbw_root.querySelector("#" + zbw_targetId);
        if (zbw_panel) zbw_panel.classList.add("zbw-panel--active");
      }
    });
  }

  /**
   * 批量初始化页面所有 .zbw-tabs
   * @param {string} [zbw_selector] 自定义选择器，默认 ".zbw-tabs"
   */
  function zbwInitTabs(zbw_selector) {
    var zbw_list = document.querySelectorAll(zbw_selector || ".zbw-tabs");
    for (var k = 0; k < zbw_list.length; k++) {
      zbwInitOne(zbw_list[k]);
    }
  }

  // 暴露到全局
  window.zbwInitTabs = zbwInitTabs;

  // 自动初始化
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { zbwInitTabs(); });
  } else {
    zbwInitTabs();
  }
})();
