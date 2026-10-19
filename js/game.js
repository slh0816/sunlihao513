/* 抓小球小游戏 —— 游戏逻辑 */
'use strict';

/* ==================== 1. 常量 ==================== */
/** 游戏状态枚举 */
const GAME_STATES = Object.freeze({
  IDLE: 'idle',           // 待开始
  COUNTDOWN: 'countdown', // 3-2-1 预备倒计时
  PLAYING: 'playing',     // 游戏进行中
  OVER: 'over',           // 已结束
});

const GAME_DURATION_MS = 120000;          // 一局游戏时长（2 分钟）
const PRE_COUNTDOWN_SECONDS = 3;          // 预备倒计时起始数字
const PRE_COUNTDOWN_INTERVAL_MS = 1000;   // 预备倒计时每个数字停留时长
const TICK_INTERVAL_MS = 100;             // 顶部剩余时间的刷新间隔
const MS_PER_SECOND = 1000;

const BALL_SIZE = 64;                     // 小球直径兜底值（px，与 --ball-size 同步，实际以样式表为准）
const SAFE_GAP = 24;                      // 安全边距兜底值（px，与 --safe-gap 同步，实际以样式表为准）
const HUD_HEIGHT = 64;                    // 顶部栏高度兜底值（px，与 --hud-height 同步，实际以样式表为准）

/* ==================== 2. 页面元素引用 ==================== */
/** 页面元素引用集合 */
const dom = {
  score: document.getElementById('score'),
  timer: document.getElementById('timer'),
  startButton: document.getElementById('startButton'),
  gameArea: document.getElementById('gameArea'),
  ball: document.getElementById('ball'),
  countdownOverlay: document.getElementById('countdownOverlay'),
  countdownNumber: document.getElementById('countdownNumber'),
  resultPanel: document.getElementById('resultPanel'),
  finalScore: document.getElementById('finalScore'),
  restartButton: document.getElementById('restartButton'),
};

/* ==================== 3. 游戏状态 ==================== */
let gameState = GAME_STATES.IDLE;   // 当前状态
let endTime = 0;                    // 本局结束时刻的时间戳（时间戳差值法）

/** 各计时器句柄，统一登记以便集中清理 */
const timers = {
  preCountdown: null,  // 预备倒计时循环
  tick: null,          // 剩余时间刷新循环
};

/* ==================== 4. 工具函数 ==================== */
/**
 * 把剩余秒数格式化为 mm:ss（两位补零）
 * @param {number} totalSeconds 剩余秒数
 * @returns {string} 形如 "02:00" 的字符串
 */
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * 按剩余毫秒刷新顶部时间显示
 * @param {number} remainingMs 剩余毫秒数
 */
function updateTimerDisplay(remainingMs) {
  // 向上取整：开局显示 02:00，归零显示 00:00
  const remainingSeconds = Math.ceil(remainingMs / MS_PER_SECOND);
  dom.timer.textContent = formatTime(Math.max(0, remainingSeconds));
}

/**
 * 读取 :root 上某个 CSS 变量并解析为像素数值（如 "64px" → 64）
 * 目的：尺寸只在样式表中定义一处，避免 JS 与 CSS 两处硬编码不一致
 * @param {string} variableName CSS 变量名（含 -- 前缀）
 * @param {number} fallback 变量缺失或不可解析时的兜底值
 * @returns {number} 像素数值
 */
function getCssPixel(variableName, fallback) {
  const rawValue = getComputedStyle(document.documentElement).getPropertyValue(variableName);
  return parseFloat(rawValue) || fallback;
}

/** 小球直径（px），以样式表变量 --ball-size 为唯一来源 */
function getBallSize() {
  return getCssPixel('--ball-size', BALL_SIZE);
}

/**
 * 计算小球可放置的安全坐标范围（依据 spec FR-7）
 * 规则：完整落在游戏区内、不与顶部栏重叠、四边留出安全边距
 * @returns {{minX:number, maxX:number, minY:number, maxY:number}} 安全范围（px）
 */
function getSafeBounds() {
  const ballSize = getBallSize();
  const safeGap = getCssPixel('--safe-gap', SAFE_GAP);
  const hudHeight = getCssPixel('--hud-height', HUD_HEIGHT);
  // 窗口极小时可用宽/高可能为负，用 Math.max 收敛，保证 max 不小于 min
  const maxX = Math.max(safeGap, window.innerWidth - ballSize - safeGap);
  const maxY = Math.max(hudHeight + safeGap, window.innerHeight - ballSize - safeGap);
  return {
    minX: safeGap,
    maxX,
    minY: hudHeight + safeGap,
    maxY,
  };
}

/**
 * 在安全范围内均匀随机生成小球坐标
 * @returns {{x:number, y:number}} 随机坐标（px）
 */
