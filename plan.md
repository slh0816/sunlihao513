# 抓小球小游戏 实施计划（Task Breakdown）

> 基于 [spec.md](file:///e:/wml/spec.md) v1.0（已确认）。执行时遵循课程版规范：每任务先写人工验收清单（阶段 3），再实现，再评审，再人工验证。

**Goal:** 用原生 HTML + CSS3 + JavaScript 实现一款 120 秒计时得分、点击蓝球得分、点空扣分的全屏抓小球网页小游戏。

**Architecture:** 单一页面 + 4 状态机（`idle` / `countdown` / `playing` / `over`）。`game.js` 按「常量 → DOM 引用 → 状态 → 纯函数工具（随机坐标、渲染、格式化）→ 事件处理 → 流程控制（start/end/reset）」分区组织；计时采用时间戳差值法；小球用绝对定位 + 随机坐标渲染，样式与行为完全分离。

**Tech Stack:** HTML5 语义标签、CSS3（变量 / Flexbox / 绝对定位 / transition / keyframes）、原生 ES6+ JavaScript，零依赖，`file://` 直接可运行。

**约束（贯穿全部任务）：**
- 严格遵守 spec §1.2「明确不做」，不添加任何范围外功能
- HTML 不写内联 style / 内联 onclick
- 全部魔法数字与颜色使用具名常量 / CSS 变量
- 每完成一个任务提交一次 Git，提交信息遵循 Conventional Commits（`feat:` / `style:` / `chore:`）

---

## 任务依赖关系

```
T1 骨架与 Git
  └─> T2 结构与视觉基调
        └─> T3 状态机与倒计时
              └─> T4 小球渲染与随机定位
                    └─> T5 点击判定与计分
                          └─> T6 结算与重新开始
                                └─> T7 总体验收与评审收尾
```

一次只推进一个任务，完成「阶段 3 清单 → 实现 → 阶段 4 评审 → 阶段 5 人工验证」后才进入下一个。

---

### T1：项目骨架与 Git 初始化

**Files:**
- Create: `e:\wml\index.html`（最小可运行壳）
- Create: `e:\wml\css\style.css`（空文件 + 引入）
- Create: `e:\wml\js\game.js`（空文件 + 引入）
- Create: `e:\wml\.gitignore`（忽略编辑器/系统临时文件）
- 仓库：`e:\wml` 执行 `git init`，分支 `main`

**验收标准（浏览器验证）**
- [ ] 双击 `index.html` 能正常打开，页面空白但无错误
- [ ] 浏览器 Console 无 404（`css/style.css`、`js/game.js` 均成功加载）
- [ ] 控制台无任何 error
- [ ] `git status` 可正常执行，`git log` 显示首次提交 `chore: init project skeleton and spec`

**实现要点**
- HTML 引用路径使用相对路径 `css/style.css`、`js/game.js`
- `.gitignore` 忽略 `.DS_Store`、`Thumbs.db`、`*.log`、`.idea/`、`.vscode/`
- 首次提交包含 `spec.md` 与骨架文件

**提交：** `chore: init project skeleton, gitignore and spec`

---

### T2：页面结构与视觉基调（浅黄背景 + 顶部 HUD）

**Files:**
- Modify: `index.html`（结构化 DOM）
- Modify: `css/style.css`（变量、背景、HUD、按钮、结算面板骨架）
- Modify: `js/game.js`（仅获取 DOM 引用，不做逻辑）

**DOM 结构目标**
```
body
└── .game（游戏区）
    ├── header.hud            # 固定顶部：分数 / 剩余时间 / 开始按钮
    ├── .ball（隐藏，球元素）  # position: absolute
    ├── .countdown-overlay     # 3-2-1 预备倒计时遮罩（默认隐藏）
    └── .result-panel          # 结算面板（默认隐藏）
```

**验收标准（浏览器验证）**
- [ ] 页面为浅黄色（`#fffbe6`）全屏背景，无白边
- [ ] 顶部固定栏可见，含「分数 0」「剩余时间 02:00」「开始游戏」按钮三项
- [ ] 顶部栏用 Flexbox 横向排布，间距均匀、垂直居中
- [ ] 无水平/垂直滚动条（`overflow: hidden`）
- [ ] 游戏区不可选中文本（拖拽全选时无蓝色选区）
- [ ] 缩放浏览器窗口，布局不破版，顶部栏始终贴顶
- [ ] 小球、倒计时遮罩、结算面板均不可见（初始隐藏）

**实现要点**
- CSS 变量落地 spec §7.2 全部 8 个变量
- HUD：`position: fixed; top:0; width:100%; height:var(--hud-height); z-index: 10; display:flex; align-items:center; justify-content:space-between`
- `html, body { margin:0; overflow:hidden }`，游戏区 `100vw × 100vh`
- 隐藏策略：使用 `.is-hidden { display:none }` 类，由 JS 控制显隐
- 按钮定义 hover / `:disabled` 两种状态样式

**提交：** `style: build page layout with yellow background and top HUD`

---

### T3：状态机与倒计时（3-2-1 预备 + 120 秒 + 时间显示）

**Files:**
- Modify: `js/game.js`（常量、状态机、计时、格式化、流程控制）
- Modify: `css/style.css`（倒计时遮罩与数字动画样式）

**实现要点**
- 具名常量：`GAME_DURATION_MS = 120000`、`PRE_COUNTDOWN_SECONDS = 3`、`TICK_INTERVAL_MS = 100`
- 状态：`let gameState = GAME_STATES.IDLE`，`GAME_STATES` 为冻结对象
- 计时：进入 `playing` 时记 `endTime = Date.now() + GAME_DURATION_MS`；`setInterval(100ms)` 内用 `Math.ceil((endTime - Date.now())/1000)` 计算剩余秒数
- 格式化函数 `formatTime(totalSeconds)` → `mm:ss`（补零）
- 预备倒计时：依次显示 `3`→`2`→`1`，每个停留 1 秒，随后 `startPlaying()`
- 归零：`remainingMs <= 0` 时调用 `endGame()`（本任务先切换状态 + 停表，面板在 T6 补）
- 计时器句柄统一保存到 `timers`，`clearAllTimers()` 统一清理

**验收标准（浏览器验证）**
- [ ] 点击「开始游戏」后，页面中央依次出现 `3`、`2`、`1`，每个约停留 1 秒
- [ ] 预备倒计时结束后自动进入游戏，顶部时间从 `02:00` 开始递减
- [ ] 时间格式正确：始终两位分钟 + 两位秒（`01:59`、`00:08`、`00:00`）
- [ ] 数字切换流畅、不跳秒、不闪烁
- [ ] 走满 120 秒后时间停在 `00:00`，不再继续变化
- [ ] 预备倒计时与游戏中，开始按钮为 disabled 状态，点击无反应
- [ ] Console 无报错

**提交：** `feat: add game state machine and 120s countdown with 3-2-1 pre-countdown`

---

### T4：小球渲染与安全区随机定位

**Files:**
- Modify: `js/game.js`（球尺寸常量、`getSafePosition()`、`spawnBall()`、显隐控制、resize 处理）
- Modify: `css/style.css`（球样式、出现动画、hover 放大）

**实现要点**
- 常量：`BALL_SIZE = 64`、`SAFE_GAP = 24`、`HUD_HEIGHT = 64`（与 CSS 变量保持一致，JS 侧集中定义）
- `getBallSize()` 从 CSS 变量 `--ball-size` 读取真实像素值，避免 JS/CSS 两处硬编码不一致
- `getSafePosition()`：按 spec FR-7 计算 `x/y`，`Math.random()` 均匀分布；可用宽/高若为负则取 0
- `spawnBall()`：设置 `left/top`，移除隐藏类，强制重播出现动画（移除动画类 → `void ball.offsetWidth` → 重加动画类）
- 动画只用 `transform`（`scale` + `opacity`），不触发重排
- `window.resize` 时重新约束当前球位置回到安全区（复用 `getSafePosition()` 的重约束分支）

**验收标准（浏览器验证）**
- [ ] 进入游戏后场上出现**且仅出现 1 个**蓝色实心圆形球
- [ ] 球直径约 64px，颜色为 `#2f80ed`，无阴影无渐变
- [ ] 球完整显示在游戏区内，四边不贴边、不与顶部栏重叠
- [ ] 多次刷新页面重复开局，球出现位置明显随机（不固定在一点）
- [ ] 球出现时有轻微缩放 + 淡入动画，无突兀闪现
- [ ] 鼠标悬停到球上：光标变 pointer 且球轻微放大
- [ ] 将浏览器窗口缩小到很小，球仍完整可见在安全区内
- [ ] 球静止不动（不漂移、不抖动）
- [ ] Console 无报错

**提交：** `feat: render blue ball with safe-area random positioning and pop-in animation`

---

### T5：点击判定与计分

**Files:**
- Modify: `js/game.js`（计分常量、`handleBallClick()`、`handleAreaClick()`、`updateScore()`、事件绑定）
- Modify: `css/style.css`（分数数值变化样式，如需）

**实现要点**
- 常量：`SCORE_ON_HIT = 2`、`SCORE_ON_MISS = -1`、`INITIAL_SCORE = 0`
- 事件绑定采用**委托 + 职责分离**策略：
  - 游戏区（`.game`）上绑定一次 `click` → `handleAreaClick(e)`：若 `e.target` 是球则加分并刷新，否则（且处于 `playing`）扣分
  - HUD / 结算面板是游戏区之外的独立容器，绑在其上的点击**不会**冒泡进游戏区，从而天然满足「点顶部不扣分」
  - 球元素**不再单独绑定** click（避免与委托重复触发导致"一球两分"），统一由委托处理，通过 `e.target.closest('.ball')` 判定
- `handleBallClick()`：`score += 2` → 刷新球位置 → `updateScore()`
- `handleAreaClick()` 中扣分分支：`score += -1` → `updateScore()`，**不移动小球**
- 仅当 `gameState === PLAYING` 时才计分；其他状态直接 return
- `updateScore()`：写入 `scoreEl.textContent`，负数按原值显示

**验收标准（浏览器验证）**
- [ ] 游戏中点中蓝球：分数立刻 `+2`，球在同一瞬间跳到新随机位置
- [ ] 快速连点同一个球的位置，不会出现重复加分（每球只计一次）
- [ ] 点击球以外的空白处：分数 `-1`，且球**位置不变化**
- [ ] 点击顶部「分数 / 剩余时间 / 开始按钮」区域：分数**不变**
- [ ] 连续点空多次，分数正确变为负数（`-1`、`-2`、`-3`……）且显示正确
- [ ] 预备倒计时阶段点击画面：分数不变
- [ ] 游戏结束后点击画面：分数不变
- [ ] Console 无报错

**提交：** `feat: implement click scoring (+2 on ball, -1 on blank)`

---

### T6：结算面板与重新开始

**Files:**
- Modify: `js/game.js`（`endGame()` 完整实现、`resetGame()`、`startGame()` 幂等化）
- Modify: `css/style.css`（结算面板完整样式）

**实现要点**
- `endGame()`：停表、`clearAllTimers()`、隐藏球与倒计时遮罩、`gameState = OVER`、显示面板并写入 `最终得分：{score}`
- `resetGame()`：`score = INITIAL_SCORE`、`updateScore()`、隐藏面板、清理残留计时器
- `startGame()`：每次进入前先 `clearAllTimers()`，确保「多次重新开始」不产生重复计时器/重复小球（幂等）
- 重新开始按钮绑定 `resetGame()` → 再次进入 `countdown` 流程
- 面板文案取自 spec §7.3

**验收标准（浏览器验证）**
- [ ] 倒计时归零后：球消失、倒计时停住、显示「游戏结束」与「最终得分：X」
- [ ] 结束后点击画面不再改变分数
- [ ] 点击「重新开始」：分数归 `0`、面板消失、重新走 `3-2-1` 并开始新一局
- [ ] **连续快速点击「重新开始」3 次以上**，新一局计时正常（不加速、不跳秒）、场上仍只有 1 个球
- [ ] 一局中分数为正/为负两种情况，结算面板均正确显示
- [ ] 反复玩 3 局以上，无内存泄漏迹象（Console 无报错、计时无漂移）
- [ ] `file://` 直接打开运行的情况下，以上全部成立

**提交：** `feat: add game over result panel and restart flow with timer cleanup`

---

### T7：总体验收与代码评审收尾

**Files:**
- Modify: `index.html` / `css/style.css` / `js/game.js`（按评审报告修正）

**内容**
1. 执行阶段 4 前端专项代码评审：变量命名、代码可读性、JS 事件机制、事件冒泡、绑定合理性、CSS 冗余、Flex/Grid 布局规范性、可维护性
2. 输出评审报告，逐条修正问题
3. 对照 spec §9 总体验收标准，逐项人工验证并勾选
4. 清理无用代码/注释，确认常量与 CSS 变量无重复硬编码
5. 确认 Console 无任何 error / warning

**验收标准（浏览器验证）**
- [ ] spec §9 全部 12 条验收项逐条通过
- [ ] 评审报告中的问题项全部修正并复验
- [ ] 三份文件无内联 style / 无内联 onclick / 无第三方引用
- [ ] Console 无报错、无警告

**提交：** `refactor: apply code review fixes and final verification`

---

## 阶段 6 · 收尾（全部任务完成后）

- 指导分阶段 Git 提交回顾（确认每个任务一次提交，历史清晰）
- 输出 `e:\wml\retrospective.md` 项目复盘文档
- 最终提交：`docs: add project retrospective`

---

## 待用户确认

本计划共 **7 个任务**（T1–T7），依赖关系见上。请确认任务粒度与顺序；如需拆分更细或合并，提出后我调整。
确认前不进入阶段 3，不编写任何业务代码。
