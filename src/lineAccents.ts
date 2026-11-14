import { ShapeName } from "./shapes";
import { IconName } from "./icons";

export type Satellite = {
  shape: ShapeName; // single fixed shape — no morph, only rotates (see DecorShape.tsx)
  size: number;
  xPercent: number;
  yPercent: number;
  monetIndex: number; // index into MONET_COLORS
  delayFrames?: number;
};

export type LineAccent = {
  icon: IconName;
  shapeSequence: ShapeName[];
  shapeColor: "primary" | "secondary" | "tertiary";
  shapeXPercent: number;
  shapeYPercent: number;
  textXPercent: number;
  textYPercent: number;
  textAlign: "left" | "center" | "right";
  satellites: Satellite[];
};

// Hand-placed per lyric line (1:1 index match with lyrics.ts). The one
// icon-bearing hero shape still morphs through its sequence; satellites are
// simpler single fixed shapes (no morph, just rotation) scattered around
// more of the screen edges, well clear of the text zone, so the frame feels
// populated without competing with the hero shape's animation.
export const lineAccents: LineAccent[] = [
  // "Một ngày thật đáng nhớ, là ngày được bên em" — text center, y26
  {
    icon: "favorite",
    shapeSequence: ["circle", "cookie9", "flower", "cookie6", "gem"],
    shapeColor: "primary",
    shapeXPercent: 80, shapeYPercent: 9,
    textXPercent: 50, textYPercent: 34,
    textAlign: "center",
    satellites: [
      { shape: "flower",   size: 840, xPercent: 8,  yPercent: 88, monetIndex: 3 },
      { shape: "cookie6",  size: 580, xPercent: 113, yPercent: 78, monetIndex: 4, delayFrames: 5 },
      { shape: "oval",     size: 580, xPercent: 55, yPercent: 96, monetIndex: 1, delayFrames: 8 },
      { shape: "gem",      size: 520, xPercent: 6,  yPercent: -6, monetIndex: 2, delayFrames: 3 },
      { shape: "cookie7",  size: 500, xPercent: 42, yPercent: 1,  monetIndex: 0, delayFrames: 11 },
    ],
  },
  // "Ngày được nắm đôi bàn tay nhỏ bé tiến vào lễ đường" — text left, y38
  {
    icon: "front_hand",
    shapeSequence: ["clover4", "cookie9", "cookie7", "oval", "clover4"],
    shapeColor: "secondary",
    shapeXPercent: 15, shapeYPercent: 55,
    textXPercent: 32, textYPercent: 38,
    textAlign: "left",
    satellites: [
      { shape: "cookie12", size: 900, xPercent: 98, yPercent: -18, monetIndex: 0 },
      { shape: "cookie12", size: 580, xPercent: 88, yPercent: 86, monetIndex: 5, delayFrames: 6 },
      { shape: "cookie12", size: 580, xPercent: 6,  yPercent: 99, monetIndex: 2, delayFrames: 9 },
      { shape: "flower",   size: 520, xPercent: 6,  yPercent: 8,  monetIndex: 4, delayFrames: 4 },
      { shape: "oval",     size: 500, xPercent: 50, yPercent: 74, monetIndex: 1, delayFrames: 12 },
    ],
  },
  // "Từ ngày mai cả hai sẽ trở thành một mà thôi" — text right, y30
  {
    icon: "link",
    shapeSequence: ["cookie4", "cookie6", "gem", "flower", "cookie4"],
    shapeColor: "tertiary",
    shapeXPercent: 85, shapeYPercent: 48,
    textXPercent: 66, textYPercent: 36,
    textAlign: "right",
    satellites: [
      { shape: "clover4",  size: 810, xPercent: 8,  yPercent: 96, monetIndex: 1 },
      { shape: "gem",      size: 580, xPercent: 95, yPercent: 99, monetIndex: 0, delayFrames: 5 },
      { shape: "oval",     size: 580, xPercent: 78, yPercent: 3, monetIndex: 4, delayFrames: 8 },
      { shape: "cookie6",  size: 500, xPercent: 6,  yPercent: -2,  monetIndex: 2, delayFrames: 3 },
      { shape: "softBurst",size: 500, xPercent: 45, yPercent: -2,  monetIndex: 5, delayFrames: 11 },
    ],
  },
  // "Ôi, hạnh phúc như vô bờ" — text dead center, y50 (hero moment)
  {
    icon: "sentiment_very_satisfied",
    shapeSequence: ["cookie12", "softBurst", "flower", "clover4", "cookie12"],
    shapeColor: "primary",
    shapeXPercent: 50, shapeYPercent: 12,
    textXPercent: 50, textYPercent: 38,
    textAlign: "center",
    satellites: [
      { shape: "gem",      size: 870, xPercent: 88, yPercent: 106, monetIndex: 3 },
      { shape: "softBurst",size: 580, xPercent: 12, yPercent: 123, monetIndex: 5, delayFrames: 5 },
      { shape: "cookie7",  size: 580, xPercent: 10, yPercent: 0, monetIndex: 1, delayFrames: 9 },
    ],
  },
  // "Mình chịu khó nhường nhau một chút, đong đầy thêm từng phút" — text left, y62
  {
    icon: "hourglass_top",
    shapeSequence: ["cookie9", "clover4", "cookie7", "softBurst", "cookie9"],
    shapeColor: "secondary",
    shapeXPercent: 14, shapeYPercent: 40,
    textXPercent: 30, textYPercent: 62,
    textAlign: "left",
    satellites: [
      { shape: "cookie12", size: 840, xPercent: 91, yPercent: 9, monetIndex: 2 },
      { shape: "flower",   size: 580, xPercent: 92, yPercent: 107, monetIndex: 0, delayFrames: 6 },
      { shape: "clover8",  size: 580, xPercent: 49, yPercent: 6,  monetIndex: 4, delayFrames: 9 },
    ],
  },
  // "Rót vào tai lời yêu như vị ngọt nắng mai" — text center, y72
  {
    icon: "wb_sunny",
    shapeSequence: ["cookie12", "softBurst", "cookie12", "clover8", "cookie9"],
    shapeColor: "tertiary",
    shapeXPercent: 25, shapeYPercent: 60,
    textXPercent: 50, textYPercent: 38,
    textAlign: "center",
    satellites: [
      { shape: "clover8",  size: 810, xPercent: 12, yPercent: -15, monetIndex: 1 },
      { shape: "gem",      size: 580, xPercent: 95, yPercent: -5, monetIndex: 5, delayFrames: 5 },
      { shape: "cookie7",  size: 580, xPercent: 10, yPercent: 103, monetIndex: 2, delayFrames: 8 },
    ],
  },
  // "Ngày hôm qua sẽ chẳng giống hôm nay, yêu em hơn mỗi ngày" — text right, y36
  {
    icon: "trending_up",
    shapeSequence: ["circle", "cookie4", "gem", "cookie7", "circle"],
    shapeColor: "primary",
    shapeXPercent: 88, shapeYPercent: 22,
    textXPercent: 64, textYPercent: 36,
    textAlign: "right",
    satellites: [
      { shape: "cookie12", size: 840, xPercent: 14, yPercent: 89, monetIndex: 3 },
      { shape: "cookie9",  size: 580, xPercent: 10, yPercent: -5, monetIndex: 2, delayFrames: 5 },
      { shape: "oval",     size: 580, xPercent: 75, yPercent: 90, monetIndex: 4, delayFrames: 8 },
    ],
  },
  // "Dẫu trên đầu nhiều tóc mây" — text center, y55
  {
    icon: "cloud",
    shapeSequence: ["clover4", "softBurst", "flower", "clover8", "clover4"],
    shapeColor: "secondary",
    shapeXPercent: 40, shapeYPercent: 81,
    textXPercent: 50, textYPercent: 36,
    textAlign: "center",
    satellites: [
      { shape: "cookie6",  size: 840, xPercent: 88, yPercent: -15, monetIndex: 4 },
      { shape: "gem",      size: 580, xPercent: 90, yPercent: 100, monetIndex: 0, delayFrames: 6 },
      { shape: "cookie9",  size: 580, xPercent: -9,  yPercent: 116, monetIndex: 5, delayFrames: 9 },
    ],
  },
];
