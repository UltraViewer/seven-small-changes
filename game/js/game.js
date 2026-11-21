// Game state: timer, scoring, hints, win/lose. Knows nothing about the DOM
// except through the small `ui` object passed in by main.js.

import {
  LEVELS,
  LEVEL_TIME_SECONDS,
  POINTS_PER_FIND,
  WRONG_CLICK_PENALTY_SECONDS,
  HINTS_PER_LEVEL,
} from "./levels.js";
import { playChime, playThud, playWin, playTick } from "./audio.js";
import { setPanelImages, renderFound, renderHint, renderWrong, clearMarkers } from "./render.js";

const IMG_W = 960;
const IMG_H = 640;

export class Game {
  constructor(ui) {
    this.ui = ui; // {onHud(state), onLevelComplete(level, bonus), onWin(total), onFail(level)}
    this.levelIndex = 0;
    this.found = new Set();
    this.score = 0;
    this.timeLeft = LEVEL_TIME_SECONDS;
    this.hintsLeft = HINTS_PER_LEVEL;
    this.totalTimeUsed = 0;
    this.timerId = null;
    this.playing = false;
    this.lastTickSecond = null;
  }

  get level() {
    return LEVELS[this.levelIndex];
  }

  start() {
    this.score = 0;
    this.totalTimeUsed = 0;
    this.levelIndex = 0;
    this.loadLevel(0);
  }

  loadLevel(n, preFound = []) {
    this.stopTimer();
    this.levelIndex = n;
    this.found = new Set(preFound);
    this.timeLeft = LEVEL_TIME_SECONDS;
    this.hintsLeft = HINTS_PER_LEVEL;
    this.playing = true;
    this.lastTickSecond = null;
    setPanelImages(this.level);
    clearMarkers();
    for (const i of this.found) renderFound(this.level.diffs[i]);
    this.ui.onHud(this.hud());
    this.startTimer();
  }

  hud() {
    return {
      levelName: this.level.name,
      levelIndex: this.levelIndex,
      levelCount: LEVELS.length,
      found: this.found.size,
      total: this.level.diffs.length,
      score: this.score,
      timeLeft: this.timeLeft,
      hintsLeft: this.hintsLeft,
    };
  }

  startTimer() {
    this.timerId = window.setInterval(() => {
      if (!this.playing) return;
      this.timeLeft -= 1;
      if (this.timeLeft <= 10 && this.timeLeft > 0 && this.timeLeft !== this.lastTickSecond) {
        this.lastTickSecond = this.timeLeft;
        playTick();
      }
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.failLevel();
        return;
      }
      this.ui.onHud(this.hud());
    }, 1000);
  }

  stopTimer() {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  // side: "left" | "right"; relX/relY: click position as 0..1 across the image.
  click(side, relX, relY) {
    if (!this.playing) return;
    const px = relX * IMG_W;
    const py = relY * IMG_H;
    const within = (d) => {
      const dx = px - (d.x / 1000) * IMG_W;
      const dy = py - (d.y / 1000) * IMG_H;
      const rPx = (d.r / 1000) * IMG_W;
      return dx * dx + dy * dy <= rPx * rPx;
    };
    // Clicking an already-found difference is a no-op, not a miss.
    for (let i = 0; i < this.level.diffs.length; i++) {
      if (this.found.has(i) && within(this.level.diffs[i])) return;
    }
    for (let i = 0; i < this.level.diffs.length; i++) {
      if (this.found.has(i)) continue;
      const d = this.level.diffs[i];
      if (within(d)) {
        this.found.add(i);
        this.score += POINTS_PER_FIND;
        playChime();
        renderFound(d);
        this.ui.onHud(this.hud());
        this.ui.onFound(d);
        if (this.found.size === this.level.diffs.length) this.completeLevel();
        return;
      }
    }
    // Miss: red flash, dull thud, five seconds off the clock.
    playThud();
    renderWrong(side, relX, relY);
    this.timeLeft = Math.max(0, this.timeLeft - WRONG_CLICK_PENALTY_SECONDS);
    this.ui.onHud(this.hud());
    if (this.timeLeft <= 0) this.failLevel();
  }

  useHint() {
    if (!this.playing || this.hintsLeft <= 0) return;
    const remaining = this.level.diffs
      .map((d, i) => i)
      .filter((i) => !this.found.has(i));
    if (remaining.length === 0) return;
    this.hintsLeft -= 1;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    renderHint(this.level.diffs[pick]);
    this.ui.onHud(this.hud());
  }

  restartLevel() {
    this.loadLevel(this.levelIndex);
  }

  completeLevel() {
    this.playing = false;
    this.stopTimer();
    const bonus = this.timeLeft * 2;
    this.score += bonus;
    this.totalTimeUsed += LEVEL_TIME_SECONDS - this.timeLeft;
    playWin();
    this.ui.onHud(this.hud());
    this.ui.onLevelComplete(this.level, bonus);
  }

  nextLevel() {
    if (this.levelIndex + 1 < LEVELS.length) {
      this.loadLevel(this.levelIndex + 1);
    } else {
      this.win();
    }
  }

  failLevel() {
    this.playing = false;
    this.stopTimer();
    this.totalTimeUsed += LEVEL_TIME_SECONDS;
    this.ui.onHud(this.hud());
    this.ui.onFail(this.level);
  }

  win() {
    this.playing = false;
    this.stopTimer();
    this.ui.onWin({ score: this.score, timeUsed: this.totalTimeUsed });
  }
}
