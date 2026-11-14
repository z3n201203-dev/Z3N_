export interface RectBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface SpringState {
  value: number;
  velocity: number;
}

export interface FluidBlobPoint {
  x: number;
  y: number;
}

export interface ParallaxResult {
  x: number;
  y: number;
  rotateX: number;
  rotateY: number;
}

export interface CommissionFormInput {
  name: string;
  email: string;
  organization: string;
  discipline: string;
  timeline: string;
  brief: string;
}

export interface CommissionValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof CommissionFormInput, string>>;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/**
 * Smoothstep easing from 0 to 1.
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge1 === edge0) return x >= edge1 ? 1 : 0;
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Euclidean distance from point (px, py) to the nearest point on rect.
 * Returns 0 when the point is inside or on the boundary of rect.
 */
export function computeDistanceToRect(
  px: number,
  py: number,
  rect: RectBounds
): number {
  const right = rect.left + rect.width;
  const bottom = rect.top + rect.height;
  const dx = px < rect.left ? rect.left - px : px > right ? px - right : 0;
  const dy = py < rect.top ? rect.top - py : py > bottom ? py - bottom : 0;
  return Math.hypot(dx, dy);
}

/**
 * Computes proximity-triggered X-ray field intensity in [0, 1].
 * Intensity is 1 inside the rect, smoothly decays to 0 at thresholdPx away.
 */
export function computeProximityIntensity(
  px: number,
  py: number,
  rect: RectBounds,
  thresholdPx: number
): number {
  if (rect.width <= 0 || rect.height <= 0) return 0;
  const dist = computeDistanceToRect(px, py, rect);
  if (dist === 0) return 1;
  if (thresholdPx <= 0 || dist >= thresholdPx) return 0;
  return 1 - smoothstep(0, thresholdPx, dist);
}

/**
 * Semi-implicit Euler damped harmonic spring step for fluid cursor & lens motion.
 */
export function stepSpringPoint(
  state: SpringState,
  target: number,
  stiffness: number,
  damping: number,
  dtSeconds: number
): SpringState {
  const safeDt = clamp(dtSeconds, 0.001, 0.05);
  const displacement = state.value - target;
  const springForce = -stiffness * displacement;
  const dampingForce = -damping * state.velocity;
  const acceleration = springForce + dampingForce;
  const nextVelocity = state.velocity + acceleration * safeDt;
  const nextValue = state.value + nextVelocity * safeDt;
  return {
    value: nextValue,
    velocity: nextVelocity,
  };
}

/**
 * Computes fluid organic blob vertices around (cx, cy) that elongate along cursor velocity
 * and oscillate smoothly with harmonic fluid waves.
 */
export function computeFluidBlobVertices(
  cx: number,
  cy: number,
  baseRadius: number,
  vx: number,
  vy: number,
  timeSec: number,
  pointsCount = 16,
  wobbleAmp = 0.12
): FluidBlobPoint[] {
  const safeRadius = Math.max(0, baseRadius);
  if (safeRadius === 0) {
    return Array.from({ length: pointsCount }, () => ({ x: cx, y: cy }));
  }

  const speed = Math.hypot(vx, vy);
  const stretchFactor = clamp(speed / 1400, 0, 0.42);
  const moveAngle = speed > 1 ? Math.atan2(vy, vx) : 0;
  const cosA = Math.cos(moveAngle);
  const sinA = Math.sin(moveAngle);

  const vertices: FluidBlobPoint[] = [];
  for (let i = 0; i < pointsCount; i++) {
    const theta = (i / pointsCount) * Math.PI * 2;
    const harmonic1 = Math.sin(theta * 3 + timeSec * 3.1) * wobbleAmp;
    const harmonic2 = Math.cos(theta * 5 - timeSec * 2.4) * (wobbleAmp * 0.55);
    const harmonic3 = Math.sin(theta * 2 + timeSec * 1.7) * (wobbleAmp * 0.4);
    const r = safeRadius * (1 + harmonic1 + harmonic2 + harmonic3);

    // Local coordinates stretched along movement axis, compressed orthogonally (volume preservation)
    const lx = Math.cos(theta) * r * (1 + stretchFactor);
    const ly = Math.sin(theta) * r * (1 - stretchFactor * 0.35);

    // Rotate back to screen orientation
    const rx = lx * cosA - ly * sinA;
    const ry = lx * sinA + ly * cosA;
    vertices.push({ x: cx + rx, y: cy + ry });
  }
  return vertices;
}

/**
 * Converts a closed loop of points into a smooth quadratic midpoint SVG path.
 */
export function buildClosedFluidPath(points: FluidBlobPoint[]): string {
  const len = points.length;
  if (len < 3) return '';
  const midX = (points[len - 1].x + points[0].x) / 2;
  const midY = (points[len - 1].y + points[0].y) / 2;
  let d = `M ${midX.toFixed(2)} ${midY.toFixed(2)}`;
  for (let i = 0; i < len; i++) {
    const curr = points[i];
    const next = points[(i + 1) % len];
    const nextMidX = (curr.x + next.x) / 2;
    const nextMidY = (curr.y + next.y) / 2;
    d += ` Q ${curr.x.toFixed(2)} ${curr.y.toFixed(2)} ${nextMidX.toFixed(2)} ${nextMidY.toFixed(2)}`;
  }
  d += ' Z';
  return d;
}

/**
 * Computes bounded symmetric parallax translation and subtle tilt angles from pointer position.
 */
export function computeParallaxOffset(
  cursorX: number,
  cursorY: number,
  viewportW: number,
  viewportH: number,
  depth = 1
): ParallaxResult {
  if (viewportW <= 0 || viewportH <= 0) {
    return { x: 0, y: 0, rotateX: 0, rotateY: 0 };
  }
  const nx = clamp((cursorX / viewportW - 0.5) * 2, -1, 1);
  const ny = clamp((cursorY / viewportH - 0.5) * 2, -1, 1);
  const maxShift = 22 * depth;
  const maxTilt = 5 * depth;
  return {
    x: Number((-nx * maxShift).toFixed(3)),
    y: Number((-ny * maxShift).toFixed(3)),
    rotateX: Number((-ny * maxTilt).toFixed(3)),
    rotateY: Number((nx * maxTilt).toFixed(3)),
  };
}

/**
 * Validates the studio commission inquiry form.
 */
export function validateCommissionForm(
  input: CommissionFormInput
): CommissionValidationResult {
  const errors: Partial<Record<keyof CommissionFormInput, string>> = {};
  const trimmedName = input.name.trim();
  const trimmedEmail = input.email.trim();
  const trimmedBrief = input.brief.trim();

  if (trimmedName.length < 2) {
    errors.name = 'Please enter your name (at least 2 characters).';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail)) {
    errors.email = 'Please provide a valid work or studio email address.';
  }
  if (!input.discipline.trim()) {
    errors.discipline = 'Select a primary engineering or design discipline.';
  }
  if (!input.timeline.trim()) {
    errors.timeline = 'Select a target delivery window.';
  }
  if (trimmedBrief.length < 15) {
    errors.brief = 'Share at least 15 characters describing your interactive or optical scope.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
