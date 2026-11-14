import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { soundEngine } from '../utils/soundEngine';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  strength?: number;
  cursorLabel?: string;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  strength = 0.28,
  cursorLabel = 'CLICK',
  className = '',
  onClick,
  ...rest
}) => {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [ripple, setRipple] = useState<{ id: number; x: number; y: number } | null>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === 'touch' || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    setOffset({ x: relX * strength, y: relY * strength });
  };

  const handlePointerLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    soundEngine.playDetent(640);
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setRipple({
        id: Date.now(),
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      window.setTimeout(() => setRipple(null), 500);
    }
    onClick?.(e);
  };

  return (
    <motion.button
      ref={btnRef}
      data-cursor={cursorLabel}
      animate={{ x: offset.x, y: offset.y }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 360, damping: 24, mass: 0.45 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      className={`relative overflow-hidden whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E84A27] ${className}`}
      {...(rest as Record<string, unknown>)}
    >
      {ripple && (
        <motion.span
          key={ripple.id}
          initial={{ scale: 0, opacity: 0.45 }}
          animate={{ scale: 4.5, opacity: 0 }}
          transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40"
          style={{ left: ripple.x, top: ripple.y }}
          aria-hidden="true"
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </motion.button>
  );
};
