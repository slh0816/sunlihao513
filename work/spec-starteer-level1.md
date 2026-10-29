# 需求规格 · 学生成绩分析面板（等级一·基础）

- 文件：`work/starteer-level1.html`（HTML/CSS 已完整，JS 留空待补）
- 数据：`work/data.js`（`window.STUDENTS` 18 人 × `window.SUBJECTS` 5 科）
- 视觉基准：用户提供的两张效果图（target.html 未提供，以效果图为准）
- 范围决定（用户已确认）：**只做模板已有区域**；效果图中的等级二区域（各科平均分条形图、优秀学生 Top3、各科状元、全部/优秀/含不及格筛选）不做

## 1. 数据核对结论（已与效果图逐项比对）

| 项 | 值 | 与效果图 |
|---|---|---|
| 班级人数 | 18 | ✅ 18 |
| 班级总分 | 7559 | ✅ 7559 |
| 班级平均分 | 84（7559÷90=83.99，保留 1 位→84） | ✅ 84 |
| 及格率 | 83%（15÷18=83.33 取整） | ✅ 83% |
| 不及格预警 | 刘子涵（语文）343分、黄宇轩（英语）333分、孙博文（数学）328分，各 1 科不及格 | ✅ 一致 |
| 总分降序顺序 | 周诗涵489 → 陈雨桐475 → 许若曦475 → … → 孙博文328 | ✅ 与效果图卡片顺序一致（并列时保持原数组序，即稳定排序） |
| 满分/不及格着色 | 周诗涵语文 100（绿 full）；58/55/58（橙 fail） | ✅ 一致 |

## 2. 功能规格（5 项必做）

### F1 班级概览统计 `renderStats(list)`
- 总分 totalScore：`list` 中所有学生五科分数之和（reduce 嵌套 reduce 或复用 getTotal）
- 平均分 avgScore = totalScore ÷（人数 × 5），`Math.round(x*10)/10` 保留 1 位
- 及格人数 passCount：没有任何科目 < 60 的学生数（filter）
- 及格率 passRate = `Math.round(passCount / 人数 * 100)`
- 写入：`statCount`、`statTotalScore`、`statAvgScore` 用 textContent；`statPassRate` 内部已有 `<span class="stat-unit">%</span>`，**用 `.firstChild.textContent` 只改数字**
- 边界：list 为空时四项均显示 0（防除零）

### F2 学生卡片列表 `renderStudentCards(list)`
- `#studentList` 清空 innerHTML 后 forEach 建卡
- 卡片 `.student-card`（`setAttribute("data-id", s.id)`），内部：
  - `.hd`：`.avatar boy|girl`（按 gender，文字=姓名首字）+ `.name` + `.meta`（`学号 · 性别`）+ `.rank-badge`（`第N名`，N = 当前 list 序号+1；**N≤3 追加 gold 类**）
  - `.score-grid`：SUBJECTS forEach 生成 `.score-item`（`.sbj`=abbr，`.val`=分数，并按 scoreClass 加 fail/full 类）
  - `.ft`：`总分 X`（.total）与 `均分 Y`（.avg，保留 1 位）
- appendChild 到容器

### F3 不及格预警 `renderFailWarning(list)`
- filter 出不及格科目数 > 0 的学生；sort 按不及格科目数**降序**（并列保持传入顺序）
- 每行 `.rank-row`：`.rk`=不及格科目数、`.nm`= `姓名（科目名、科目名）`、`.vl`= `总分分`（如 `343分`）
- 空列表写入 `<div class="empty">全员通过，无预警</div>`

### F4 搜索 `search(keyword)`
- `keyword.trim().toLowerCase()`；空 → `STUDENTS.slice()`
- filter：姓名包含关键字（小写比较）或学号字符串包含关键字
- 输入事件与 200ms 防抖已存在，不改

### F5 排序 `sortList(list, by)`
- `list.slice()` 复制后 sort，返回新数组（不改原数组）
- `"id"`：学号升序（`a.id > b.id ? 1 : -1`）；`"total"`：总分降序（`getTotal(b) - getTotal(a)`）
- 按钮高亮切换的事件委托已存在，不改

### 工具函数（按模板注释实现）
- `scoreClass(v)`：v < 60 → `"fail"`；v >= 100 → `"full"`；否则 `""`
- `getTotal(s)`：`SUBJECTS.reduce((sum, sub) => sum + s[sub.key], 0)`
- `getAvg(s)`：`Math.round(getTotal(s) / SUBJECTS.length * 10) / 10`
- `getFails(s)`：`SUBJECTS.filter(sub => s[sub.key] < 60)`

## 3. 考察点映射（任务要求 → 实现落点）

| 类别 | 落点 |
|---|---|
| DOM 查找 | getElementById（4 统计卡、3 容器、searchInput）；createElement/appendChild（卡片）；setAttribute（data-id）；classList（gold/fail/full）；innerHTML（清空）；closest（已有委托） |
| 数组方法 | reduce（总分）、filter（及格/不及格/搜索）、sort（排序/预警）、slice（复制）、forEach（渲染遍历） |
| 函数 | 纯计算函数（getTotal/getAvg/getFails/scoreClass）、渲染函数（render*）、事件处理与防抖（已有） |

## 4. 代码约定

- **新增 JS 局部变量/回调参数一律 `slh_` 前缀**（项目强制规则）；模板既有函数名、id、类名属历史代码不改
- HTML/CSS 不改动；**完成后删除黄色 task-note 提示框**（模板注明"完成后可删除"，效果图亦无此框）
- 事件绑定区与 refresh() 不改

## 5. 验收要点（阶段 3 出详细清单，此处预览）

- A1 统计卡 = 18 / 7559 / 84 / 83%
- A2 18 张卡片，顺序、分数、总分均分与效果图 3 一致；第 1–3 名徽章金色、其余蓝色
- A3 预警 3 行：1 刘子涵（语文）343分 / 1 黄宇轩（英语）333分 / 1 孙博文（数学）328分
- A4 搜「周」→ 仅周诗涵；搜「2024004」→ 仅陈雨桐；清空恢复 18 人；统计卡随搜索结果联动
- A5 切「按学号↑」首卡为张明轩（2024001），按钮高亮正确切换
- A6 不及格分数橙色、满分绿色
- A7 控制台无报错

## 6. 不在范围

- 等级二区域（各科平均分条形图、Top3、各科状元、全部/优秀/含不及格筛选按钮）
- data.js 数据修改、target.html 补齐
