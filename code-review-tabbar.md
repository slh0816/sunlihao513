# code-review-tabbar.md — 前端专项代码评审（T5）

- 阶段：Superpowers 阶段 4 · Code-review 前端代码评审
- 范围：`css/slh_tabbar.css`、`iconfont-3.html`、`iconfont-4.html`、`js/slh_tabbar.js`、`font/iconfont.embedded.css`、`font/iconfont.js`（适配改动）
- 日期：2026-10-22（Asia/Shanghai）

## 八维度评审结论

| # | 维度 | 结论 | 说明 |
| --- | --- | --- | --- |
| 1 | 变量命名 | 通过 | CSS 类/id、JS 变量全部 `slh_` 前缀；`iconfont`/`icon-*` 为库 API 豁免；JS 变量语义清晰（slh_tabbar / slh_tabClass / slh_activeClass / slh_event / slh_tab / slh_current） |
| 2 | 可读性 | 通过 | CSS 分 7 节并附中文注释；HTML 语义化分区（header/main/nav/button）；脚本注释说明委托意图；链接顺序依赖在 css 头注释注明 |
| 3 | JS 事件机制 | 通过 | click 委托 + `closest` 识别导航项；空白处点击与重复点击当前项短路返回；SVG 元素同样支持 `closest` |
| 4 | 事件冒泡 | 通过 | 利用冒泡实现委托，内层 svg/use/i/span 的点击均正确归集；无多余 `stopPropagation`/`preventDefault` |
| 5 | 绑定合理性 | 通过 | 每页仅 1 个监听器绑在导航容器；无逐项绑定、无全局绑定 |
| 6 | CSS 冗余 | 发现问题 R1 | 见下 |
| 7 | Flex/Grid 规范 | 通过 | tabbar Flex 四等分、tab 纵向居中、feed 行 baseline 对齐 + `flex:1` 主文本；徽章/红点用 absolute 定位属正当用法；无 float 布局 |
| 8 | 可维护性 | 发现问题 R2 | 见下 |

附加检查：设计令牌全部被使用（无死令牌）；无障碍就位（`button type="button"`、图标 `aria-hidden`、`nav aria-label`、`:focus-visible` 轮廓）；`prefers-reduced-motion` 降级存在。

## 问题与修复

### R1（CSS 冗余）— 已修复
`.slh_tab.slh_active:hover` 与 `.slh_tab.slh_active` 同色：`.slh_tab:hover`（0,2,0）源序在前，`.slh_tab.slh_active`（0,2,0）源序在后即可覆盖悬停色，`:hover` 变体冗余。
**修复**：删除 `.slh_tab.slh_active:hover`，保留单条 `.slh_tab.slh_active` 并补注释说明源序依赖。

### R2（可维护性）— 已修复
两页内联的选中态切换脚本逐字重复（15 行）。
**修复**：提取为共享文件 `js/slh_tabbar.js`，两页改为 `<script src="js/slh_tabbar.js"></script>`（iconfont-4 保持在 iconfont.js 之后）。

## 修复后回归验证（2026-10-22）

- 浏览器实测点击：iconfont-3 与 iconfont-4 依次点击「相机」「盒子」，`slh_active` 数量恒为 1，标签切换正确；
- iconfont-4 点击「相机」后 `getComputedStyle(...).color = rgb(47, 111, 235)`，确认 SVG fill 跟随 currentColor 变钴蓝；
- 桌面 1024 截图复核：两页布局、徽章、红点、居中柱均无回归。

**评审结论：问题清零，可进入阶段 5 人工验证。**
