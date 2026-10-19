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

/* ==================== 7. 事件绑定 ==================== */
dom.startButton.addEventListener('click', startGame);
