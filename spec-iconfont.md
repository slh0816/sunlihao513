# 需求规格文档（Spec）— Font Awesome / Lucide 图标展示页

- 文档版本：v1.0
- 创建日期：2026-10-22
- 课程：《高级网页设计》
- 项目路径：`e:\wml`
- 状态：**待用户确认**（确认后方可进入阶段 2 任务拆解）

---

## 1. 项目概述

新建两个相互独立的静态展示页，用两种不同的技术路线演示图标的使用方式：

| 页面 | 图标库 | 实现方式 |
|---|---|---|
| `iconfont-1.html` | Font Awesome 6 Free | **字体图标**：CSS + webfonts，用 `<i class="fa-solid fa-house">` 呈现 |
| `iconfont-2.html` | Lucide | **SVG 图标**：引入 lucide UMD 脚本，由 `lucide.createIcons()` 把 `<i data-lucide="house">` 渲染为内联 `<svg>` |

所有 CDN 资源（CSS、字体文件、JS）**下载到项目根目录下的 `cdn/` 目录**，页面只引用本地文件，断网也能打开。

### 1.1 项目目标

| 目标 | 说明 |
|---|---|
| 展示目标 | 每页精选常用图标，按分类分区展示，图标 + 名称 + 用法代码一目了然 |
| 技术目标 | 两页分别严格使用「字体图标」与「SVG」两种方式，技术路线不混用 |
| 离线目标 | 全部资源本地化，`file://` 双击打开无任何网络请求 |
| 教学目标 | 体现字体图标与 SVG 图标的技术差异与各自优势 |

### 1.2 明确不做（YAGNI / 范围外）

- 不做图标搜索框、分类筛选、分页
- 不做点击复制图标名/类名功能
- 不做亮暗主题切换、动画特效库
- 不做图标全量列表（只做精选）
- 不做移动端专门适配（网格自适应即可）
- 不引入构建工具、框架、后端

---

## 2. 技术栈与运行环境

| 项 | 规格 |
|---|---|
| 结构 | HTML5 语义化标签 |
| 样式 | CSS3（CSS 变量、Grid 自动填充、Flexbox、悬停过渡） |
| 逻辑 | 原生 JavaScript（仅页面 2 需要：调用 Lucide 渲染） |
| 依赖 | 本地 `cdn/` 下的 Font Awesome 6 Free 与 Lucide |
| 兼容范围 | Chrome / Edge 现代版本 |
| 运行方式 | 双击 HTML 文件用浏览器打开（`file://` 协议下完全可用） |
| 目标设备 | 桌面浏览器 |

### 2.1 CDN 版本策略

固定版本、本地留存（不随 CDN 最新版漂移）：

- Font Awesome：`6.7.2`（Free），下载 `all.min.css` + `webfonts/`（solid / regular / brands 三个字体文件）
- Lucide：固定具体版本号（执行时确认可下载的稳定版本），下载 `lucide.min.js`（UMD）

---

## 3. 目录结构

```
e:\wml\
├── index.html                # 首页（不变）
├── iconfont-1.html           # Font Awesome 字体图标页
├── iconfont-2.html           # Lucide SVG 图标页
├── css\
│   ├── style.css             # 首页游戏样式（不变）
│   └── slh_iconfont.css      # 两个图标页共用样式
└── cdn\
    ├── fontawesome\
    │   ├── css\
    │   │   ├── all.min.css        # 官方原始样式（字体走 ../webfonts 文件）
    │   │   └── all.embedded.css   # 页面实际引用：v6 字体以 base64 内嵌，规避字体被拦截
    │   └── webfonts\
    │       ├── fa-solid-900.woff2
    │       ├── fa-regular-400.woff2
    │       └── fa-brands-400.woff2
    └── lucide\
        └── lucide.min.js
```

> `all.min.css` 内部以 `../webfonts/` 相对路径引用字体，因此 `css/` 与 `webfonts/` 必须保持同级关系，不做路径改写。

---

## 4. 页面结构（两页统一）

```
<header class="slh_page-header">     顶部栏：标题 + 副标题 + 返回首页链接 + 图标总数
<main class="slh_page-main">
  <section class="slh_icon-group">   一个分类分区
    <h2 class="slh_icon-group__title">分类名</h2>
    <ul class="slh_icon-grid">
      <li class="slh_icon-card">
        <span class="slh_icon-card__glyph">图标本身</span>
        <span class="slh_icon-card__name">英文名</span>
        <code class="slh_icon-card__code">用法代码</code>
      </li>
      ...
    </ul>
  </section>
  ...
</main>
<footer class="slh_page-footer">     说明文字
```

