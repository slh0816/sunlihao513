# 代码评审报告 · 学生成绩分析面板（等级二）

对象：`work/starteer-level2.html` › `<script>` IIFE（第 196–605 行）
评审维度：命名规范 / 可读性 / 事件机制 / CSS 冗余 / Flex 与 Grid / 可维护性
结论：**功能全部正确，可直接交付**；存在 3 处结构性可优化点与 2 处死代码，不影响验收。

---

## 1. 命名规范

| 项 | 评价 |
|---|---|
| 新增局部变量、回调参数 | 全部 `slh_` 前缀，符合项目强制约定（如 `slh_count`、`slh_sub`、`slh_champ`） |
| 模板既有标识（函数名 `renderStats`、id `studentList`、类名 `student-card`） | 未改动，保持与 target 一致 |
| 建议改进 | `slh_box`、`slh_item`、`slh_e2`、`slh_s` 语义偏弱。同类容器建议命名为 `slh_studentListEl` / `slh_subjectItemEl`；`slh_e1/e2` 属复用变量名，易错位，建议 `slh_emptyTop` / `slh_emptyWarn` |

命名总体一致，缩写属于可接受范围，不构成缺陷。

## 2. 可读性

**优点**
- 每个函数上方保留模板的注释块，标明了考察点（reduce / filter / sort / some / every），教学意图清晰。
- 纯计算层（`scoreClass` / `getTotal` / `getAvg` / `getFails`，第 206–234 行）与渲染层分离，`renderStats` 等只调用不重复算，职责边界干净。
- 渲染函数内部统一采用「建容器 → 逐项 createElement → appendChild」的线性流程，无深层嵌套分支。

**问题**
- `renderRankings`（第 305–419 行，约 115 行）一个函数承担 4 件事：优秀 Top3、各科状元、不及格预警、状态条。虽有 `3-1 ~ 3-4` 分节注释，但函数过长，不利于单点调试。
  → 建议拆为 `renderTopStudents` / `renderChampions` / `renderFailWarning` / `renderStatusTip`，`renderRankings` 只做编排。
- `renderStudentCards`（第 420–515 行，约 96 行）同样偏长，建议抽出 `buildCardHeader` / `buildScoreGrid` / `buildDetail` 三个构造器。

## 3. 事件机制（冒泡 / 委托 / 绑定）

| 绑定位置 | 机制 | 评审结论 |
|---|---|---|
| `searchInput` input（第 569–572 行） | 直接绑定 + `setTimeout` 200ms 防抖 | 正确。`clearTimeout(timer)` 先清后设，连续输入只触发最后一次 |
| `sortBtns` click（第 575–582 行） | 事件委托 + `e.target.closest("button")`，`this.querySelectorAll("button")` 清高亮 | 正确。`querySelectorAll` 返回**静态** NodeList，遍历期间不会因 `classList.remove` 而缩短，可直接 `forEach` |
| `filterBtns` click（第 585–593 行） | 事件委托 + `getElementsByClassName("active")` | 正确且是刻意对比点：`getElementsByClassName` 是**动态**集合，删除一个 `active` 后长度立即变化，故用 `while (btns.length)` 迭代，避免索引越界 |
| `studentList` click（第 596–601 行） | 事件委托 + `closest(".student-card")` + `lastElementChild` | 正确。卡片整体可点击，靠冒泡到容器，新增卡片无需重复绑定 |

**遗留瑕疵**
- 第 599 行 `var detail = card.lastElementChild;` 声明后未被使用，真正的展开靠 `classList.toggle("open")` + CSS 控制。属模板既有代码，按约定未改动，但评审上应记为「无效赋值」。
- 委托处理函数未判空 `e.target`（如点击卡片内 `<span>` 时 `closest` 仍能向上找到卡片，行为正确；仅当点击容器空白处 `closest` 返回 `null`，已有 `if (!card) return` 防护）。

## 4. CSS 冗余

| 位置 | 问题 | 处理建议 |
|---|---|---|
| 第 100–101 行 `.task-note` / `.task-note b` | HTML 中的黄色提示框已删除，规则失去引用，成为死代码 | 可清理（本次按「HTML/CSS 尽量不动」原则保留，不影响渲染） |
| 第 60 行 `.rank-row .rk` 与 `.rank-row .rk` 重复声明（同选择器分两条） | 前者设尺寸与布局，后者设配色；拆分写法可读但合并更紧凑 | 可合并为一条（低优先级） |
| 第 22–23 行 `.head h1` 与 `.head h1 .logo` | 无冗余，前缀继承关系清晰 | 保持 |
| `--shadow` / `--shadow-sm` 双档阴影 | 卡片与区块使用不同档，属设计意图而非冗余 | 保持 |

