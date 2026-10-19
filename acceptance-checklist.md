# 人工功能验收清单 — 抓小球小游戏

> 前端网页以**手动浏览器测试**为主。每个任务在编码**之前**先写清单，编码完成后由你按步骤逐项验证。
> 验证环境：Chrome / Edge 打开 `e:\wml\index.html`（直接双击，无需服务器）。

---

## T1 · 项目骨架与 Git 初始化

**代码实现前的验收目标**：文件链路正确、浏览器打开无报错、Git 仓库可正常提交。此任务**无游戏功能**，页面应为空白。

### 操作步骤

1. 打开文件资源管理器，进入 `e:\wml`，确认文件结构为：

```
e:\wml\
├── index.html
├── css\style.css
├── js\game.js
├── .gitignore
├── spec.md
├── plan.md
└── acceptance-checklist.md
```

2. 双击 `index.html`，使用 Chrome 或 Edge 打开。
3. 按 `F12` 打开开发者工具，切到 **Console** 面板。
4. 切到 **Network** 面板，按 `Ctrl + R` 刷新页面。
5. 打开终端，在 `e:\wml` 目录执行 `git log --oneline` 与 `git status`。

### 验收标准

- [ ] A1：`index.html` 能被浏览器正常打开，页面显示为空白页（无内容、无报错弹窗）
- [ ] A2：Network 面板中 `style.css` 与 `game.js` 请求状态均为 `200`（不是 404），且路径为 `css/style.css`、`js/game.js`
- [ ] A3：Console 面板无任何红色 error；不出现 `Failed to load resource`
- [ ] A4：页面标签标题显示为「抓小球小游戏」
- [ ] A5：`.gitignore` 文件存在，且内容包含系统临时文件与编辑器目录的忽略规则
- [ ] A6：`git log --oneline` 至少包含首次提交 `chore: init project skeleton, gitignore and spec`（其后另有 `chore: ignore trae workspace directory`）
- [ ] A7：`git status` 输出 `nothing to commit, working tree clean`（`.trae/` 已被忽略，无未提交文件）

### 若未通过

| 现象 | 排查方向 |
|---|---|
| 打开是浏览器源码/下载文件 | 确认文件名为 `index.html`（不是 `index.html.txt`） |
| Network 中 css/js 为 404 | 检查 `css\`、`js\` 目录名大小写与 HTML 中引用路径是否一致 |
| Console 有报错 | 把报错原文发我，进入阶段 4 修复 |
| git 命令报"不是仓库" | 确认在 `e:\wml` 目录下执行，且 `git init` 已成功 |

---

<!-- 后续任务（T2–T7）的验收清单在进入各自任务时追加到本文件 -->
