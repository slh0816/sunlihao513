# 项目复盘文档（Retrospective）— 网页抓小球小游戏

- 课程：《高级网页设计》
- 项目路径：`e:\wml`
- 完成日期：2026-10-19
- 交付形态：原生 HTML5 + CSS3 + JavaScript，零依赖，`file://` 双击即可运行
- 工程流程：课程版 Superpowers 六阶段强制门禁（需求研讨 → 任务拆解 → 测试先行 → 代码评审 → 人工验证 → Git 收尾）

---

## 1. 项目概述与最终成果

在 120 秒内尽可能多地点击随机出现的蓝色小球，点中 +2、点空 -1，倒计时结束后弹出结算面板并可重新开始。

最终交付文件：

```
e:\wml\
├── index.html          # 页面结构（无内联 style / onclick）
├── css\style.css       # 全部样式（CSS 变量 + Flexbox + 绝对定位 + 动画）
├── js\game.js          # 全部逻辑（八段分区）
├── spec.md             # 需求规格（阶段 1 产出）
├── plan.md             # 任务拆解（阶段 2 产出）
├── acceptance-checklist.md  # T1–T7 人工验收清单（阶段 3 产出）
├── code-review.md      # T1–T7 前端专项评审报告（阶段 4 产出）
└── retrospective.md    # 本文档（阶段 6 产出）
```

需求达成：spec §9 十二条总体验收（G1–G12）与三条工程规范项（G13–G15）全部人工验证通过。

---

## 2. 六阶段流程执行回顾

| 阶段 | 名称 | 本次执行情况 |
|---|---|---|
| 1 | Brainstorming 需求研讨 | 产出 `spec.md` v1.0：8 条 FR、7 条 NFR、明确"不做"清单、2 项待确认默认决策（D-1 分数不设上限、D-2 确认后即 git init）。经用户确认后进入下一阶段 |
| 2 | writing-plans 任务拆解 | 产出 `plan.md`：拆成 T1–T7 七个可独立验证的任务，标注依赖链与每任务验收标准；一次只推进一个任务 |
| 3 | TDD 测试先行 | 每个任务**先**把浏览器人工验收清单追加到 `acceptance-checklist.md`，**再**写实现；前端以手动验收为主，未强加复杂单元测试 |
| 4 | Code-review 前端评审 | 每任务完成后按八维度专项评审并追加到 `code-review.md`；有必修项必须改完复验才能进入下一任务 |
| 5 | Manual Verification 人工验证 | 每任务由用户按清单在浏览器逐项验证，回复「Tx 通过」后放行下一任务 |
| 6 | Git 版本管理与收尾 | 每任务一次提交（Conventional Commits），全部完成后输出本文档并做收尾提交 |

**门禁执行结果**：T1–T7 逐任务推进，全程未跨阶段、未跳阶段，用户逐任务确认通过。

---

## 3. 任务与 Git 提交记录

| 任务 | 内容 | 提交 |
|---|---|---|
| T1 | 项目骨架与 Git 初始化 | `b8f7a2c` chore: init project skeleton, gitignore and spec / `30b9f89` chore: ignore trae workspace directory / `38bc961` docs: add T1 acceptance checklist and code review report |
| T2 | 页面结构与视觉基调（浅黄背景 + 顶部 HUD） | `1e93d64` style: build page layout with yellow background and top HUD |
| T3 | 状态机与倒计时（3-2-1 预备 + 120 秒） | `4876b11` feat: add game state machine and 120s countdown with 3-2-1 pre-countdown |
| T4 | 小球渲染与安全区随机定位 | `4d5eaa2` feat: render blue ball with safe-area random positioning and pop-in animation |
| T5 | 点击判定与计分 | `d773238` feat: implement click scoring (+2 on ball, -1 on blank) |
| T6 | 结算面板与重新开始 | `b8095b4` feat: add game over result panel and restart flow with timer cleanup |
| T7 | 总体验收与评审收尾 | `3f270ab` refactor: apply code review fixes and final verification |

提交信息统一遵循 Conventional Commits（`chore` / `docs` / `style` / `feat` / `refactor`），每个任务对应一次提交，历史线性清晰、可逐任务回溯。

---

## 4. 代码评审发现与修复汇总

| 编号 | 任务 | 问题 | 类型 | 处理 |
|---|---|---|---|---|
| R1 | T2 | `html, body` 上的 `height: 100%` 为冗余声明（`.game` 已用 `100vh` 撑满） | 必修 | 已删除并复验布局不受影响 |
| R2 | T4 | 初版仅球径读 CSS 变量，边距/顶部栏高度仍为 JS 硬编码，存在两处不一致隐患 | 建议（本任务内改进） | 抽出 `getCssPixel(name, fallback)`，三者统一由样式表提供，JS 常量降级为兜底值 |
| R3 | T7 | `formatTime()` 中 `60` 与 `padStart(2)` 的 `2` 为散落字面量，与 NFR-5 不符 | 必修 | 新增 `SECONDS_PER_MINUTE` / `TIME_FIELD_WIDTH`，输出逐值不变 |

