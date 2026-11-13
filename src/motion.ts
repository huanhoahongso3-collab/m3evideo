// M3 Expressive spring tokens.
// Remotion's `spring()` takes an absolute damping coefficient, not a damping
// ratio. M3's own spec is expressed as (dampingRatio, stiffness, mass=1), so
// we convert: damping = dampingRatio * 2 * sqrt(stiffness * mass).
function toDamping(dampingRatio: number, stiffness: number, mass = 1): number {
  return dampingRatio * 2 * Math.sqrt(stiffness * mass);
}

// Spatial springs — position / size / shape. These overshoot and bounce.
export const SPATIAL_DEFAULT = {
  stiffness: 380,
  mass: 1,
  damping: toDamping(0.8, 380),
};

export const SPATIAL_FAST = {
  stiffness: 800,
  mass: 1,
  damping: toDamping(0.8, 800),
};

export const SPATIAL_SLOW = {
  stiffness: 200,
  mass: 1,
  damping: toDamping(0.85, 200),
};

// Effects springs — opacity / color / blur. No bounce (critically damped).
// Stiffness is high but tuned down from the theoretical ~3800 so a 30fps
// video can actually resolve the motion across a few frames instead of
// snapping in a single frame.
export const EFFECTS = {
  stiffness: 1400,
  mass: 0.9,
  damping: toDamping(1.0, 1400, 0.9),
};
