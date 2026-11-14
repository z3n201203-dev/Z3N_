import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

interface ParallaxStageProps {
  children: React.ReactNode;
  offsetRange?: number;
  className?: string;
}

export const ParallaxStage: React.FC<ParallaxStageProps> = ({
  children,
  offsetRange = 48,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [offsetRange, -offsetRange]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <motion.div style={{ y }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  );
};
