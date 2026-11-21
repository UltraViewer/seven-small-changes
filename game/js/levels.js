// Level data for Seven Small Changes.
// Coordinates are NORMALIZED (0-1000) across each 960x640 scene image:
//   x = px / 960 * 1000,  y = py / 640 * 1000,  r = radius in the same units.
// `name` is shown when a difference is found. `a` is the original panel,
// `b` is the changed panel.

export const LEVELS = [
  {
    name: "Morning Market",
    difficulty: "Easy",
    a: "assets/scene1.png",
    b: "assets/scene1-b.png",
    diffs: [
      { x: 648, y: 831, r: 27, name: "Green apple in the basket" },
      { x: 526, y: 570, r: 25, name: "Burnt croissant" },
      { x: 693, y: 75,  r: 19, name: "Bird on the lamppost" },
      { x: 708, y: 852, r: 19, name: "Red orange" },
      { x: 932, y: 70,  r: 23, name: "Missing pink flower" },
      { x: 156, y: 898, r: 19, name: "Fallen apple on the cobbles" },
      { x: 911, y: 617, r: 29, name: "Blue flower pot" },
    ],
  },
  {
    name: "The Old Library",
    difficulty: "Medium",
    a: "assets/scene2.png",
    b: "assets/scene2-b.png",
    diffs: [
      { x: 79,  y: 234, r: 23, name: "Red book spine" },
      { x: 535, y: 770, r: 32, name: "Missing flat book" },
      { x: 469, y: 766, r: 22, name: "Teacup on the table" },
      { x: 911, y: 688, r: 44, name: "Rose cushion" },
      { x: 875, y: 297, r: 28, name: "Missing leaning book" },
      { x: 583, y: 961, r: 19, name: "Mouse on the floor" },
      { x: 297, y: 719, r: 33, name: "Green book on the table" },
    ],
  },
  {
    name: "Night Garden",
    difficulty: "Hard",
    a: "assets/scene3.png",
    b: "assets/scene3-b.png",
    diffs: [
      { x: 693, y: 836, r: 29, name: "Pale lotus flower" },
      { x: 562, y: 828, r: 28, name: "Missing lily pad" },
      { x: 323, y: 581, r: 19, name: "Bird on the bench" },
      { x: 917, y: 500, r: 29, name: "Dark cottage window" },
      { x: 458, y: 609, r: 27, name: "Missing potted plant" },
      { x: 781, y: 805, r: 21, name: "Frog on a lily pad" },
      { x: 325, y: 620, r: 47, name: "Grey-blue bench" },
    ],
  },
];

export const LEVEL_TIME_SECONDS = 180; // 3:00 per level
export const POINTS_PER_FIND = 100;
export const WRONG_CLICK_PENALTY_SECONDS = 5;
export const HINTS_PER_LEVEL = 3;