未发现重复的颜色硬编码（颜色统一走 `:root` 变量），主题可换肤，这一点做得规范。

## 5. Flex 与 Grid

| 区域 | 布局方案 | 评价 |
|---|---|---|
| `.stat-grid`（第 30 行） | `grid` + `repeat(4, 1fr)` | 四统计卡等宽对齐，正确。**无 `@media` 断点**，窄屏仍强制 4 列，会挤压数字 |
| `.subject-item`（第 39 行） | `grid` + `80px 1fr 54px` | 名称列定宽、进度条自适应、数值列定宽，三列语义明确，是本次最恰当的 Grid 用法 |
| `.rank-grid`（第 52 行） | `grid` + `repeat(3, 1fr)` | 三榜单并列正确；同样缺断点，窄屏三列过窄 |
| `.student-grid`（第 75 行） | `grid` + `repeat(auto-fill, minmax(320px, 1fr))` | **最佳实践**：卡片自适应列数，无需断点即具备响应性 |
| `.score-grid`（第 86 行） | `grid` + `repeat(5, 1fr)` | 五科格等分，配合 `.score-item` 的 `text-align:center` 视觉均衡 |
| `.controls` / `.btn-group` / `.rank-row` / `.hd` / `.ft` | `flex` + `flex-wrap` / `space-between` / `gap` | 一维排列用 Flex，方向正确；`justify-content: space-between` 使搜索框与按钮组分列两端 |

**结论**：一维用 Flex、二维用 Grid 的分工完全正确，`auto-fill + minmax` 是亮点。唯一系统性缺口是缺少 `@media` 响应式断点，靠 `.student-grid` 的自适应兜底；桌面端验收无影响。

## 6. 可维护性

**做得好的**
- 单一数据流：`refresh()`（第 557–564 行）严格按 `search → sortList → filterList → render*` 串联，四个渲染函数都只接受最终 `data`，不存在各渲染函数自行读 `window.STUDENTS` 的「隐式耦合」。
- 状态集中在 `currentSort` / `currentFilter` 两个变量，交互只改状态再统一 `refresh()`，没有分散的命令式补丁。
- 纯函数 `sortList` / `filterList` 均 `slice()` 后再操作，不污染原数组，可重复调用。

**风险点**
1. **全量重建导致展开态丢失**：`refresh()` 每次调用 `innerHTML = ""` 重建 18 张卡片。用户点开某张卡详情后再搜索/排序/筛选，`open` 类会随节点销毁而丢失。数据量 18 条下性能无虞，但交互体验有瑕疵。→ 改进方向：在 `renderStudentCards` 末尾按 `data-id` 回填已展开状态。
2. **`innerHTML` 拼接详情文案**：`detail` 区用字符串拼接生成（`"<b>不及格科目：</b>" + ...`）。数据来自本地可信 `data.js`，当前无注入风险；若将来数据来自接口，应改为 `textContent` 组装。
3. **`slh_maxSub` 未防空**：`SUBJECTS` 固定 5 科时安全；若科目配置被清空，`slh_maxSub.sub` 会抛 TypeError。同类情况在 `renderSubjectAverages` 已有 `list.length === 0` 保护，两处防御级别不一致。
4. **`var` 与 `const` 混用**：`currentSort` / `currentFilter`（第 527、544 行）用 `var`（模板既有），其余新增量用 `const`。风格不统一，教学上可接受。

---

## 7. 问题清单汇总

| 编号 | 级别 | 位置 | 问题 | 建议 |
|---|---|---|---|---|
| R1 | 一般 | 第 305–419 行 | `renderRankings` 职责过载（4 合 1，115 行） | 拆 4 个子函数 |
| R2 | 一般 | 第 420–515 行 | `renderStudentCards` 过长（96 行） | 抽 header / grid / detail 构造器 |
| R3 | 一般 | `refresh` 调用链 | 全量重建丢失卡片展开态 | 按 `data-id` 回填 `open` |
| R4 | 建议 | 第 599 行 | `var detail` 声明后未使用 | 删除（模板既有代码，按约定保留） |
| R5 | 建议 | 第 100–101 行 | `.task-note` 规则已无引用 | 清理死代码 |
| R6 | 建议 | 第 30、52 行 | 统计/榜单 Grid 无 `@media` 断点 | 补 900px / 600px 断点 |
| R7 | 建议 | `slh_maxSub` 逻辑 | 未处理 `SUBJECTS` 为空 | 与 `renderSubjectAverages` 保持同级防护 |
| R8 | 建议 | detail 文案 | `innerHTML` 拼接 | 数据外部化时改 `textContent` |

**验收判断**：R1–R3 属结构性优化，R4–R8 属打磨建议，均不影响效果图一比一还原与功能正确性，**当前版本可交付**。
