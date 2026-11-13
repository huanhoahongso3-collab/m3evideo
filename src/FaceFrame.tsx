import React from "react";
import { Img, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { M3 } from "./theme";
import { SPATIAL_DEFAULT, EFFECTS } from "./motion";

interface Props {
  src: string;
  position?: "left" | "right" | "center";
  size?: number;
  startFrame?: number;
  endFrame?: number;
}

const SPRING_ENTER = SPATIAL_DEFAULT; // bouncy settle, M3 Expressive spatial spring
const SPRING_EXIT   = EFFECTS;         // clean, no overshoot

export const FaceFrame: React.FC<Props> = ({
  src,
  position = "right",
  size = 240,
  startFrame = 0,
  endFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const end = endFrame ?? durationInFrames;
  const exitLead = 14; // frames before `end` the exit animation begins

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

  const enterScale = interpolate(enterProgress, [0, 1], [0.6, 1]);
  const exitScale  = interpolate(exitProgress, [0, 1], [1, 0.7]);
  const scale = exitProgress > 0 ? exitScale : enterScale;

  const enterOpacity = enterProgress;
  const exitOpacity  = interpolate(exitProgress, [0, 1], [1, 0]);
  const opacity = Math.min(enterOpacity, exitOpacity);

  // Gentle float — frame-driven (deterministic for render), not wall-clock CSS
  const floatY = Math.sin(frame * 0.04) * 8;

  // Ring rotation — frame-driven instead of CSS @keyframes
  const ringRotation = (frame * 1.5) % 360;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        ...posStyle,
        opacity,
        transform: `${posStyle.transform ?? ""} scale(${scale}) translateY(${floatY}px)`,
        zIndex: 10,
      }}
    >
      {/* Glow ring — rotation driven by frame number, deterministic across renders */}
      <div
        style={{
          position: "absolute",
          inset: -12,
          borderRadius: "50%",
          background: `conic-gradient(from ${ringRotation}deg, ${M3.primary}, ${M3.tertiary}, ${M3.secondary}, ${M3.primary})`,
          filter: "blur(8px)",
          opacity: 0.7,
        }}
      />
      {/* M3 shape container */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          overflow: "hidden",
          border: `3px solid ${M3.primaryContainer}`,
          position: "relative",
          boxShadow: `0 8px 40px ${M3.primary}66, 0 0 0 4px ${M3.primaryContainer}88`,
        }}
      >
        <Img
          src={src}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </div>
  );
};
