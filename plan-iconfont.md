# 任务拆解（Plan）— Font Awesome / Lucide 图标展示页

- 依据文档：`spec-iconfont.md`（v1.0，用户已确认）
- 创建日期：2026-10-22
- 状态：**待用户确认**（确认后方可进入阶段 3）

任务按顺序执行，一次只做一个任务，每个任务完成后进入评审与人工验证，通过后再做下一个。

---

## T1 CDN 资源本地化

**内容**

1. 用 `npm pack` 拉取固定版本包到临时目录并解包（本机 curl/PowerShell 直连 CDN 的 TLS 被拦截，npm registry 可用）：
   - `@fortawesome/fontawesome-free@6.7.2`
   - `lucide@1.61.0`
2. 只拷贝页面需要的文件到项目：
   - `cdn/fontawesome/css/all.min.css`
   - `cdn/fontawesome/webfonts/`（css 内 `@font-face` 引用的全部字体文件）
   - `cdn/lucide/lucide.min.js`
3. 清理临时解包目录，不把 `node_modules`、tgz 留在项目里。

**验收标准**

- [ ] 上述文件全部存在，`webfonts/` 中每个被 `all.min.css` 引用的文件都存在
- [ ] `all.min.css` 中字体路径为 `../webfonts/xxx`，与目录结构匹配，无需改写
- [ ] `lucide.min.js` 为 UMD 版本，且暴露 `createIcons`（解包后确认 API，若 v1 改名则在 T4 前记录调整）
- [ ] 项目内无 `node_modules`、无 `.tgz` 残留

---

## T2 公共样式 `css/slh_iconfont.css`

**内容**

- 新增 CSS 变量（`--slh-*`）：浅黄背景、白色卡片、蓝色主色与悬停色、文字色、圆角、阴影、间距。
- 两个图标页共用：页面基础、顶栏（标题/副标题/返回首页/图标计数）、分组标题、卡片网格、卡片、代码标签、页脚。
- 网格使用 `repeat(auto-fill, minmax(140px, 1fr))`；卡片悬停时图标放大 1.1 倍并变色（0.15s 过渡）。

**验收标准**

- [ ] 所有新增类名以 `slh_` 开头，CSS 变量以 `--slh-` 开头
- [ ] 颜色与首页基调一致（背景 `#fffbe6`、主色 `#2f80ed`）
- [ ] 不存在与首页 `css/style.css` 的类名冲突
- [ ] 无冗余选择器、无 `!important`

---

## T3 `iconfont-1.html`（Font Awesome 字体图标）

**内容**

- 按 spec §4 的页面结构编写 HTML，顶部栏包含「返回首页」链接到 `index.html`。
- 展示 48 个图标，分三区：Solid 24 / Regular 12 / Brands 12（清单见 spec §5.1）。
- 每个图标用 `<i class="fa-solid fa-house">`（或 `fa-regular` / `fa-brands`）渲染，配英文名与用法代码。
- 先在 `acceptance-checklist-iconfont.md` 写本任务的人工验收清单，再写 HTML。

**验收标准**

- [ ] 48 个图标全部以字体方式显示，无空白方块、无缺字
- [ ] 顶部「返回首页」可回到 `index.html`
- [ ] Network 面板无外域请求
- [ ] 类名/ID 全部 `slh_` 前缀（`fa-*` 库类名除外）
- [ ] 人工验收清单逐条通过

---

## T4 `iconfont-2.html`（Lucide SVG）

**内容**

- 同一套页面结构，展示 48 个图标（清单见 spec §5.2）。
- HTML 中写 `<i data-lucide="house">`，页面底部引入 `cdn/lucide/lucide.min.js` 并调用 `createIcons()` 渲染为内联 `<svg>`。
- JS 使用 `slh_` 前缀变量，渲染完成后统计 SVG 数量写入顶部计数。
- 先在验收清单中补充本任务条目，再写页面。

**验收标准**

- [ ] 48 个图标全部渲染为内联 `<svg>`（DevTools 中可见 `<svg ... class="lucide ...">`）
- [ ] 顶部计数显示实际渲染数量，与 48 一致
- [ ] 顶部「返回首页」可回到 `index.html`
- [ ] Network 面板无外域请求
- [ ] 不存在的图标名已替换为可用图标，并在评审记录中注明

---

## T5 全量评审 + 人工验证 + Git

**内容**

1. 前端专项评审：命名、CSS 冗余、Grid/Flex 规范、JS 事件与变量、可维护性 → 输出 `code-review-iconfont.md`，问题当场修复。
2. 对照 `spec-iconfont.md` §8 的 G1–G10 逐条人工验证（用户在浏览器打开两页）。
3. 分阶段 Git 提交（CDN 资源 / 样式 / 页面 1 / 页面 2 / 文档）。

**验收标准**

- [ ] 评审报告无未处理问题
- [ ] G1–G10 全部通过
- [ ] Git 提交完成，工作区 clean
