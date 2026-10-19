/* 抓小球小游戏 —— 游戏逻辑 */
/* T2：集中获取页面元素引用，供 T3 起的游戏逻辑使用 */
'use strict';

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
