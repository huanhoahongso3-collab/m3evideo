import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { generatePoints, morphPoints, toSmoothPath, ShapeName } from "./shapes";
import { SPATIAL_SLOW } from "./motion";

interface Props {
  shapeSequence: ShapeName[];
  durationPerShapeSec: number;
  size: number;          // px, before blur
  color: string;          // base hex color, gradient is derived from it
  blurPx: number;
  xPercent: number;
  yPercent: number;
  rotationDegPerFrame?: number;
  driftAmplitude?: number; // px of slow positional wobble
  driftSpeed?: number;     // radians/frame
  opacity?: number;
  flat?: boolean; // solid fill, no radial falloff — for crisp foreground accents
}

export const MorphShape: React.FC<Props> = ({
  shapeSequence,
  durationPerShapeSec,
  size,
  color,
  blurPx,
  xPercent,
  yPercent,
  rotationDegPerFrame = 0.05,
  driftAmplitude = 18,
  driftSpeed = 0.012,
  opacity = 1,
  flat = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const segFrames = durationPerShapeSec * fps;
  const segIndex = Math.floor(frame / segFrames) % shapeSequence.length;
  const nextIndex = (segIndex + 1) % shapeSequence.length;
  const segStartFrame = Math.floor(frame / segFrames) * segFrames;

  // Spatial spring drives the morph itself, so each shape transition has
  // the same gentle overshoot M3 Expressive uses for shape/size changes.
  const rawProgress = spring({
    frame: frame - segStartFrame,
    fps,
    config: SPATIAL_SLOW,
    durationInFrames: segFrames,
  });
  const progress = interpolate(rawProgress, [0, 1.15], [0, 1.15], {
    extrapolateLeft: "clamp",
  });

  const pointsA = generatePoints(shapeSequence[segIndex]);
  const pointsB = generatePoints(shapeSequence[nextIndex]);
  const morphed = morphPoints(pointsA, pointsB, Math.min(progress, 1.15));

  const rotation = frame * rotationDegPerFrame;
  const driftX = Math.sin(frame * driftSpeed) * driftAmplitude;
  const driftY = Math.cos(frame * driftSpeed * 0.8) * driftAmplitude;

  const viewBoxHalf = 1.3; // room for the ~1.15 overshoot
  const path = toSmoothPath(morphed, 0, 0, 1);
  const gradId = `morphgrad-${color.replace("#", "")}-${xPercent}-${yPercent}`;

  return (
    <div
      style={{
        position: "absolute",
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        width: size,
        height: size,
        transform: `translate(-50%, -50%) translate(${driftX}px, ${driftY}px) rotate(${rotation}deg)`,
        opacity,
        filter: `blur(${blurPx}px)`,
      }}
    >
      <svg
        viewBox={`${-viewBoxHalf} ${-viewBoxHalf} ${viewBoxHalf * 2} ${viewBoxHalf * 2}`}
        width="100%"
        height="100%"
      >
        {!flat && (
          <defs>
            <radialGradient id={gradId} cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor={color} stopOpacity={0.9} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </radialGradient>
          </defs>
        )}
        <path d={path} fill={flat ? color : `url(#${gradId})`} />
      </svg>
    </div>
  );
};
