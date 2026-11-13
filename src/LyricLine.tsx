import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { M3 } from "./theme";
import { SPATIAL_FAST, SPATIAL_SLOW, EFFECTS } from "./motion";
import type { LyricLine as LyricLineType } from "./lyrics";
import type { LineAccent } from "./lineAccents";

interface Props {
  line: LyricLineType;
  index: number;
  accent: LineAccent;
}

export const LyricLineComp: React.FC<Props> = ({ line, index, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const startFrame = line.start * fps;
  const endFrame   = line.end   * fps;

  const leadIn  = 14;
  const fadeOut = 16;
  const visible = frame >= startFrame - leadIn && frame <= endFrame + fadeOut;
  if (!visible) return null;

  const words = line.text.split(" ");
  const isHumLine = line.text.startsWith("(");

  // Container entrance — bouncy spatial spring (M3 Expressive)
  const containerSpring = spring({
    frame: frame - (startFrame - leadIn),
    fps,
    config: SPATIAL_FAST,
  });

  // Exit — clean effects spring, no bounce
  const exitProgress = spring({
    frame: frame - (endFrame - 2),
    fps,
    config: EFFECTS,
    durationInFrames: fadeOut,
  });
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);
  const exitScale   = interpolate(exitProgress, [0, 1], [1, 0.94]);
  const exitBlur    = interpolate(exitProgress, [0, 1], [0, 10]);
  const exitLiftY   = interpolate(exitProgress, [0, 1], [0, -22]);

  const enterOpacity = interpolate(containerSpring, [0, 0.4, 1], [0, 1, 1], {
    extrapolateRight: "clamp",
  });
  const enterTranslateY = interpolate(containerSpring, [0, 1], [46, 0]);
  const enterScale = interpolate(containerSpring, [0, 1], [0.82, 1]);
  const enterBlur = interpolate(containerSpring, [0, 0.6, 1], [8, 0, 0], {
    extrapolateRight: "clamp",
  });

  const opacity = Math.min(enterOpacity, exitOpacity);
  const scale   = exitProgress > 0 ? exitScale : enterScale;
  const blur    = Math.max(enterBlur, exitBlur);
  const translateY = exitProgress > 0 ? exitLiftY : enterTranslateY;

  const textColor = isHumLine ? M3.lyricTextColorHum : M3.lyricTextColor;
  const glowColor = isHumLine ? M3.tertiary : M3.primary;

  // A flat 156px for every line (1.5× the short-line size) overflowed the
  // frame top/bottom on longer lines once wrapped — confirmed by the user's
  // screenshots. Back to tiering by word count, but every tier scaled ×1.5
  // from the pre-flatten baseline, so the short "Ôi, hạnh phúc..." line
  // still lands at exactly 156px (its original 104 × 1.5) while longer
  // lines shrink just enough to keep their wrapped block on-frame.
  const wordCount = words.length;
  const fontSize = isHumLine ? M3.titleLarge
    : wordCount <= 3 ? 156
    : wordCount <= 5 ? 141
    : wordCount <= 7 ? 108
    : 81;

  const anchorTranslateX = accent.textAlign === "center" ? "-50%"
    : accent.textAlign === "left" ? "0%"
    : "-100%";
  // Spans nearly the full app width ("trải dài quanh app"), but clamped to
  // the anchor's own side so a left/right-anchored box can't run its far
  // edge off the frame and get clipped.
  const boxWidth = accent.textAlign === "center" ? "94%"
    : accent.textAlign === "left" ? `${Math.min(94, 98 - accent.textXPercent)}%`
    : `${Math.min(94, accent.textXPercent - 2)}%`;

  // Crisp flat shadow (not a soft glow blob) so the bare text stays legible
  // over the moving background — matches the hard-edged M3 Expressive look
  // instead of the blurry neon-sign effect the glow version had.
  const textShadow = [
    `0 0 2px ${glowColor}99`,
    `0 2px 0 rgba(0,0,0,0.55)`,
    `0 4px 10px rgba(0,0,0,0.5)`,
  ].join(", ");

  return (
    <div
      style={{
        position: "absolute",
        left: `${accent.textXPercent}%`,
        top: `${accent.textYPercent}%`,
        transform: `translate(${anchorTranslateX}, calc(-50% + ${translateY}px)) scale(${scale})`,
        opacity,
        filter: `blur(${blur}px)`,
        textAlign: accent.textAlign,
        width: boxWidth,
        pointerEvents: "none",
      }}
    >
      <span
        style={{
          fontFamily: M3.fontFamily,
          fontSize,
          fontWeight: isHumLine ? 400 : 700,
          color: textColor,
          textShadow,
          letterSpacing: isHumLine ? 4 : -1.5, // tighter horizontal tracking per user request
          lineHeight: 1.22,
          fontStyle: isHumLine ? "italic" : "normal",
          display: "inline-flex",
          flexWrap: "wrap",
          justifyContent: accent.textAlign === "center" ? "center" : accent.textAlign === "left" ? "flex-start" : "flex-end",
          gap: "0 0.22em",
        }}
      >
        {(() => {
          let charCounter = 0; // running index across the whole line, for a continuous wave phase
          return words.map((word, wi) => {
            const wordDelay = wi * 2.2;
            const wordSpring = spring({
              frame: frame - (startFrame - leadIn) - wordDelay,
              fps,
              config: SPATIAL_SLOW,
            });
            const wordOpacity = interpolate(wordSpring, [0, 1], [0, 1], {
              extrapolateRight: "clamp",
              extrapolateLeft: "clamp",
            });
            const wordY = interpolate(wordSpring, [0, 1], [18, 0], {
              extrapolateRight: "clamp",
            });
            const wordScale = interpolate(wordSpring, [0, 1], [0.7, 1], {
              extrapolateRight: "clamp",
            });

            return (
              <span
                key={wi}
                style={{
                  display: "inline-block",
                  opacity: exitProgress > 0 ? 1 : wordOpacity,
                  transform: exitProgress > 0
                    ? "none"
                    : `translateY(${wordY}px) scale(${wordScale})`,
                }}
              >
                {/* Per-character wave — a continuous, gentle sine offset on
                    top of the word's own entrance, so settled text still
                    reads as "alive" instead of standing dead-still (the
                    bouncy/liquid baseline look from Google's own M3
                    Expressive reference videos), not a one-time animation. */}
                {word.split("").map((ch, ci) => {
                  const globalIndex = charCounter++;
                  const waveY = isHumLine ? 0 : Math.sin(frame * 0.12 + globalIndex * 0.6) * 4;
                  return (
                    <span key={ci} style={{ display: "inline-block", transform: `translateY(${waveY}px)` }}>
                      {ch}
                    </span>
                  );
                })}
              </span>
            );
          });
        })()}
      </span>
    </div>
  );
};