- **返回首页链接**：`<a class="slh_back-home" href="index.html">← 返回首页</a>`，位于顶部栏，两页都必须有（遵守项目规则）。
- 页面 1 的 `.slh_icon-card__glyph` 内是 `<i class="fa-solid fa-house"></i>`；页面 2 是 `<i data-lucide="house"></i>`，由 JS 渲染成 `<svg>`。
- 页面 2 的图标总数在 Lucide 渲染完成后由 JS 动态统计写入。

---

## 5. 图标清单（每页约 48 个，精选常用）

### 5.1 页面 1：Font Awesome（48 个）

| 分类 | 数量 | 图标举例（类名后缀） |
|---|---|---|
| Solid 实心 | 24 | house, user, gear, magnifying-glass, heart, star, bell, calendar, clock, trash, pen, download, upload, share, link, lock, envelope, phone, camera, image, play, music, cart-shopping, check |
| Regular 常规 | 12 | heart, star, bell, calendar, clock, user, envelope, circle-check, square, trash-can, bookmark, comment |
| Brands 品牌 | 12 | github, weixin, qq, bilibili, weibo, zhihu, apple, android, windows, html5, css3, js |

### 5.2 页面 2：Lucide（48 个）

| 分类 | 数量 | 图标举例（data-lucide 名） |
|---|---|---|
| 基础 | 12 | house, user, settings, search, heart, star, bell, calendar, clock, trash-2, pencil, download |
| 箭头与方向 | 12 | arrow-up, arrow-down, arrow-left, arrow-right, chevron-up, chevron-down, chevron-left, chevron-right, corner-up-left, move, refresh-cw, rotate-cw |
| 通信与媒体 | 12 | mail, phone, message-circle, send, camera, image, video, music, play, mic, headphones, wifi |
| 文件与数据 | 12 | file, folder, save, copy, clipboard, database, server, cloud, hard-drive, link, lock, shield |

> 若某个图标名在该版本中不存在，执行阶段改用同义图标并在评审记录中注明，最终以实际可用为准。

---

## 6. 交互与视觉

- 视觉基调：沿用首页浅黄背景（`#fffbe6`）、白色卡片、蓝色主色（`#2f80ed`），两页风格统一。
- 卡片：白色背景、圆角、浅阴影；悬停时图标放大 1.1 倍并变为主色深色，带 0.15s 过渡。
- 网格：`grid-template-columns: repeat(auto-fill, minmax(140px, 1fr))`，随窗口宽度自适应。
- 两页均无点击逻辑，仅有的 JS 是页面 2 的 Lucide 渲染与计数。
- 字体：与首页一致（Microsoft YaHei / PingFang SC 等）。

---

## 7. 命名与代码规范

- 新增 CSS 类名、HTML id、JS 变量一律以 `slh_` 开头（项目强制规则）。
- Font Awesome 自带的 `fa-*` 类名、Lucide 的 `data-lucide` 名称属于库 API，保持原样不加前缀。
- 新增 CSS 自定义属性统一 `--slh-` 前缀，避免与首页 `--color-*` / `--ball-size` 冲突。
- 两个图标页共用 `css/slh_iconfont.css`；页面 2 的少量 JS 内联在页面底部，避免为 3 行逻辑新建 JS 文件。
- 注释使用中文，说明「为什么」而非复述代码。

---

## 8. 验收标准

| 编号 | 验收项 |
|---|---|
| G1 | `iconfont-1.html` 与 `iconfont-2.html` 均存在于项目根目录，双击可正常打开 |
| G2 | 页面 1 的图标全部通过 `fa-*` 字体类渲染，图标为字体字符而非 SVG/图片 |
| G3 | 页面 2 的图标页面加载后全部渲染为内联 `<svg>`，且 `stroke` 为矢量线条样式 |
| G4 | `cdn/fontawesome/` 下 css 与 webfonts 齐全，页面 1 在断网状态下图标正常显示 |
| G5 | `cdn/lucide/lucide.min.js` 本地可加载，页面 2 断网状态下图标正常渲染 |
| G6 | 两页顶部栏都有指向 `index.html` 的「返回首页」链接，点击可回到首页 |
| G7 | 浏览器 DevTools → Network 中，两页均无任何外域（http/https）请求 |
| G8 | 卡片悬停有放大 + 变色过渡，网格随窗口缩放自适应换行 |
| G9 | 新增 CSS 类名 / id / JS 变量全部以 `slh_` 开头，无遗漏 |
| G10 | 页面 1 展示 48 个图标、页面 2 展示 48 个图标，分类标题与数量一致 |

---

## 9. 交付物

- `iconfont-1.html`、`iconfont-2.html`
- `css/slh_iconfont.css`
- `cdn/fontawesome/`（css + webfonts）、`cdn/lucide/lucide.min.js`
- 阶段 3 的 `acceptance-checklist-iconfont.md`、阶段 4 的 `code-review-iconfont.md`
- 阶段 5 人工验证通过后的 Git 提交
