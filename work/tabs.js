/**
 * ============================================================
 * 可复用选项卡组件 tabs.js
 * ------------------------------------------------------------
 * 用法：
 *   1. HTML 中按约定结构书写：
 *        <div class="slh-tabs">
 *          <div class="slh-tabs__nav">
 *            <button class="slh-tab slh-active" data-slh-target="面板id">标题</button>
 *            ...
 *          </div>
 *          <div class="slh-tab-panel slh-active" id="面板id">内容</div>
 *          ...
 *        </div>
 *      （默认选中的选项卡与面板各加 slh-active）
 *   2. 页面引入本文件后会自动初始化所有 .slh-tabs；
 *      也可手动调用 window.slhInitTabs(".自定义容器") 复用。
 * ============================================================
 */
(function () {
  "use strict";

  /**
   * 初始化一组选项卡（组内互不影响，可复用于任意多组）
   * @param {HTMLElement} slh_root 选项卡容器（.slh-tabs）
   */
  function slhInitOne(slh_root) {
    var slh_nav = slh_root.querySelector(".slh-tabs__nav");
    if (!slh_nav) return;

    /* 事件监听：把 click 委托到导航容器上 */
    slh_nav.addEventListener("click", function (slh_ev) {
      var slh_tab = slh_ev.target.closest(".slh-tab");
      if (!slh_tab || !slh_root.contains(slh_tab)) return;

      /* 1. 清除本组内所有选项卡、所有面板的选中状态 */
      var slh_tabs = slh_root.querySelectorAll(".slh-tab");
      var slh_panels = slh_root.querySelectorAll(".slh-tab-panel");
      slh_tabs.forEach(function (slh_t) { slh_t.classList.remove("slh-active"); });
      slh_panels.forEach(function (slh_p) { slh_p.classList.remove("slh-active"); });

      /* 2. 再设置当前点击元素的选中状态 */
      slh_tab.classList.add("slh-active");
      var slh_panel = slh_root.querySelector("#" + slh_tab.getAttribute("data-slh-target"));
      if (slh_panel) slh_panel.classList.add("slh-active");
    });
  }

  /**
   * 批量初始化：默认初始化页面所有 .slh-tabs，可传入选择器复用
   * @param {string} [slh_selector] 选项卡容器选择器，默认 ".slh-tabs"
   */
  function slhInitTabs(slh_selector) {
    var slh_list = document.querySelectorAll(slh_selector || ".slh-tabs");
    slh_list.forEach(function (slh_root) { slhInitOne(slh_root); });
  }

  /* 暴露到全局，便于其他页面/场景复用 */
  window.slhInitTabs = slhInitTabs;

  /* 自动初始化（脚本在 head 引入时也能正常工作） */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { slhInitTabs(); });
  } else {
    slhInitTabs();
  }
})();
