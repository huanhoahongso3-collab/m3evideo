import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
} from "remotion";
import { lyrics } from "./lyrics";
import { LyricLineComp } from "./LyricLine";
import { Background } from "./Background";
import { FaceFrame } from "./FaceFrame";
import { LyricAccentShape } from "./LyricAccentShape";
import { DecorShape } from "./DecorShape";
import { lineAccents } from "./lineAccents";
import { M3, MONET_COLORS } from "./theme";

// ─── Face photos config ──────────────────────────────────────────────────────
// Drop your photos in public/faces/ and list them here.
// Set startSec/endSec to control when each photo appears (seconds from clip start).
// Leave the array empty to skip faces for now.
const FACE_PHOTOS: Array<{
  src: string;
  position: "left" | "right" | "center";
  startSec: number;
  endSec: number;
}> = [
  // Example — uncomment and fill in when you add photos:
  // { src: staticFile("faces/photo1.png"), position: "right", startSec: 0,  endSec: 15 },
  // { src: staticFile("faces/photo2.png"), position: "left",  startSec: 15, endSec: 30 },
  // { src: staticFile("faces/photo3.png"), position: "right", startSec: 30, endSec: 45 },
];

// ─── Progress bar ─────────────────────────────────────────────────────────────
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = frame / durationInFrames;

  return (
    <div style={{
      position: "absolute",
      bottom: 24,
      left: 48,
      right: 48,
      height: 4,
      borderRadius: 999,
      background: `${M3.primaryContainer}44`,
      overflow: "hidden",
    }}>
      <div style={{
        height: "100%",
        width: `${progress * 100}%`,
        borderRadius: 999,
        background: `linear-gradient(90deg, ${M3.primary}, ${M3.tertiary})`,
        boxShadow: `0 0 12px ${M3.primary}88`,
      }} />
    </div>
  );
};

// ─── Particle sparkles ────────────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: (i * 73.1) % 100,
  y: (i * 47.3) % 100,
  size: 2 + (i % 4),
  speed: 0.5 + (i % 3) * 0.4,
  delay: (i * 11) % 60,
}));

const Sparkles: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {PARTICLES.map((p) => {
        const t = ((frame * p.speed + p.delay) % 90) / 90;
        const opacity = interpolate(t, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
        const y = p.y - t * 15;
        return (
          <div key={p.id} style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.id % 2 === 0 ? M3.primary : M3.tertiary,
            opacity: opacity * 0.6,
            boxShadow: `0 0 ${p.size * 2}px currentColor`,
          }} />
        );
      })}
    </>
  );
};

// A shape drifts to a hand-off point (instead of flying off-screen) only
// when the next line's shape in the same slot sits close enough that the
// move reads as "the same shape relocating" rather than a jump cut.
const HANDOFF_THRESHOLD = 28; // percent, combined x+y distance
function handoffTarget(ax: number, ay: number, bx?: number, by?: number) {
  if (bx === undefined || by === undefined) return undefined;
  const dist = Math.abs(ax - bx) + Math.abs(ay - by);
  return dist <= HANDOFF_THRESHOLD ? { x: bx, y: by } : undefined;
}

// ─── Main composition ────────────────────────────────────────────────────────
export const LyricVideo: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: M3.bgFlat,
        fontFamily: M3.fontFamily
      }}
    >
      <Background />
      <Sparkles />

      {/* Audio — trimmed from second 11 to 56 */}
      <Audio
        src={staticFile("sound.mp3")}
        startFrom={11 * 30}   // 11s * 30fps — skip first 11s of file
        endAt={56 * 30}       // stop at 56s of file
        volume={1}
      />

      {/* Satellite decor shapes — icon-less, keep the frame full of moving
          components during line transitions so it never reads as empty. */}
      {lyrics.map((line, i) =>
        lineAccents[i].satellites.map((sat, si) => {
          const nextSat = lineAccents[i + 1]?.satellites[si];
          const target = handoffTarget(sat.xPercent, sat.yPercent, nextSat?.xPercent, nextSat?.yPercent);
          return (
            <DecorShape
              key={`${i}-${si}`}
              line={line}
              shape={sat.shape}
              color={MONET_COLORS[sat.monetIndex]}
              size={sat.size}
              xPercent={sat.xPercent}
              yPercent={sat.yPercent}
              delayFrames={sat.delayFrames}
              exitTargetXPercent={target?.x}
              exitTargetYPercent={target?.y}
            />
          );
        })
      )}

      {/* Foreground hero shapes + themed icon, one per lyric line */}
      {lyrics.map((line, i) => {
        const next = lineAccents[i + 1];
        const target = handoffTarget(
          lineAccents[i].shapeXPercent, lineAccents[i].shapeYPercent,
          next?.shapeXPercent, next?.shapeYPercent
        );
        return (
          <LyricAccentShape
            key={i}
            line={line}
            accent={lineAccents[i]}
            exitTargetXPercent={target?.x}
            exitTargetYPercent={target?.y}
          />
        );
      })}

      {/* Lyric lines */}
      {lyrics.map((line, i) => (
        <LyricLineComp key={i} line={line} index={i} accent={lineAccents[i]} />
      ))}

      {/* Face photos */}
      {FACE_PHOTOS.map((f, i) => (
        <FaceFrame
          key={i}
          src={f.src}
          position={f.position}
          startFrame={Math.round(f.startSec * fps)}
          endFrame={Math.round(f.endSec * fps)}
        />
      ))}

      <ProgressBar />
    </AbsoluteFill>
  );
};
