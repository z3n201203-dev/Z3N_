import React, { useEffect, useId, useRef, useState } from 'react';
import { ScanLine } from 'lucide-react';
import type { SpecimenItem } from '../data/specimens';
import {
  buildClosedFluidPath,
  clamp,
  computeDistanceToRect,
  computeFluidBlobVertices,
  computeParallaxOffset,
  computeProximityIntensity,
  stepSpringPoint,
} from '../utils/xrayPhysics';
import { soundEngine } from '../utils/soundEngine';

export interface FluidXRayLensProps {
  specimen: SpecimenItem;
  proximityThreshold?: number;
  apertureRadius?: number;
  viscosity?: number; // 0.3 (fluid) to 1.0 (dense)
  mode?: 'proximity' | 'full' | 'split';
  className?: string;
  aspectClassName?: string;
  showMetadataFooter?: boolean;
  onInspect?: (specimen: SpecimenItem) => void;
  onTelemetryChange?: (telemetry: {
    distance: number;
    intensity: number;
    velocity: number;
  }) => void;
}

export const FluidXRayLens: React.FC<FluidXRayLensProps> = ({
  specimen,
  proximityThreshold = 190,
  apertureRadius = 155,
  viscosity = 0.55,
  mode = 'proximity',
  className = '',
  aspectClassName = 'aspect-[4/3]',
  showMetadataFooter = true,
  onInspect,
  onTelemetryChange,
}) => {
  const uid = useId().replace(/:/g, '');
  const clipId = `xray-fluid-clip-${uid}`;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const clipPathRef = useRef<SVGPathElement | null>(null);
  const membraneRef = useRef<SVGPathElement | null>(null);
  const reticleRef = useRef<SVGGElement | null>(null);
  const innerCardRef = useRef<HTMLDivElement | null>(null);
  const xrayLayerRef = useRef<HTMLDivElement | null>(null);

  const [lockedFull, setLockedFull] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [surfaceImgError, setSurfaceImgError] = useState(false);
  const [xrayImgError, setXrayImgError] = useState(false);

  const pointerRef = useRef({ x: -9999, y: -9999, hasMoved: false });
  const lensX = useRef({ value: 0, velocity: 0 });
  const lensY = useRef({ value: 0, velocity: 0 });
  const intensitySpring = useRef({ value: 0, velocity: 0 });
  const wasActiveRef = useRef(false);
  const telemetryCallbackRef = useRef(onTelemetryChange);
  telemetryCallbackRef.current = onTelemetryChange;

  const propsRef = useRef({
    proximityThreshold,
    apertureRadius,
    viscosity,
    mode,
    lockedFull,
  });
  propsRef.current = {
    proximityThreshold,
    apertureRadius,
    viscosity,
    mode,
    lockedFull,
  };

  useEffect(() => {
    setSurfaceImgError(false);
    setXrayImgError(false);
  }, [specimen.id]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;
    let lastTime = performance.now();
    let frameCount = 0;

    const handlePointerMove = (e: PointerEvent) => {
      pointerRef.current.x = e.clientX;
      pointerRef.current.y = e.clientY;
      pointerRef.current.hasMoved = true;
    };

    const tick = (now: number) => {
      const dt = clamp((now - lastTime) / 1000, 0.004, 0.033);
      lastTime = now;

      const el = containerRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const {
          proximityThreshold: threshold,
          apertureRadius: baseRadius,
          viscosity: visc,
          mode: currentMode,
          lockedFull: isLocked,
        } = propsRef.current;

        const ptr = pointerRef.current;
        const targetLocalX = ptr.hasMoved
          ? clamp(ptr.x - rect.left, -30, rect.width + 30)
          : rect.width * 0.5;
        const targetLocalY = ptr.hasMoved
          ? clamp(ptr.y - rect.top, -30, rect.height + 30)
          : rect.height * 0.5;

        // Higher viscosity = softer, slower spring stiffness
        const stiffness = 280 - visc * 150;
        const damping = 22 + visc * 8;

        lensX.current = stepSpringPoint(lensX.current, targetLocalX, stiffness, damping, dt);
        lensY.current = stepSpringPoint(lensY.current, targetLocalY, stiffness, damping, dt);

        const dist = ptr.hasMoved
          ? computeDistanceToRect(ptr.x, ptr.y, {
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
            })
          : threshold + 100;

        let targetIntensity = 0;
        if (isLocked || currentMode === 'full') {
          targetIntensity = 1;
        } else if (currentMode === 'split') {
          targetIntensity = 1;
        } else if (ptr.hasMoved) {
          targetIntensity = computeProximityIntensity(
            ptr.x,
            ptr.y,
            {
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
            },
            threshold
          );
        }

        intensitySpring.current = stepSpringPoint(
          intensitySpring.current,
          targetIntensity,
          180,
          24,
          dt
        );
        const smoothIntensity = clamp(intensitySpring.current.value, 0, 1);
        const activeNow = smoothIntensity > 0.025;

        if (activeNow !== wasActiveRef.current) {
          wasActiveRef.current = activeNow;
          setIsActive(activeNow);
          if (activeNow) {
            soundEngine.playDetent(420);
          }
        }

        el.setAttribute('data-xray-active', activeNow ? 'true' : 'false');
        el.setAttribute('data-xray-intensity', smoothIntensity.toFixed(2));
        el.setAttribute('data-xray-distance', Math.round(dist).toString());

        // Update fluid SVG clipPath & luminous membrane
        if (clipPathRef.current && membraneRef.current) {
          if (isLocked || currentMode === 'full') {
            const fullPath = `M -20 -20 L ${rect.width + 20} -20 L ${rect.width + 20} ${rect.height + 20} L -20 ${rect.height + 20} Z`;
            clipPathRef.current.setAttribute('d', fullPath);
            membraneRef.current.setAttribute('d', '');
          } else if (currentMode === 'split') {
            const splitX = ptr.hasMoved
              ? clamp(lensX.current.value, 0, rect.width)
              : rect.width * 0.5;
            const wave = Math.sin(now / 380) * 10;
            const splitPath = `M 0 0 L ${splitX} 0 Q ${splitX + wave} ${rect.height * 0.5} ${splitX} ${rect.height} L 0 ${rect.height} Z`;
            clipPathRef.current.setAttribute('d', splitPath);
            membraneRef.current.setAttribute(
              'd',
              `M ${splitX} 0 Q ${splitX + wave} ${rect.height * 0.5} ${splitX} ${rect.height}`
            );
          } else {
            const effectiveRadius =
              smoothIntensity > 0.01 ? baseRadius * (0.28 + 0.72 * smoothIntensity) : 0;
            const wobble = reducedMotion ? 0 : 0.07 + (1 - visc) * 0.09;
            const vertices = computeFluidBlobVertices(
              lensX.current.value,
              lensY.current.value,
              effectiveRadius,
              reducedMotion ? 0 : lensX.current.velocity,
              reducedMotion ? 0 : lensY.current.velocity,
              now / 1000,
              18,
              wobble
            );
            const pathData = buildClosedFluidPath(vertices);
            clipPathRef.current.setAttribute('d', pathData);
            membraneRef.current.setAttribute('d', smoothIntensity > 0.02 ? pathData : '');
            membraneRef.current.style.opacity = String(clamp(smoothIntensity * 1.15, 0, 1));
          }
        }

        // Update crosshair reticle inside the fluid aperture
        if (reticleRef.current) {
          const showReticle =
            !isLocked && currentMode === 'proximity' && smoothIntensity > 0.12;
          reticleRef.current.style.opacity = showReticle ? String(smoothIntensity * 0.85) : '0';
          reticleRef.current.setAttribute(
            'transform',
            `translate(${lensX.current.value.toFixed(1)}, ${lensY.current.value.toFixed(1)})`
          );
        }

        // Subtle 3D tilt parallax when pointer approaches or hovers
        if (!reducedMotion && innerCardRef.current && ptr.hasMoved) {
          const localParallax = computeParallaxOffset(
            clamp(ptr.x - rect.left, 0, rect.width),
            clamp(ptr.y - rect.top, 0, rect.height),
            Math.max(rect.width, 1),
            Math.max(rect.height, 1),
            smoothIntensity * 0.65
          );
          innerCardRef.current.style.transform = `perspective(1100px) rotateX(${localParallax.rotateX * 0.6}deg) rotateY(${localParallax.rotateY * 0.6}deg)`;
          if (xrayLayerRef.current) {
            xrayLayerRef.current.style.transform = `translate3d(${localParallax.x * 0.25}px, ${localParallax.y * 0.25}px, 0) scale(1.03)`;
          }
        }

        frameCount += 1;
        if (frameCount % 6 === 0 && telemetryCallbackRef.current) {
          const speed = Math.hypot(lensX.current.velocity, lensY.current.velocity);
          telemetryCallbackRef.current({
            distance: Math.round(dist),
            intensity: Math.round(smoothIntensity * 100),
            velocity: Math.round(speed),
          });
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  const toggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playDetent(lockedFull ? 420 : 680);
    setLockedFull((prev) => !prev);
  };

  return (
    <div
      ref={containerRef}
      data-testid={`xray-specimen-${specimen.id}`}
      data-cursor={onInspect ? 'X-RAY · OPEN' : 'X-RAY'}
      className={`group relative select-none ${className}`}
    >
      <div
        ref={innerCardRef}
        onClick={() => onInspect?.(specimen)}
        role={onInspect ? 'button' : undefined}
        tabIndex={onInspect ? 0 : undefined}
        aria-label={onInspect ? `Inspect ${specimen.title} radiograph` : undefined}
        onKeyDown={(e) => {
          if (onInspect && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onInspect(specimen);
          }
        }}
        className={`relative overflow-hidden rounded-2xl border border-[#24242A] bg-[#121216] transition-[border-color,box-shadow] duration-200 will-change-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E84A27] ${
          isActive ? 'border-[#7DD3FC]/45' : 'group-hover:border-[#3A3A44]'
        } ${onInspect ? 'cursor-pointer' : ''}`}
      >
        <div className={`relative w-full overflow-hidden bg-[#0D0E12] ${aspectClassName}`}>
          {/* Surface Photographic Layer */}
          {!surfaceImgError ? (
            <img
              src={specimen.surfaceImage}
              alt={`${specimen.title} exterior architectural finish`}
              referrerPolicy="no-referrer"
              onError={() => setSurfaceImgError(true)}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#181920] to-[#0D0E12] p-6 text-center">
              <ScanLine className="mb-3 h-8 w-8 text-[#9A9891]" />
              <span className="font-display text-lg font-semibold text-[#F4F3EF]">
                {specimen.title}
              </span>
            </div>
          )}

          {/* Subtle dark vignette for architectural legibility */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0B0D]/80 via-transparent to-[#0B0B0D]/25"
            aria-hidden="true"
          />

          {/* Fluid X-Ray Radiograph Layer clipped to SVG fluid path */}
          <div
            ref={xrayLayerRef}
            className="pointer-events-none absolute inset-0 bg-[#05080F] will-change-transform"
            style={{ clipPath: `url(#${clipId})` }}
            aria-hidden="true"
          >
            {!xrayImgError ? (
              <img
                src={specimen.xrayImage}
                alt=""
                referrerPolicy="no-referrer"
                onError={() => setXrayImgError(true)}
                className="h-full w-full object-cover"
                style={
                  specimen.xrayNeedsProceduralFilter
                    ? {
                        filter:
                          'grayscale(1) invert(1) contrast(1.45) brightness(0.92) sepia(0.35) hue-rotate(175deg) saturate(2.1)',
                      }
                    : { filter: 'contrast(1.12) brightness(1.06)' }
                }
              />
            ) : null}

            {/* Blueprint architectural coordinate grid & schematic ribs */}
            <svg
              className="absolute inset-0 h-full w-full opacity-65"
              viewBox="0 0 800 600"
              preserveAspectRatio="none"
            >
              <defs>
                <pattern
                  id={`grid-${uid}`}
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="rgba(125, 211, 252, 0.16)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="800" height="600" fill={`url(#grid-${uid})`} />
              {/* Precision concentric inspection rings */}
              <circle
                cx="400"
                cy="300"
                r="175"
                fill="none"
                stroke="rgba(125, 211, 252, 0.35)"
                strokeWidth="1"
                strokeDasharray="6 6"
              />
              <circle
                cx="400"
                cy="300"
                r="92"
                fill="none"
                stroke="rgba(232, 74, 39, 0.5)"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="300"
                x2="800"
                y2="300"
                stroke="rgba(125, 211, 252, 0.2)"
                strokeWidth="1"
              />
              <line
                x1="400"
                y1="0"
                x2="400"
                y2="600"
                stroke="rgba(125, 211, 252, 0.2)"
                strokeWidth="1"
              />
            </svg>

            {/* Telemetry schematic pins inside X-Ray layer */}
            {specimen.telemetryNodes.map((node) => (
              <div
                key={node.label}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${node.xPercent}%`, top: `${node.yPercent}%` }}
              >
                <div className="flex items-center gap-2 rounded bg-[#070B14]/88 px-2.5 py-1 ring-1 ring-[#7DD3FC]/55 backdrop-blur-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#7DD3FC]" />
                  <span className="font-mono text-[10px] font-medium whitespace-nowrap text-[#E0F2FE]">
                    {node.label} · {node.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* SVG Defs + Fluid Luminous Refraction Border */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            aria-hidden="true"
          >
            <defs>
              <clipPath id={clipId}>
                <path ref={clipPathRef} d="" />
              </clipPath>
            </defs>

            <path
              ref={membraneRef}
              d=""
              fill="none"
              stroke={specimen.xrayTint}
              strokeWidth="2"
              strokeLinecap="round"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(125, 211, 252, 0.55))',
                opacity: 0,
              }}
            />

            <g ref={reticleRef} style={{ opacity: 0 }}>
              <circle
                cx="0"
                cy="0"
                r="14"
                fill="none"
                stroke="rgba(232, 74, 39, 0.85)"
                strokeWidth="1.25"
              />
              <line x1="-22" y1="0" x2="-8" y2="0" stroke="#E0F2FE" strokeWidth="1" />
              <line x1="8" y1="0" x2="22" y2="0" stroke="#E0F2FE" strokeWidth="1" />
              <line x1="0" y1="-22" x2="0" y2="-8" stroke="#E0F2FE" strokeWidth="1" />
              <line x1="0" y1="8" x2="0" y2="22" stroke="#E0F2FE" strokeWidth="1" />
            </g>
          </svg>

          {/* Accessible Lock/Unlock X-Ray button */}
          <button
            type="button"
            onClick={toggleLock}
            aria-pressed={lockedFull}
            aria-label={
              lockedFull
                ? `Release X-ray lock on ${specimen.title}`
                : `Lock full X-ray view on ${specimen.title}`
            }
            data-cursor={lockedFull ? 'SURFACE' : 'LOCK X-RAY'}
            className="absolute right-3.5 top-3.5 z-20 inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#0B0B0D]/80 px-3 py-1.5 text-xs font-medium text-[#F4F3EF] backdrop-blur-md transition-colors hover:border-[#7DD3FC]/60 hover:bg-[#14161F] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E84A27]"
          >
            <ScanLine className="h-3.5 w-3.5 text-[#7DD3FC]" />
            <span>{lockedFull ? 'Release X-Ray' : 'Lock X-Ray'}</span>
          </button>

          {/* Clean bottom-left specimen index overlay */}
          <div className="pointer-events-none absolute bottom-3.5 left-4 right-4 z-10 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-mono text-[11px] text-[#B8B6AE] tabular-nums">
                <span>{specimen.code}</span>
                <span aria-hidden="true">·</span>
                <span>{specimen.category}</span>
                <span aria-hidden="true">·</span>
                <span>{specimen.tolerance}</span>
              </div>
              <h3 className="mt-0.5 truncate font-display text-lg font-semibold tracking-tight text-[#F4F3EF]">
                {specimen.title}
              </h3>
            </div>
          </div>
        </div>

        {showMetadataFooter && (
          <div className="flex items-center justify-between gap-4 border-t border-[#1E1E24] bg-[#121216] px-4 py-3 text-xs text-[#9A9891]">
            <span className="truncate">{specimen.subtitle}</span>
            <span className="font-mono tabular-nums whitespace-nowrap shrink-0 text-[#C8C6BE]">
              {specimen.mass} · {specimen.year}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
