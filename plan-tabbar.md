# plan-tabbar.md — 任务拆解（移动端底部导航 iconfont-3 / iconfont-4）

- 阶段：Superpowers 阶段 2 · writing-plans 任务拆解
- 依据：`spec-tabbar.md`（用户已确认）
- 日期：2026-10-22（Asia/Shanghai）
- 状态：**待用户确认任务清单**（确认后进入阶段 3，逐任务编码）

## 依赖顺序

T1 → T2 → T3 → T4 → T5（一次只推进一个任务，每个任务完成后按阶段 3/4/5 流程验收）。

---

## T1 图标资源本地适配

**内容**
1. 生成 `font/iconfont.embedded.css`：`@font-face` 的 `src` 用 `iconfont.woff2` 的 base64 Data URI 内嵌，其余规则（`.iconfont` 基类 + 4 个 `.icon-*` 类）与官方 `iconfont.css` 保持一致。
2. 编辑 `font/iconfont.js`：移除 4 个 symbol 内 path 上的 `fill="..."` 属性，使 SVG 图标跟随 `currentColor`，支持选中态换色。
3. 不改动 `font/iconfont.css`、`iconfont.ttf`、`iconfont.woff`、`iconfont.woff2`。

**验收标准**
- `font/iconfont.embedded.css` 中 `src` 为 `url(data:font/woff2;charset=utf-8;base64,...)`，且包含 `.icon-shengyinjingyin`、`.icon-qunzutouxiang`、`.icon-camera`、`.icon-boxben` 四条规则；
- `font/iconfont.js` 中不再出现 `fill="#`；
- 其余 font 文件内容不变。

## T2 共享样式 `css/slh_tabbar.css`

**内容**
1. 设计令牌：延续标本室配色（纸色/墨色/钴蓝），衬线标题、无衬线正文；
2. 页面骨架：`width:100%` + `max-width:480px` 居中；
3. 内容区：顶部栏（标题+回链）、说明、长列表、底部预留导航高度的安全间距；
4. 固定底部导航：`position:fixed; bottom:0; left:50%; transform:translateX(-50%); width:100%; max-width:480px;`，Flex 四等分；
5. 导航项：图标在上文字在下；未选中次要墨色、选中钴蓝；
6. 数字徽章（红底白字胶囊，图标右上角偏移）与红点（红色实心小圆）；
7. `prefers-reduced-motion` 降级。

**验收标准**
- 所有选择器以 `slh_` 开头；
- 覆盖 G2/G3/G4/G5/G6/G12 所需样式；
- Flex 布局规范、无冗余声明。

## T3 `iconfont-3.html`（字体图标方案）

**内容**
1. HTML 结构：顶部栏（页面标题 + 返回首页链接）、内容区（标题 + 说明 + 超一屏占位列表）、固定底部导航（消息[99+ 徽章] / 相机 / 静音 / 盒子[红点]）；
2. 引用 `font/iconfont.embedded.css` 与 `css/slh_tabbar.css`；图标用 `<i class="iconfont icon-*">`；
3. 内联 JS：事件委托绑定在导航容器，点击切换选中项（默认选中「消息」），变量均 `slh_` 前缀。

**验收标准**
- 满足 G1、G2、G3、G4、G5、G6、G7、G9、G10、G11；
- 浏览器打开图标正常显示（字体渲染）。

## T4 `iconfont-4.html`（SVG 方案）

**内容**
1. 页面结构与交互脚本同 T3；
2. 改为引用 `font/iconfont.js`，图标用 `<svg class="slh_svgfont" aria-hidden="true"><use xlink:href="#icon-*"></use></svg>`；
3. 验证移除 fill 后选中/未选中变色生效。

**验收标准**
- 满足 G1、G2、G3、G4、G5、G6、G8、G9、G10、G11；
- SVG 图标显示完整且随选中态变色。

## T5 全量评审 + 人工验证 + Git 收尾

**内容**
1. 前端专项代码评审（命名、可读性、事件机制/冒泡、绑定合理性、CSS 冗余、Flex/Grid 规范、可维护性），输出 `code-review-tabbar.md`；
2. headless Chrome 截图自检（375×667 与 1024×768 两档）；
3. 对照 G1–G12 输出人工验收清单，交用户浏览器实测；
4. 通过后分阶段 Git 提交（资源适配 / 样式 / 页面 / 文档）。

**验收标准**
- 评审问题清零；
- 用户确认 G1–G12 全部通过；
- 工作区干净、提交历史清晰。

---

**请确认任务清单。确认后进入阶段 3：先写 T1 的人工验收清单，再开始 T1 编码。**
