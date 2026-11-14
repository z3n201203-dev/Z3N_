import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildClosedFluidPath,
  computeDistanceToRect,
  computeFluidBlobVertices,
  computeParallaxOffset,
  computeProximityIntensity,
  stepSpringPoint,
  validateCommissionForm,
} from './xrayPhysics';

test('computeDistanceToRect returns 0 inside rect and exact distance outside', () => {
  const rect = { left: 100, top: 100, width: 200, height: 150 };
  assert.equal(computeDistanceToRect(150, 150, rect), 0);
  assert.equal(computeDistanceToRect(100, 100, rect), 0);
  assert.equal(computeDistanceToRect(70, 150, rect), 30);
  assert.equal(computeDistanceToRect(100, 60, rect), 40);
  assert.equal(computeDistanceToRect(70, 60, rect), 50);
});

test('computeProximityIntensity activates smoothly within threshold and clamps at 0/1', () => {
  const rect = { left: 200, top: 200, width: 300, height: 200 };
  assert.equal(computeProximityIntensity(250, 250, rect, 180), 1);
  assert.equal(computeProximityIntensity(10, 250, rect, 180), 0);

  const midIntensity = computeProximityIntensity(110, 250, rect, 180);
  assert.ok(midIntensity > 0.45 && midIntensity < 0.55);

  const nearIntensity = computeProximityIntensity(170, 250, rect, 180);
  assert.ok(nearIntensity > midIntensity && nearIntensity < 1);
});

test('stepSpringPoint converges smoothly toward target without exploding', () => {
  let state = { value: 0, velocity: 0 };
  for (let i = 0; i < 180; i++) {
    state = stepSpringPoint(state, 100, 240, 26, 1 / 60);
  }
  assert.ok(Math.abs(state.value - 100) < 0.5);
  assert.ok(Math.abs(state.velocity) < 1);
});

test('computeFluidBlobVertices elongates along cursor velocity and builds closed SVG path', () => {
  const pts = computeFluidBlobVertices(200, 200, 90, 900, 0, 1.2, 16, 0.1);
  assert.equal(pts.length, 16);
  const path = buildClosedFluidPath(pts);
  assert.ok(path.startsWith('M '));
  assert.ok(path.endsWith(' Z'));

  const zeroPts = computeFluidBlobVertices(50, 50, 0, 0, 0, 0, 8);
  assert.deepEqual(zeroPts[0], { x: 50, y: 50 });
});

test('computeParallaxOffset is centered at zero and symmetric at opposite edges', () => {
  const center = computeParallaxOffset(720, 450, 1440, 900, 1);
  assert.equal(center.x, 0);
  assert.equal(center.y, 0);

  const topLeft = computeParallaxOffset(0, 0, 1440, 900, 1);
  const bottomRight = computeParallaxOffset(1440, 900, 1440, 900, 1);
  assert.equal(topLeft.x, -bottomRight.x);
  assert.equal(topLeft.y, -bottomRight.y);
});

test('validateCommissionForm rejects incomplete input and accepts valid inquiries', () => {
  const invalid = validateCommissionForm({
    name: 'A',
    email: 'invalid-email',
    organization: '',
    discipline: '',
    timeline: '',
    brief: 'too short',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.name);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.discipline);
  assert.ok(invalid.errors.timeline);
  assert.ok(invalid.errors.brief);

  const valid = validateCommissionForm({
    name: 'Elena Vance',
    email: 'elena@vancestudio.ch',
    organization: 'Helvetia Acoustics',
    discipline: 'Fluid Optics & UI',
    timeline: 'Q2 2027',
    brief: 'We need a proximity X-ray product configurator for our new reference horn.',
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});
