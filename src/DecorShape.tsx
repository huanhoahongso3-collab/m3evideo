import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { generatePoints, toSmoothPath, ShapeName } from "./shapes";
import { SPATIAL_FAST, EFFECTS } from "./motion";
import type { LyricLine } from "./lyrics";

interface Props {
  line: LyricLine;
  shape: ShapeName; // single fixed shape — no morphing for satellites per user request
  color: string;
  size: number;
  xPercent: number;
  yPercent: number;
  delayFrames?: number; // stagger so satellites don't all pop in at once
  // When the next line has a shape sitting near this one's spot, drift
  // toward it instead of flying off-screen — reads as one shape "handing
  // off" to the next rather than two unrelated pop-in/pop-out shapes.
  exitTargetXPercent?: number;
  exitTargetYPercent?: number;
}

// A small, icon-less flat shape that rides alongside a LyricAccentShape —
// exists purely to keep the frame full of moving components during line
// transitions ("đỡ trống"), never carrying text or an icon of its own.
// Per user request it does NOT morph between shapes like the hero shape —
// it's one fixed silhouette that only rotates.
export const DecorShape: React.FC<Props> = ({
  line, shape, color, size, xPercent, yPercent, delayFrames = 0,
  exitTargetXPercent, exitTargetYPercent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const startFrame = line.start * fps + delayFrames;
  const endFrame = line.end * fps;
  const leadIn = 10;
  const fadeOut = 14;

  const visible = frame >= startFrame - leadIn && frame <= endFrame + fadeOut;
  if (!visible) return null;

  const enterSpring = spring({ frame: frame - (startFrame - leadIn), fps, config: SPATIAL_FAST });
  const exitSpring = spring({ frame: frame - (endFrame - 2), fps, config: EFFECTS, durationInFrames: fadeOut });

  // No opacity fade, no shrink — shapes appear/disappear purely by flying
  // in/out of frame (or drifting to a hand-off point) at FULL size, per
  // user request ("vẫn bị fade out... move out ko chỉ có move in"). A
  // shrinking shape reads as "dissolving"; keeping size constant while it
  // translates reads unambiguously as motion.
  const scale = exitSpring > 0 ? 1 : interpolate(enterSpring, [0, 1], [0.4, 1]);

  // Continuous idle drift while fully on-screen (between the enter and
  // exit windows) — a slow circular wander, so the shape is never truly
  // static, per user request ("shape phải có sự di chuyển").
  const idleDriftX = Math.sin(frame * 0.015 + xPercent) * 14;
  const idleDriftY = Math.cos(frame * 0.012 + yPercent) * 14;

  const hasHandoff = exitTargetXPercent !== undefined && exitTargetYPercent !== undefined;

  // Entrance: fly in from off-frame on whichever side this shape lives near.
  const dir = xPercent < 50 ? -1 : 1;
  const enterTranslateX = interpolate(enterSpring, [0, 1], [dir * 320, 0]);
  const enterTranslateY = 0;

  // Exit: if the next line has a shape sitting near here, drift toward that
  // exact spot (reads as one shape handing off/morphing into the next);
  // otherwise fly far off whichever edge is closest, fully clearing frame.
  const exitTranslateX = hasHandoff
    ? interpolate(exitSpring, [0, 1], [0, (exitTargetXPercent! - xPercent) * 19.2]) // %→px at 1920 width
    : interpolate(exitSpring, [0, 1], [0, dir * 1400]);
  const exitTranslateY = hasHandoff
    ? interpolate(exitSpring, [0, 1], [0, (exitTargetYPercent! - yPercent) * 10.8]) // %→px at 1080 height
    : 0;

  // Idle drift only applies once the entrance has settled and before the
  // exit motion takes over, so it doesn't fight either transition.
  const settleAmount = Math.min(enterSpring, 1);
  const slideTranslateX = exitSpring > 0 ? exitTranslateX : enterTranslateX + idleDriftX * settleAmount;
  const slideTranslateY = exitSpring > 0 ? exitTranslateY : enterTranslateY + idleDriftY * settleAmount;

  // Motion blur only while actually moving fast (entrance whoosh, or the
  // non-handoff fly-out) — a handoff drift is slower/closer, so it stays
  // crisp, reading as a deliberate move rather than a blur-and-vanish.
  const enterMotionBlur = interpolate(enterSpring, [0, 0.35], [16, 0], { extrapolateRight: "clamp" });
  const exitMotionBlur = hasHandoff ? 0 : interpolate(exitSpring, [0, 1], [0, 16]);
  const motionBlur = exitSpring > 0 ? exitMotionBlur : enterMotionBlur;

  const localFrame = Math.max(0, frame - startFrame);
  const path = toSmoothPath(generatePoints(shape), 0, 0, 1);

  // Only rotation — no morph, no pulse — per user request ("shape không
  // morph cho shape phụ chỉ có xoay quanh thôi").
  const rotation = localFrame * 0.14;

  return (
    <div
      style={{
        position: "absolute",
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        width: size,
        height: size,
        transform: `translate(calc(-50% + ${slideTranslateX}px), calc(-50% + ${slideTranslateY}px)) scale(${scale}) rotate(${rotation}deg)`,
        // Transient only — blurred mid-whoosh, perfectly crisp once settled.
        filter: `blur(${motionBlur}px)`,
      }}
    >
      <svg viewBox="-1.3 -1.3 2.6 2.6" width="100%" height="100%">
        {/* Solid, crisp fill — no transparency, per user request. */}
        <path d={path} fill={color} />
      </svg>
    </div>
  );
};
