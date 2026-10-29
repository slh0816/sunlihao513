# 任务拆解 · 学生成绩分析面板（等级一）

依据：`work/spec-starteer-level1.md`（已确认）。一次只推进一个任务，每个任务可独立验证。
改动文件仅 `work/starteer-level1.html` 的 `<script>` 区（T6 另删 task-note 提示框）。

## T1 工具函数（纯计算层）

实现 `scoreClass` / `getTotal` / `getAvg` / `getFails` 四个函数体（按模板注释）。

验收（浏览器控制台）：
- `getTotal(STUDENTS[7]) === 489`（周诗涵）
- `getAvg(STUDENTS[7]) === 97.8`
- `getFails(STUDENTS[4]).length === 1` 且科目为语文（刘子涵）
- `scoreClass(58)==="fail"`、`scoreClass(100)==="full"`、`scoreClass(80)===""`

## T2 F1 班级概览统计 `renderStats`

reduce 求总分、filter 求及格人数、写 4 张统计卡（statPassRate 用 firstChild 只改数字）。

验收：打开页面（未搜索时）4 卡显示 **18 / 7559 / 84 / 83%**，百分号不重复、不丢失。

## T3 F2 学生卡片列表 `renderStudentCards`

forEach + createElement 建 18 张卡：头像性别色、姓名、学号·性别、排名徽章（≤3 金）、五科分数格（fail/full 着色）、总分/均分。

验收：
- 18 张卡；首卡周诗涵「第1名」金色徽章，语文 100 绿色
- 第 3 名许若曦徽章金色、第 4 名张明轩徽章蓝色
- 刘子涵卡（第16名）语文 58 橙色；卡脚「总分 343 / 均分 68.6」

## T4 F3 不及格预警 `renderFailWarning`

filter + sort（不及格数降序）+ forEach 生成 .rank-row；空列表给 empty 提示。

验收：预警区 3 行，顺序与内容为
`1 刘子涵（语文） 343分`、`1 黄宇轩（英语） 333分`、`1 孙博文（数学） 328分`。

## T5 F4 搜索 + F5 排序（交互联动）

`search` 按姓名/学号过滤（trim+小写）；`sortList` 总分降序/学号升序返回新数组。

验收：
- 搜「周」→ 仅周诗涵 1 卡，统计卡联动为 1 / 489 / 97.8 / 100%
- 搜「2024004」→ 仅陈雨桐；搜「  zhou  」同样命中周诗涵
- 清空搜索恢复 18 卡
- 点「按学号↑」→ 首卡张明轩（第1名金徽章），按钮高亮切换；点回「按总分↓」恢复周诗涵居首

## T6 收尾自检

删除黄色 task-note 提示框；按 spec §5 的 A1–A7 全量回归；确认控制台无报错。

验收：页面无 task-note；A1–A7 全过。

## 依赖与顺序

T1 → T2 → T3 → T4 → T5 → T6（T2–T4 依赖 T1；T5 依赖 T2–T4 的渲染；T6 最后）。
