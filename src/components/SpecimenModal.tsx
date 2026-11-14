import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, ArrowUpRight } from 'lucide-react';
import type { SpecimenItem } from '../data/specimens';
import { FluidXRayLens } from './FluidXRayLens';
import { MagneticButton } from './MagneticButton';

interface SpecimenModalProps {
  specimen: SpecimenItem | null;
  onClose: () => void;
  onCommissionSpecimen: (specimen: SpecimenItem) => void;
}

export const SpecimenModal: React.FC<SpecimenModalProps> = ({
  specimen,
  onClose,
  onCommissionSpecimen,
}) => {
  useEffect(() => {
    if (!specimen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [specimen, onClose]);

  return (
    <AnimatePresence>
      {specimen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="specimen-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-[#24242A] bg-[#111115] p-6 sm:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-4 border-b border-[#1E1E24] pb-5">
              <div>
                <div className="flex items-center gap-2 font-mono text-xs text-[#9A9891] tabular-nums">
                  <span>{specimen.code}</span>
                  <span aria-hidden="true">·</span>
                  <span>{specimen.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{specimen.client}</span>
                </div>
                <h2
                  id="specimen-modal-title"
                  className="mt-1 font-display text-2xl font-bold tracking-tight text-[#F4F3EF] sm:text-3xl"
                >
                  {specimen.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close specimen inspection modal"
                data-cursor="CLOSE"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#27272F] bg-[#18181D] text-[#F4F3EF] transition-colors hover:border-[#E84A27] hover:text-white cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E84A27]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <FluidXRayLens
                  specimen={specimen}
                  proximityThreshold={220}
                  apertureRadius={170}
                  showMetadataFooter={false}
                />
                <p className="mt-3 text-xs text-[#9A9891]">
                  Move the pointer across or near the frame to inspect internal radiography, or select Lock X-Ray for continuous scan.
                </p>
              </div>

              <div className="flex flex-col justify-between gap-6 lg:col-span-5">
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xs font-medium text-[#9A9891]">Engineering Overview</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#E4E3DD]">
                      {specimen.summary}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-medium text-[#9A9891]">Structural Architecture</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#B8B6AE]">
                      {specimen.architectureNote}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-y border-[#1E1E24] py-4">
                    <div>
                      <span className="block text-xs text-[#9A9891]">Machining Tolerance</span>
                      <span className="mt-1 block font-mono text-base font-medium tabular-nums text-[#F4F3EF]">
                        {specimen.tolerance}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-[#9A9891]">Measured Mass</span>
                      <span className="mt-1 block font-mono text-base font-medium tabular-nums text-[#F4F3EF]">
                        {specimen.mass}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-medium text-[#9A9891]">Internal Nodes</h3>
                    <ul className="mt-2 space-y-2">
                      {specimen.telemetryNodes.map((node) => (
                        <li
                          key={node.label}
                          className="flex items-center justify-between text-xs text-[#D5D4CE]"
                        >
                          <span>{node.label}</span>
                          <span className="font-mono tabular-nums text-[#7DD3FC]">
                            {node.value}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <MagneticButton
                  type="button"
                  onClick={() => onCommissionSpecimen(specimen)}
                  cursorLabel="INQUIRE"
                  className="w-full justify-center rounded-lg bg-[#E84A27] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#D23F1E]"
                >
                  <span>Commission Similar System</span>
                  <ArrowUpRight className="h-4 w-4" />
                </MagneticButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
