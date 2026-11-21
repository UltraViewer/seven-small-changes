// Bootstrap + wiring: DOM, overlays, keyboard, and the ?shot= render states
// used for screenshots (start / play&level=N&found=i,j,k / end).

import { LEVELS, LEVEL_TIME_SECONDS } from "./levels.js";
import { Game } from "./game.js";
import { playClick } from "./audio.js";
import { setPanelImages } from "./render.js";

const $ = (id) => document.getElementById(id);

const els = {
  levelName: $("level-name"),
  counter: $("counter"),
  score: $("score"),
  timer: $("timer"),
  hints: $("hints-left"),
  hintBtn: $("hint-btn"),
  restartBtn: $("restart-btn"),
  toast: $("toast"),
  startOverlay: $("start-overlay"),
  completeOverlay: $("complete-overlay"),
  winOverlay: $("win-overlay"),
  failOverlay: $("fail-overlay"),
  completeTitle: $("complete-title"),
  completeScore: $("complete-score"),
  winScore: $("win-score"),
  winTime: $("win-time"),
  failLevel: $("fail-level"),
};

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
}

function showOnly(overlay) {
  for (const o of [els.startOverlay, els.completeOverlay, els.winOverlay, els.failOverlay]) {
    o.classList.toggle("hidden", o !== overlay);
  }
}

function showToast(text) {
  els.toast.textContent = text;
  els.toast.classList.remove("hidden");
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => els.toast.classList.add("hidden"), 2200);
}

const game = new Game({
  onHud(h) {
    els.levelName.textContent = `Level ${h.levelIndex + 1}/${h.levelCount} — ${h.levelName}`;
    els.counter.textContent = `Found ${h.found}/${h.total}`;
    els.score.textContent = `Score ${h.score}`;
    els.timer.textContent = fmtTime(h.timeLeft);
    els.timer.classList.toggle("danger", h.timeLeft <= 30);
    els.hints.textContent = `Hints ${h.hintsLeft}`;
    els.hintBtn.disabled = h.hintsLeft <= 0;
  },
  onFound(diff) {
    showToast(`Found it — ${diff.name}! +100`);
  },
  onLevelComplete(level, bonus) {
    els.completeTitle.textContent = `${level.name} complete!`;
    els.completeScore.textContent = `Time bonus +${bonus}  •  Score ${game.score}`;
    showOnly(els.completeOverlay);
  },
  onWin(total) {
    els.winScore.textContent = `Total score ${total.score}`;
    els.winTime.textContent = `Total time ${fmtTime(total.timeUsed)}`;
    showOnly(els.winOverlay);
  },
  onFail(level) {
    els.failLevel.textContent = `Time ran out on ${level.name}.`;
    showOnly(els.failOverlay);
  },
});

function clickOnPanel(side) {
  return (ev) => {
    // Measure against the <img>, not the <figure>: the figure stretches to
    // the full board height, which would skew the y coordinate.
    const rect = ev.currentTarget.querySelector("img").getBoundingClientRect();
    game.click(side, (ev.clientX - rect.left) / rect.width, (ev.clientY - rect.top) / rect.height);
  };
}

$("panel-left").addEventListener("click", clickOnPanel("left"));
$("panel-right").addEventListener("click", clickOnPanel("right"));
els.hintBtn.addEventListener("click", () => {
  playClick();
  game.useHint();
});
els.restartBtn.addEventListener("click", () => {
  playClick();
  game.restartLevel();
  showOnly(null);
});
$("start-btn").addEventListener("click", () => {
  playClick();
  showOnly(null);
  game.start();
});
$("next-btn").addEventListener("click", () => {
  playClick();
  showOnly(null);
  game.nextLevel();
});
$("retry-btn").addEventListener("click", () => {
  playClick();
  showOnly(null);
  game.restartLevel();
});
$("again-btn").addEventListener("click", () => {
  playClick();
  showOnly(null);
  game.start();
});

document.addEventListener("keydown", (ev) => {
  if (ev.key === "h" || ev.key === "H") game.useHint();
  if (ev.key === "r" || ev.key === "R") {
    game.restartLevel();
    showOnly(null);
  }
});

// ---- Screenshot render states (?shot=...) ----
const params = new URLSearchParams(window.location.search);
const shot = params.get("shot");

if (shot === "end") {
  // Representative completed run: all 21 finds (+2100) plus time bonuses.
  // Show the final level's panels behind the win card.
  setPanelImages(LEVELS[2]);
  game.score = 2340;
  els.winScore.textContent = "Total score 2340";
  els.winTime.textContent = "Total time 07:32";
  showOnly(els.winOverlay);
  els.levelName.textContent = "Level 3/3 — Night Garden";
  els.counter.textContent = "Found 7/7";
  els.score.textContent = "Score 2340";
  els.timer.textContent = "03:00";
  els.hints.textContent = "Hints 0";
  els.hintBtn.disabled = true;
} else if (shot === "play") {
  const level = Math.min(
    Math.max(parseInt(params.get("level") || "1", 10) - 1, 0),
    LEVELS.length - 1,
  );
  const found = (params.get("found") || "")
    .split(",")
    .filter(Boolean)
    .map((s) => parseInt(s, 10))
    .filter((i) => i >= 0 && i < LEVELS[level].diffs.length);
  game.score = found.length * 100;
  showOnly(null);
  game.loadLevel(level, found);
} else {
  // Default and ?shot=start: title screen over level 1.
  showOnly(els.startOverlay);
  game.loadLevel(0);
  game.stopTimer();
  game.playing = false;
  game.timeLeft = LEVEL_TIME_SECONDS;
  els.timer.textContent = "03:00";
}
