// Panel rendering: images, found markers, hint pulse, wrong-click flash.
// Markers are positioned by percentage so they track the image at any size.
// Coordinates in levels.js are normalized 0-1000, so left = x/10 %, top = y/10 %.

export function setPanelImages(level) {
  document.getElementById("img-left").src = level.a;
  document.getElementById("img-right").src = level.b;
}

function markerEl(diff, kind) {
  const el = document.createElement("div");
  el.className = "marker " + kind;
  el.style.left = diff.x / 10 + "%";
  el.style.top = diff.y / 10 + "%";
  // Ring diameter tracks the difference radius, clamped for visibility.
  const size = Math.max(34, Math.min(64, diff.r * 1.1));
  el.style.width = size + "px";
  el.style.height = size + "px";
  if (kind === "found") {
    const check = document.createElement("span");
    check.className = "marker-check";
    check.textContent = "✓";
    el.appendChild(check);
  }
  return el;
}

// Draw a permanent gold ring + check on BOTH panels for a found difference.
export function renderFound(diff) {
  for (const side of ["left", "right"]) {
    const layer = document.getElementById("marks-" + side);
    layer.appendChild(markerEl(diff, "found"));
  }
}

// Pulse one unfound difference for ~2 seconds, then remove the pulse.
export function renderHint(diff) {
  const els = [];
  for (const side of ["left", "right"]) {
    const el = markerEl(diff, "hint");
    document.getElementById("marks-" + side).appendChild(el);
    els.push(el);
  }
  window.setTimeout(() => els.forEach((el) => el.remove()), 2000);
}

// Brief red flash at a missed click, on the panel that was clicked.
export function renderWrong(side, relX, relY) {
  const layer = document.getElementById("marks-" + side);
  const el = document.createElement("div");
  el.className = "marker wrong";
  el.style.left = relX * 100 + "%";
  el.style.top = relY * 100 + "%";
  el.style.width = "44px";
  el.style.height = "44px";
  layer.appendChild(el);
  window.setTimeout(() => el.remove(), 550);
}

export function clearMarkers() {
  for (const side of ["left", "right"]) {
    document.getElementById("marks-" + side).replaceChildren();
  }
}
