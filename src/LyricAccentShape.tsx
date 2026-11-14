import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { generatePoints, morphPoints, toSmoothPath } from "./shapes";
import { SPATIAL_DEFAULT, SPATIAL_FAST, EFFECTS } from "./motion";
import { ICON_PATHS, ICON_VIEWBOX } from "./icons";
import { M3 } from "./theme";
import type { LyricLine } from "./lyrics";
import type { LineAccent } from "./lineAccents";

interface Props {
  line: LyricLine;
  accent: LineAccent;
  exitTargetXPercent?: number;
  exitTargetYPercent?: number;
}

const SIZE = 280; // bigger per user request ("cho các shape to ra")
const SHAPE_CYCLE_SEC = 1.2; // faster morph cadence — "linh hoạt" per user request

// A foreground "hero" shape + themed icon, one per lyric line — sharper and
// more opaque than the ambient Background blobs, so it reads as a deliberate
// accent rather than lighting. Mounts/unmounts with its own line's window
// (like LyricLineComp), each at a different hand-placed screen position, so
// the accent appears to jump to a new spot in sync with the lyric changing.
export const LyricAccentShape: React.FC<Props> = ({ line, accent, exitTargetXPercent, exitTargetYPercent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const startFrame = line.start * fps;
  const endFrame = line.end * fps;
  const fpsScale = fps / 30; // keep frame-count timings in real seconds regardless of fps
  const leadIn = Math.round(14 * fpsScale);
  const fadeOut = Math.round(16 * fpsScale);

  const visible = frame >= startFrame - leadIn && frame <= endFrame + fadeOut;
  if (!visible) return null;

  // Entrance/exit — fast spatial spring for a snappier pop-in.
  const enterSpring = spring({
    frame: frame - (startFrame - leadIn),
    fps,
    config: SPATIAL_FAST,
  });
  const exitSpring = spring({
    frame: frame - (endFrame - 2),
    fps,
    config: EFFECTS,
    durationInFrames: fadeOut,
  });

  // No opacity fade, no shrink on exit — purely positional (fly off / drift
  // to hand-off point) at full size, per user request. The AbsoluteFill
  // clips it once it's off-frame; shrinking would read as "dissolving".
  const enterScale = interpolate(enterSpring, [0, 1], [0.5, 1]);
  const scale = exitSpring > 0 ? 1 : enterScale;

  // Continuous idle drift while fully on-screen — slow circular wander, on
  // top of the existing breathing pulse, so the shape never sits dead
  // still ("shape phải có sự di chuyển").
  const idleDriftX = Math.sin(frame * 0.013 / fpsScale + accent.shapeXPercent) * 16;
  const idleDriftY = Math.cos(frame * 0.011 / fpsScale + accent.shapeYPercent) * 16;
  const settleAmount = Math.min(enterSpring, 1);

  const hasHandoff = exitTargetXPercent !== undefined && exitTargetYPercent !== undefined;

  // Slide + motion-blur transition, like the "shape whooshes through frame"
  // exits in Google's own M3 Expressive reference videos. Direction is
  // whichever edge the shape already lives near, so it reads as "arriving
  // from" and later "leaving toward" the same side — unless the next line's
  // shape sits nearby, in which case it drifts straight to that spot
  // instead (reads as one shape handing off to the next, not two separate
  // pop-in/pop-out shapes).
  const dir = accent.shapeXPercent < 50 ? -1 : 1;
  const enterTranslateX = interpolate(enterSpring, [0, 1], [dir * 260, 0]);
  const exitTranslateX = hasHandoff
    ? interpolate(exitSpring, [0, 1], [0, (exitTargetXPercent! - accent.shapeXPercent) * 19.2])
    : interpolate(exitSpring, [0, 1], [0, dir * 1400]);
  const exitTranslateY = hasHandoff
    ? interpolate(exitSpring, [0, 1], [0, (exitTargetYPercent! - accent.shapeYPercent) * 10.8])
    : 0;
  const slideTranslateX = exitSpring > 0 ? exitTranslateX : enterTranslateX + idleDriftX * settleAmount;
  const slideTranslateY = exitSpring > 0 ? exitTranslateY : idleDriftY * settleAmount;
  const enterMotionBlur = interpolate(enterSpring, [0, 0.35], [16, 0], { extrapolateRight: "clamp" });
  const exitMotionBlur = hasHandoff ? 0 : interpolate(exitSpring, [0, 1], [0, 16]);
  const motionBlur = exitSpring > 0 ? exitMotionBlur : enterMotionBlur;

  // Shape morph, local to this line's own lifetime (not the global clock),
  // so every line's accent starts its morph cycle fresh.
  const localFrame = Math.max(0, frame - startFrame);
  const cycleFrames = SHAPE_CYCLE_SEC * fps;
  const segIndex = Math.floor(localFrame / cycleFrames) % accent.shapeSequence.length;
  const nextIndex = (segIndex + 1) % accent.shapeSequence.length;
  const segStart = Math.floor(localFrame / cycleFrames) * cycleFrames;

  const morphSpring = spring({
    frame: localFrame - segStart,
    fps,
    config: SPATIAL_FAST, // snappier morph transition between shapes
    durationInFrames: cycleFrames,
  });
  const morphT = Math.min(interpolate(morphSpring, [0, 1.15], [0, 1.15]), 1.15);

  const pointsA = generatePoints(accent.shapeSequence[segIndex]);
  const pointsB = generatePoints(accent.shapeSequence[nextIndex]);
  const morphed = morphPoints(pointsA, pointsB, morphT);
  const path = toSmoothPath(morphed, 0, 0, 1);

  const rotation = localFrame * 0.18 / fpsScale; // energetic but not dizzying
  // Continuous zoom pulse (grows/shrinks while the accent is on screen) —
  // gentle amplitude/frequency so it reads as smooth breathing, not a jitter.
  const pulseScale = 1 + Math.sin(localFrame * 0.08 / fpsScale) * 0.09;
  const color = M3[accent.shapeColor];

  // Icon springs in slightly after the shape, same stagger logic as the
  // word-by-word lyric reveal, with its own faster independent pulse so it
  // doesn't move in lockstep with the shape underneath it.
  const iconSpring = spring({
    frame: frame - (startFrame - leadIn) - 4 * fpsScale,
    fps,
    config: SPATIAL_FAST,
  });
  const iconOpacity = interpolate(iconSpring, [0, 1], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const iconEnterScale = interpolate(iconSpring, [0, 1], [0.3, 1], { extrapolateRight: "clamp" });
  const iconPulse = 1 + Math.sin(localFrame * 0.1 / fpsScale + 1.3) * 0.07;
  const iconScale = iconEnterScale * iconPulse;

  return (
    <div
      style={{
        position: "absolute",
        left: `${accent.shapeXPercent}%`,
        top: `${accent.shapeYPercent}%`,
        width: SIZE,
        height: SIZE,
        transform: `translate(calc(-50% + ${slideTranslateX}px), calc(-50% + ${slideTranslateY}px)) scale(${scale * pulseScale}) rotate(${rotation}deg)`,
        // Flat elevation shadow + motion blur that ramps with the slide
        // speed — crisp when settled, blurred mid-whoosh, like real M3
        // Expressive scene transitions, not a soft ambient glow.
        filter: `drop-shadow(0 6px 14px rgba(0,0,0,0.35)) blur(${motionBlur}px)`,
      }}
    >
      {/* Flat solid fill — no gradient falloff, matches the crisp flat-color
          style of the actual M3 Expressive shape library (single hue, hard
          edge), not a soft glowing blob. */}
      <svg viewBox="-1.3 -1.3 2.6 2.6" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <path d={path} fill={color} />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: iconOpacity,
          transform: `scale(${iconScale})`,
        }}
      >
        <svg viewBox={ICON_VIEWBOX} width={SIZE * 0.42} height={SIZE * 0.42}>
          <path d={ICON_PATHS[accent.icon]} fill={M3.onPrimary} />
        </svg>
      </div>
    </div>
  );
};