function getSafePosition() {
  const bounds = getSafeBounds();
  return {
    x: bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
    y: bounds.minY + Math.random() * (bounds.maxY - bounds.minY),
  };
}

/** 重播小球出现动画：移除动画类 → 触发回流 → 重新添加类（否则浏览器会合并两次类变更而不重播） */
function replaySpawnAnimation() {
  dom.ball.classList.remove('is-spawn');
  void dom.ball.offsetWidth;
  dom.ball.classList.add('is-spawn');
}

/** 生成小球：设置安全区内的随机坐标、取消隐藏并播放出现动画（T5 点中后刷新位置复用此函数） */
function spawnBall() {
  const { x, y } = getSafePosition();
  dom.ball.style.left = `${x}px`;
  dom.ball.style.top = `${y}px`;
  dom.ball.classList.remove('is-hidden');
  replaySpawnAnimation();
}

/** 把当前小球就近约束回安全区内（不重新随机，用于窗口缩小时防止越界） */
function constrainBallToSafeArea() {
  const bounds = getSafeBounds();
  const currentLeft = parseFloat(dom.ball.style.left) || 0;
  const currentTop = parseFloat(dom.ball.style.top) || 0;
  const clampedX = Math.min(Math.max(currentLeft, bounds.minX), bounds.maxX);
  const clampedY = Math.min(Math.max(currentTop, bounds.minY), bounds.maxY);
  dom.ball.style.left = `${clampedX}px`;
  dom.ball.style.top = `${clampedY}px`;
}

/* ==================== 5. 计时器管理 ==================== */
/** 清理全部计时器，防止出现重复计时或"幽灵计时" */
function clearAllTimers() {
  clearInterval(timers.preCountdown);
  clearInterval(timers.tick);
  timers.preCountdown = null;
  timers.tick = null;
}

/* ==================== 6. 流程控制 ==================== */
/** 点击「开始游戏」：仅允许从待开始状态启动 */
function startGame() {
  if (gameState !== GAME_STATES.IDLE) {
    return;
  }
  clearAllTimers();            // 幂等：避免残留计时器叠加
  updateTimerDisplay(GAME_DURATION_MS);
  startPreCountdown();
}

/**
 * 显示预备倒计时的某个数字，并强制重播弹出动画
 * @param {number} number 要显示的数字
 */
function showCountdownNumber(number) {
  dom.countdownNumber.textContent = String(number);
  // 动画只在首次渲染时播放，需移除类 → 触发回流 → 重新添加
  dom.countdownNumber.classList.remove('is-pop');
  void dom.countdownNumber.offsetWidth;
  dom.countdownNumber.classList.add('is-pop');
}

/** 预备倒计时：依次显示 3 → 2 → 1，结束后进入游戏 */
function startPreCountdown() {
  gameState = GAME_STATES.COUNTDOWN;
  dom.startButton.disabled = true;
  dom.countdownOverlay.classList.remove('is-hidden');

  let remaining = PRE_COUNTDOWN_SECONDS;
  showCountdownNumber(remaining);

  timers.preCountdown = setInterval(() => {
    remaining -= 1;
    if (remaining > 0) {
      showCountdownNumber(remaining);
      return;
    }
    clearInterval(timers.preCountdown);
    timers.preCountdown = null;
    dom.countdownOverlay.classList.add('is-hidden');
    startPlaying();
  }, PRE_COUNTDOWN_INTERVAL_MS);
}

/** 进入游戏：开始 120 秒计时 */
function startPlaying() {
  gameState = GAME_STATES.PLAYING;
  endTime = Date.now() + GAME_DURATION_MS;
  updateTimerDisplay(GAME_DURATION_MS);   // 先显示 02:00，再启动刷新循环
  spawnBall();                            // 进入游戏立即在安全区内随机生成第一个小球
  timers.tick = setInterval(onTick, TICK_INTERVAL_MS);
}

/** 每个刷新周期：用时间戳差值计算剩余时间，避免累计误差 */
function onTick() {
  const remainingMs = endTime - Date.now();
  if (remainingMs <= 0) {
    updateTimerDisplay(0);
    endGame();
    return;
  }
  updateTimerDisplay(remainingMs);
}

/** 结束游戏：停表并切换状态（结算面板与重新开始在 T6 实现） */
function endGame() {
  clearAllTimers();
  gameState = GAME_STATES.OVER;
  updateTimerDisplay(0);   // 时间停留在 00:00
}

/** 窗口尺寸变化：游戏进行中把小球就近约束回安全区，避免窗口变小后球越界 */
function onWindowResize() {
  if (gameState !== GAME_STATES.PLAYING) {
    return;
  }
  constrainBallToSafeArea();
}

/* ==================== 7. 事件绑定 ==================== */
dom.startButton.addEventListener('click', startGame);
window.addEventListener('resize', onWindowResize);
