# spec-tabbar.md — 移动端底部导航页（iconfont-3 / iconfont-4）需求规格

- 阶段：Superpowers 阶段 1 · Brainstorming 需求研讨
- 日期：2026-10-22（Asia/Shanghai）
- 状态：**待用户确认**（确认后才进入阶段 2 任务拆解）

## 1. 背景与目标

基于 `font/` 目录中 iconfont.cn 导出的本地图标资源（项目 id 5238921，4 个图标），制作两个移动端网页：

| 页面 | 图标技术方案 |
| --- | --- |
| `iconfont-3.html` | 字体图标（font-class 方式，引用 iconfont.css + woff2） |
| `iconfont-4.html` | SVG 方式（symbol + `<use>`，引用 iconfont.js） |

两个页面内容、布局、交互完全一致，仅图标实现技术不同，用于对比演示。

## 2. 图标资源（已核对）

`font/` 目录 6 个文件：`iconfont.css`、`iconfont.js`、`iconfont.json`、`iconfont.ttf`、`iconfont.woff`、`iconfont.woff2`。

| 图标 | font-class / symbol id | Unicode | 用作导航项 |
| --- | --- | --- | --- |
| 群头像 | `icon-qunzutouxiang` | \e600 | 消息 |
| camera | `icon-camera` | \e607 | 相机 |
| 声音静音 | `icon-shengyinjingyin` | \eca9 | 静音 |
| boxben | `icon-boxben` | \e609 | 盒子 |

## 3. 功能需求（已与用户确认）

1. **底部导航固定**：导航条 `position: fixed` 固定在视口底部，页面内容滚动时导航不动。
2. **自适应宽度**：页面与导航均为 `width: 100%`，限宽 `max-width: 480px`；视口宽于 480px 时整体水平居中（手机壳效果）。
3. **4 个导航项**（从左到右）：**消息**（群头像）、**相机**（camera）、**静音**（声音静音）、**盒子**（boxben）；图标在上、文字在下。
4. **数字徽章**：「消息」图标右上角显示数字徽章 **99+**。
5. **红点**：「盒子」图标右上角显示小红点（无数字）。
6. **选中态切换**：默认选中「消息」；点击任一导航项切换高亮（图标与文字变钴蓝色），纯前端 JS 演示，不跳转页面。
7. **内容区**：页面标题 + 一段说明 + 可滚动长列表（若干占位列表项，超出一屏），用于验证固定导航与内容滚动的关系；内容底部留出导航高度的安全间距，不被遮挡。
8. **回链首页**：两页均含指向 `index.html` 的「返回首页」链接（项目强制规则）。

## 4. 视觉风格

延续 `css/slh_iconfont.css` 的「字体标本室」设计语言，保持项目一致：

- 纸色背景 `#fbf6e8`，墨色正文 `#23262d`，次要文字 `#6f6a5d`；
- 主色钴蓝 `#2f6feb`（选中态、徽章描边强调），深钴蓝 `#1e56c8`；
- 未选中导航项用次要墨色，选中项用钴蓝；
- 数字徽章：红底白字圆角胶囊；红点：红色实心小圆；
- 衬线体做标题（Georgia/宋体），无衬线做正文；
- 克制的过渡动效，尊重 `prefers-reduced-motion`。

## 5. 技术方案与关键决策

1. **iconfont-3.html（字体方案）**：不直接引用原始 `font/iconfont.css`（其 `@font-face` 走相对路径文件加载，在 IDE 预览面板中可能被拦截导致图标空白），按既有项目模式生成 **`font/iconfont.embedded.css`**：把 `iconfont.woff2` 以 base64 Data URI 内嵌，其余规则与官方 css 一致。原始 `iconfont.css` 保持不动。
2. **iconfont-4.html（SVG 方案）**：引用 `font/iconfont.js`（注入 symbol），图标写法 `<svg class="slh_svgfont" aria-hidden="true"><use xlink:href="#icon-xxx"></use></svg>`。
   - **已知问题**：iconfont.js 内各 symbol 的 path 带硬编码 `fill`（#000000/#13161F/#333333），会阻断 `currentColor` 继承，导致无法用 CSS 换色做选中态。
   - **处理**：直接编辑本地 `font/iconfont.js`，移除 path 上的 `fill` 属性，使图标跟随 `currentColor`。此为本地资源适配，不影响字体方案页面。
3. **共享样式**：新建 `css/slh_tabbar.css`，两页共用；不复用/不修改 `css/slh_iconfont.css`。
4. **交互脚本**：内联 `<script>` 即可（逻辑很小），所有 JS 变量以 `slh_` 开头；事件委托绑定在导航容器上，避免逐项绑定。
5. **居中限宽**：固定导航条用 `left: 50%; transform: translateX(-50%); width: 100%; max-width: 480px;` 保证宽屏下与内容对齐。

## 6. 命名规范（项目强制）

- 所有新增 CSS 类名、HTML id、JS 变量一律 `slh_` 前缀；
- 图标库自身的类名（`iconfont`、`icon-*`）属库 API，豁免。

## 7. 兼容范围

- 现代浏览器：Chrome / Edge / Firefox / Safari 近两年版本；
- 移动端视口（`<meta name="viewport">`），320px 宽度起可用；
- 支持 `file://` 直接打开与本地静态服务器两种方式。

## 8. 交付物清单

| 文件 | 说明 |
| --- | --- |
| `iconfont-3.html` | 字体图标版移动端底部导航页 |
| `iconfont-4.html` | SVG 版移动端底部导航页 |
| `css/slh_tabbar.css` | 两页共享样式 |
| `font/iconfont.embedded.css` | base64 内嵌字体的 css（生成，不改原文件） |
| `font/iconfont.js` | 移除 path fill 属性（本地适配） |

## 9. 验收标准（阶段 3 将细化为人工验收清单）

- **G1** 两页底部均显示 4 个导航项，顺序为 消息 / 相机 / 静音 / 盒子，图标在上文字在下。
- **G2** 底部导航固定不随内容滚动；滚动内容时导航始终可见。
- **G3** 窄屏（手机）导航与内容铺满宽度；宽屏（桌面）整体限宽 480px 水平居中，导航与内容左右边缘对齐。
- **G4** 「消息」图标右上角有红底白字数字徽章，内容为 99+。
- **G5** 「盒子」图标右上角有红色小圆点，无数字。
- **G6** 默认「消息」高亮；点击其他项后该项变为钴蓝高亮、原项恢复未选中色。
- **G7** iconfont-3.html 的图标由字体渲染（检查元素为 `<i class="iconfont icon-*">`）。
- **G8** iconfont-4.html 的图标由 SVG 渲染（检查元素为 `<svg><use>`），且选中/未选中可变色。
- **G9** 内容区含标题、说明与超一屏的列表；列表底部内容滚动到底时不被导航遮挡。
- **G10** 两页均有可点击的「返回首页」链接，跳转到 `index.html`。
- **G11** 新增 CSS 类名 / id / JS 变量全部以 `slh_` 开头。
- **G12** 徽章与红点定位在图标右上角，不遮挡图标主体；320px 窄屏下 4 个导航项不拥挤不换行。

## 10. 已确认事项记录

- 导航命名：消息 / 相机 / 静音 / 盒子（用户确认）。
- 徽章分配：消息=99+ 数字徽章，盒子=红点（用户确认）。
- 内容区：标题 + 可滚动长列表（用户确认）。
- 限宽：480px（用户确认）。

---

**请确认本 spec。确认后进入阶段 2（writing-plans 任务拆解）。**
