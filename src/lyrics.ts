export type LyricLine = { start: number; end: number; text: string };

// Timestamps are relative to audio trim start (second 11 of the original
// file), hand-tuned against playback. Each line's `end` is kept slightly
// before the next line's `start` (0.1s gap) so two lines never render at
// once — the crossfade look comes from the lead-in/fade-out animation
// inside LyricLine.tsx, not from overlapping timestamps.
export const lyrics: LyricLine[] = [
  { start: 1,     end: 6.9,  text: "Một ngày thật đáng nhớ, là ngày được bên em" },
  { start: 7,     end: 12.9, text: "Ngày được nắm đôi bàn tay nhỏ bé tiến vào lễ đường" },
  { start: 13,    end: 19.45, text: "Từ ngày mai cả hai sẽ trở thành một mà thôi" },
  { start: 19.55, end: 23.45, text: "Ôi, hạnh phúc như vô bờ" },
  { start: 23.55, end: 29.08, text: "Mình chịu khó nhường nhau một chút, đong đầy thêm từng phút" },
  { start: 29.18, end: 34.45, text: "Rót vào tai lời yêu như vị ngọt nắng mai" },
  { start: 34.55, end: 40.45, text: "Ngày hôm qua sẽ chẳng giống hôm nay, yêu em hơn mỗi ngày" },
  { start: 40.55, end: 45,    text: "Dẫu trên đầu nhiều tóc mây" },
];
