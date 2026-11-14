import React from "react";
import { Img, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { SPATIAL_FAST, EFFECTS } from "./motion";

interface Props {
  src: string;
  position?: "left" | "right" | "center";
  size?: number;
  startFrame?: number;
  endFrame?: number;
}

const SPRING_ENTER = SPATIAL_FAST; // snappier/bouncier than the default spring — more dynamic
const SPRING_EXIT   = EFFECTS;      // clean, no overshoot

// No ring, no border, no circular clip — just the transparent cutout photo
// itself, flying in from off-frame and flying back out, per user request
// ("no border, transparent and fly smoothly out and in").
export const FaceFrame: React.FC<Props> = ({
  src,
  position = "right",
  size = 480, // 2x bigger, per user request
  startFrame = 0,
  endFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const end = endFrame ?? durationInFrames;
  const fpsScale = fps / 30; // keep frame-count timings in real seconds regardless of fps
  const exitLead = Math.round(14 * fpsScale); // frames before `end` the exit animation begins

  const visible = frame >= startFrame && frame <= end + exitLead;
  if (!visible) return null;

  const enterProgress = spring({
    frame: frame - startFrame,
    fps,
    config: SPRING_ENTER,
  });

  const exitProgress = spring({
    frame: frame - (end - exitLead),
    fps,
    config: SPRING_EXIT,
    durationInFrames: exitLead,
  });

  const positionMap = {
    left:   { left: 72, right: "auto" },
    right:  { left: "auto", right: 72 },
    center: { left: "50%", right: "auto", transform: "translateX(-50%)" },
  };
  const posStyle = positionMap[position];

  // Fly direction: enters from well off-frame on its side, exits even
  // further off that same edge — bigger travel distance + overshoot spring
  // (SPATIAL_FAST) + rotation + an arcing dip, so it reads as a confident
  // swoop rather than a gentle slide. "much better, bigger x2, more dynamic".
  const dir = position === "left" ? -1 : position === "right" ? 1 : 0;
  const enterTranslateX = interpolate(enterProgress, [0, 1], [dir * 520, 0]);
  const exitTranslateX  = interpolate(exitProgress, [0, 1], [0, dir * 820]);
  const slideX = exitProgress > 0 ? exitTranslateX : enterTranslateX;

  // Arc dip: swoops up mid-flight on the way in, down on the way out —
  // adds a curved trajectory instead of a flat straight line.
  const enterArcY = -Math.sin(Math.min(enterProgress, 1) * Math.PI) * 90;
  const exitArcY = Math.sin(Math.min(exitProgress, 1) * Math.PI) * 70;
  const arcY = exitProgress > 0 ? exitArcY : enterArcY;

  // Rotation during flight, settling flat once arrived.
  const enterRotation = interpolate(enterProgress, [0, 1], [dir * -22, 0]);
  const exitRotation = interpolate(exitProgress, [0, 1], [0, dir * 28]);
  const rotation = exitProgress > 0 ? exitRotation : enterRotation;

  // Overshoot bounce on scale (SPATIAL_FAST already overshoots past 1
  // slightly on its own, but we clamp the far end so it doesn't balloon).
  const enterScale = interpolate(enterProgress, [0, 1.15], [0.5, 1.08], { extrapolateRight: "clamp" });
  const scale = exitProgress > 0 ? 1 : enterScale; // no shrink on exit — reads as motion, not dissolving

  const enterOpacity = interpolate(enterProgress, [0, 0.35, 1], [0, 1, 1], { extrapolateRight: "clamp" });
  const exitOpacity  = interpolate(exitProgress, [0, 1], [1, 0]);
  const opacity = Math.min(enterOpacity, exitOpacity);

  // Gentle float — frame-driven (deterministic for render), not wall-clock CSS
  const floatY = Math.sin(frame * 0.04 / fpsScale) * 14;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        ...posStyle,
        opacity,
        transform: `${posStyle.transform ?? ""} translateX(${slideX}px) translateY(${arcY + floatY}px) rotate(${rotation}deg) scale(${scale})`,
        zIndex: 10,
      }}
    >
      <div style={{ width: size, height: size, position: "relative" }}>
        <Img
          src={src}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
    </div>
  );
};