除上述修复外，T1 / T3 / T5 / T6 评审均为 0 必修项。评审还沉淀了约 20 条"记录留痕"（非缺陷的设计说明），如：`.is-hidden` 必须置于样式表末尾的顺序敏感约束、命中即换位置导致的"连点第二次会扣分"属预期行为、`resetGame()` 把状态放回 `IDLE` 以复用 `startGame()` 守卫等。

---

## 5. 关键技术决策与理由

| 决策 | 理由 |
|---|---|
| 四状态机（`idle`/`countdown`/`playing`/`over`） | 用显式状态收敛副作用：所有点击/尺寸事件先判 `PLAYING`，其余状态天然免疫，避免分支散落 |
| 时间戳差值法计时 | `endTime = Date.now() + 120000`，每帧用 `endTime - Date.now()` 计算，杜绝 `setInterval` 累加漂移（NFR-1） |
| 事件委托 + 结构隔离 | 游戏区只绑一次 `click`，用 `closest('.ball')` 判定；`.hud`/`.result-panel` 置于 `.game` 之外，使"点顶部不扣分"由**结构**保证，而非 `stopPropagation()` 补丁 |
| 尺寸单一来源 | `getCssPixel()` 让守护区计算以样式表变量为唯一来源，JS 常量仅作兜底，避免改一处忘一处 |
| 强制回流重播动画 | 移除类 → `void element.offsetWidth` → 重加类，解决"CSS 动画只首次播放"问题 |
| 计时器集中登记 | `timers{preCountdown, tick}` + `clearAllTimers()` 单一清理点，保证多次重新开始不产生重复计时器（NFR-2/NFR-3） |

---

## 6. 遇到的问题与解决

1. **`index.html` 被代码编辑器接管**：T1 首次验证时页面未按预期呈现，一度被误判为代码缺陷。定位后发现是**文件打开方式**问题（双击被编辑器接管），改为浏览器地址栏输入 `file:///E:/wml/index.html` 后正常。教训：前端验证必须明确"用浏览器打开"，此约定随后写入各任务清单的操作步骤。
2. **Windows 环境下 `superpowers-trae` 调用方式**：该工具为 Node 脚本，直接 `&` 调用会报 pipeline 相关错误，需用 `node "$env:USERPROFILE\.trae\superpowers\.trae\superpowers-trae" <args>`；PowerShell 5 不支持 heredoc，Git 提交改用 `-m "标题" -m "正文"` 两段式。
3. **动画不重播**：小球刷新与倒计时数字切换时动画只在首次播放，通过"移除类 → 触发回流 → 重加类"解决，并在代码中注释说明该非直觉写法的原因。

---

## 7. 经验总结

**做得好的地方**

- 严格遵守强制门禁：每任务"清单先行 → 实现 → 评审 → 人工验证 → 提交"闭环，问题在小步内被发现和修复。
- 评审真的产生了价值：R1/R2/R3 分别消除了冗余样式、两处硬编码不一致、魔法数字散落，而非走过场。
- 范围控制严格：spec §1.2 列出的音效、最高分、触屏、多球等一律未实现，交付体量小而完整。
- 文档与代码同步演进：`acceptance-checklist.md`、`code-review.md` 逐任务增量追加，形成可追溯的工程证据链。

**可改进的地方**

- T3/T7 评审对"魔法数字常量化"的表述曾不够精确（先称"无散落字面量"，T7 才发现 `formatTime` 的 `60`）。启示：**评审结论应给出核对清单（如逐条列出函数体内的数值字面量），而非笼统断言**。
- 人工验收依赖用户逐项操作，且部分项需等满 120 秒，验证成本偏高。后续可考虑增加一个"缩短局时长"的调试开关以加速验收（但本次为遵守范围约定未实现）。

---

## 8. 范围控制（YAGNI）确认

spec §1.2「明确不做」逐项核对，均**未实现**：无音效/背景音乐、无最高分记录与排行榜、无用户系统、无触屏适配、无小球移动或大小变化、无多球同屏、无难度递增、无暂停/继续、无路由/构建工具/后端、无任何第三方库与 CDN 资源。技术栈锁定为原生三件套，`file://` 直接可运行。

---

## 9. 结语

本项目以一款功能简单的抓小球游戏为载体，完整走通了「需求研讨 → 任务拆解 → 测试先行 → 代码评审 → 人工验证 → Git 收尾」的前端工程流程。真正沉淀下来的，与其说是几百行游戏代码，不如说是这套**每步留痕、每步可回溯、每步有门禁**的工作方式——它让"能跑"与"可维护"之间的差距，被拆解成了一次次可验证的小步。
