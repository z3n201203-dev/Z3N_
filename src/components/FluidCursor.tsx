import React, { useEffect, useRef, useState } from 'react';
import {
  buildClosedFluidPath,
  clamp,
  computeFluidBlobVertices,
  stepSpringPoint,
} from '../utils/xrayPhysics';
import { soundEngine } from '../utils/soundEngine';

interface ClickBurst {
  id: number;
  x: number;
  y: number;
}

interface TrailNode {
  x: number;
  y: number;
}

interface TrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  isXrayTint: boolean;
}

const TRAIL_NODE_COUNT = 20;

export const FluidCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const coreRef = useRef<HTMLDivElement | null>(null);
  const auraRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const blobPathRef = useRef<SVGPathElement | null>(null);

  const [bursts, setBursts] = useState<ClickBurst[]>([]);
  const [isEnabled, setIsEnabled] = useState(false);

  const pointerRef = useRef({
    x: -200,
    y: -200,
    prevX: -200,
    prevY: -200,
    visible: false,
    down: false,
    inXrayZone: false,
  });
  const springX = useRef({ value: -200, velocity: 0 });
  const springY = useRef({ value: -200, velocity: 0 });
  const ringScale = useRef({ value: 1, velocity: 0 });
  const cursorLabelRef = useRef<string>('');
  const burstIdRef = useRef(0);

  const trailNodesRef = useRef<TrailNode[]>(
    Array.from({ length: TRAIL_NODE_COUNT }, () => ({ x: -200, y: -200 }))
  );
  const particlesRef = useRef<TrailParticle[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reducedMotion) return;

    setIsEnabled(true);
    let rafId = 0;
    let lastTime = performance.now();
    let frameCounter = 0;

    const syncCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    syncCanvasSize();
    window.addEventListener('resize', syncCanvasSize);

    const evaluateHoverTarget = (clientX: number, clientY: number) => {
      const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
      const cursorZone = el?.closest<HTMLElement>('[data-cursor]');
      const nextLabel = cursorZone?.dataset.cursor || '';
      const inXray =
        nextLabel.includes('X-RAY') ||
        Boolean(el?.closest('[data-xray-active="true"]'));
      pointerRef.current.inXrayZone = inXray;

      if (nextLabel !== cursorLabelRef.current) {
        cursorLabelRef.current = nextLabel;
        if (labelRef.current) {
          labelRef.current.textContent = nextLabel;
          labelRef.current.style.opacity = nextLabel ? '1' : '0';
        }
      }
    };

    const spawnParticles = (
      x: number,
      y: number,
      vx: number,
      vy: number,
      count: number,
      isBurst: boolean,
      isXrayTint: boolean
    ) => {
      const pool = particlesRef.current;
      for (let i = 0; i < count; i++) {
        const angle = isBurst
          ? (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4
          : Math.atan2(vy, vx) + Math.PI + (Math.random() - 0.5) * 1.3;
        const speed = isBurst ? 80 + Math.random() * 150 : 22 + Math.random() * 52;
        pool.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: isBurst ? 0.52 + Math.random() * 0.25 : 0.44 + Math.random() * 0.3,
          size: isBurst ? 2.4 + Math.random() * 2.4 : 1.7 + Math.random() * 2.4,
          isXrayTint,
        });
      }
      if (pool.length > 110) {
        pool.splice(0, pool.length - 110);
      }
    };

    const activateCursorClass = () => {
      document.documentElement.classList.add('fluid-cursor-active');
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      activateCursorClass();
      if (!pointerRef.current.visible) {
        springX.current.value = e.clientX;
        springY.current.value = e.clientY;
        for (const node of trailNodesRef.current) {
          node.x = e.clientX;
          node.y = e.clientY;
        }
      }
      pointerRef.current.prevX = pointerRef.current.x;
      pointerRef.current.prevY = pointerRef.current.y;
      pointerRef.current.x = e.clientX;
      pointerRef.current.y = e.clientY;
      pointerRef.current.visible = true;

      evaluateHoverTarget(e.clientX, e.clientY);

      const dx = e.clientX - pointerRef.current.prevX;
      const dy = e.clientY - pointerRef.current.prevY;
      const moveDist = Math.hypot(dx, dy);
      if (moveDist > 4) {
        spawnParticles(
          e.clientX,
          e.clientY,
          dx * 12,
          dy * 12,
          moveDist > 20 ? 3 : 1,
          false,
          pointerRef.current.inXrayZone
        );
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      pointerRef.current.down = true;
      soundEngine.playRipple();

      spawnParticles(
        e.clientX,
        e.clientY,
        0,
        0,
        14,
        true,
        pointerRef.current.inXrayZone
      );

      const id = ++burstIdRef.current;
      setBursts((prev) => [...prev.slice(-5), { id, x: e.clientX, y: e.clientY }]);
      window.setTimeout(() => {
        setBursts((prev) => prev.filter((item) => item.id !== id));
      }, 650);
    };

    const handlePointerUp = () => {
      pointerRef.current.down = false;
    };

    const handlePointerLeave = () => {
      pointerRef.current.visible = false;
      document.documentElement.classList.remove('fluid-cursor-active');
    };

    const tick = (now: number) => {
      const dt = clamp((now - lastTime) / 1000, 0.004, 0.033);
      lastTime = now;
      frameCounter += 1;

      const ptr = pointerRef.current;
      // Periodically re-evaluate element under stationary cursor (e.g., after route transitions or modals)
      if (ptr.visible && frameCounter % 8 === 0) {
        evaluateHoverTarget(ptr.x, ptr.y);
      }

      springX.current = stepSpringPoint(springX.current, ptr.x, 340, 26, dt);
      springY.current = stepSpringPoint(springY.current, ptr.y, 340, 26, dt);

      const targetScale = ptr.down ? 0.72 : cursorLabelRef.current ? 1.48 : 1;
      ringScale.current = stepSpringPoint(ringScale.current, targetScale, 320, 24, dt);

      const opacity = ptr.visible ? '1' : '0';

      if (coreRef.current) {
        coreRef.current.style.opacity = opacity;
        coreRef.current.style.transform = `translate3d(${ptr.x}px, ${ptr.y}px, 0) translate(-50%, -50%) scale(${ptr.down ? 0.7 : 1})`;
        coreRef.current.style.backgroundColor = ptr.inXrayZone ? '#7DD3FC' : '#E84A27';
      }

      if (auraRef.current) {
        auraRef.current.style.opacity = opacity;
        auraRef.current.style.transform = `translate3d(${springX.current.value}px, ${springY.current.value}px, 0) translate(-50%, -50%)`;
      }

      if (blobPathRef.current) {
        const radius = 20 * ringScale.current.value;
        const vertices = computeFluidBlobVertices(
          48,
          48,
          radius,
          springX.current.velocity,
          springY.current.velocity,
          now / 1000,
          14,
          cursorLabelRef.current ? 0.09 : 0.13
        );
        blobPathRef.current.setAttribute('d', buildClosedFluidPath(vertices));
        blobPathRef.current.setAttribute(
          'fill',
          ptr.inXrayZone ? 'rgba(125, 211, 252, 0.10)' : 'rgba(232, 74, 39, 0.08)'
        );
        blobPathRef.current.setAttribute(
          'stroke',
          ptr.inXrayZone ? 'rgba(125, 211, 252, 0.80)' : 'rgba(244, 243, 239, 0.65)'
        );
      }

      // Render smooth tapered fluid trail & reactive particle wake
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        const nodes = trailNodesRef.current;
        if (ptr.visible) {
          nodes[0].x += (ptr.x - nodes[0].x) * clamp(dt * 28, 0.18, 0.88);
          nodes[0].y += (ptr.y - nodes[0].y) * clamp(dt * 28, 0.18, 0.88);
          for (let i = 1; i < nodes.length; i++) {
            const followRate = clamp(dt * (24 - i * 0.65), 0.14, 0.74);
            nodes[i].x += (nodes[i - 1].x - nodes[i].x) * followRate;
            nodes[i].y += (nodes[i - 1].y - nodes[i].y) * followRate;
          }

          const speed = Math.hypot(springX.current.velocity, springY.current.velocity);
          const ribbonAlpha = clamp(0.18 + speed / 1800, 0.18, 0.64);

          for (let i = 0; i < nodes.length - 1; i++) {
            const p0 = nodes[i];
            const p1 = nodes[i + 1];
            const t = 1 - i / nodes.length;
            const segWidth = Math.max(0.75, t * (ptr.down ? 8.5 : 6.2));
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.lineCap = 'round';
            ctx.lineWidth = segWidth;
            ctx.strokeStyle = ptr.inXrayZone
              ? `rgba(125, 211, 252, ${(ribbonAlpha * t).toFixed(3)})`
              : `rgba(232, 74, 39, ${(ribbonAlpha * t).toFixed(3)})`;
            ctx.stroke();
          }
        }

        const particles = particlesRef.current;
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.life += dt;
          if (p.life >= p.maxLife) {
            particles.splice(i, 1);
            continue;
          }
          const progress = p.life / p.maxLife;
          p.vx *= 0.94;
          p.vy *= 0.94;
          p.x += (p.vx + Math.sin(now / 260 + i) * 14) * dt;
          p.y += (p.vy + Math.cos(now / 280 + i) * 14) * dt;

          const alpha = (1 - progress) * 0.78;
          const r = p.size * (1 - progress * 0.6);
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.5, r), 0, Math.PI * 2);
          ctx.fillStyle = p.isXrayTint
            ? `rgba(125, 211, 252, ${alpha.toFixed(3)})`
            : `rgba(232, 74, 39, ${alpha.toFixed(3)})`;
          ctx.fill();
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', syncCanvasSize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseleave', handlePointerLeave);
      document.documentElement.classList.remove('fluid-cursor-active');
    };
  }, []);

  if (!isEnabled) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[90] overflow-hidden"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="fixed inset-0 h-full w-full" />

      <div
        ref={auraRef}
        className="fixed left-0 top-0 h-24 w-24 will-change-transform transition-opacity duration-150"
        style={{ opacity: 0 }}
      >
        <svg viewBox="0 0 96 96" className="h-full w-full overflow-visible">
          <path
            ref={blobPathRef}
            fill="rgba(232, 74, 39, 0.08)"
            stroke="rgba(244, 243, 239, 0.65)"
            strokeWidth="1.25"
          />
        </svg>
        <span
          ref={labelRef}
          className="absolute left-1/2 top-[calc(100%-6px)] -translate-x-1/2 whitespace-nowrap rounded bg-[#0B0B0D]/85 px-1.5 py-0.5 font-mono text-[9px] font-medium tracking-[0.12em] text-[#F4F3EF] transition-opacity duration-150"
          style={{ opacity: 0 }}
        />
      </div>

      <div
        ref={coreRef}
        className="fixed left-0 top-0 h-2 w-2 rounded-full bg-[#E84A27] will-change-transform transition-opacity duration-150"
        style={{ opacity: 0 }}
      />

      {bursts.map((burst) => (
        <span
          key={burst.id}
          className="fixed left-0 top-0 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#E84A27]/80 animate-[ping_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]"
          style={{
            left: burst.x,
            top: burst.y,
          }}
        />
      ))}
    </div>
  );
};
