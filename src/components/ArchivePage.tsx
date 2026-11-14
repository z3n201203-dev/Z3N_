import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SPECIMENS, type SpecimenCategory, type SpecimenItem } from '../data/specimens';
import { FluidXRayLens } from './FluidXRayLens';
import { soundEngine } from '../utils/soundEngine';

interface ArchivePageProps {
  onInspectSpecimen: (specimen: SpecimenItem) => void;
}

type FilterValue = 'All' | SpecimenCategory;

const FILTERS: FilterValue[] = ['All', 'Horology', 'Acoustics', 'Dynamics'];

export const ArchivePage: React.FC<ArchivePageProps> = ({ onInspectSpecimen }) => {
  const [activeFilter, setActiveFilter] = useState<FilterValue>('All');

  const filtered =
    activeFilter === 'All'
      ? SPECIMENS
      : SPECIMENS.filter((item) => item.category === activeFilter);

  const handleFilterChange = (next: FilterValue) => {
    soundEngine.playDetent(560);
    setActiveFilter(next);
  };

  return (
    <section
      data-page="archive"
      className="mx-auto max-w-[1320px] px-6 pt-12 pb-24 lg:pt-16"
    >
      <div className="flex flex-col justify-between gap-6 border-b border-[#1E1E24] pb-8 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-medium text-[#9A9891]">
            Selected Specimens · 2025–2026
          </p>
          <h1 className="mt-2 font-display text-[clamp(2rem,3.6vw,3.25rem)] font-bold tracking-tight text-[#F4F3EF] text-balance">
            Radiographic Work Archive
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#B8B6AE]">
            Every specimen below responds to pointer proximity. Glide near any plate to initiate fluid X-ray refraction, or select a card to open its full engineering dossier.
          </p>
        </div>

        {/* Interactive Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter specimens by discipline"
          className="inline-flex items-center gap-1 self-start rounded-xl border border-[#222229] bg-[#121216] p-1"
        >
          {FILTERS.map((filter) => {
            const selected = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => handleFilterChange(filter)}
                data-cursor="FILTER"
                className={`relative rounded-lg px-3.5 py-2 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E84A27] ${
                  selected ? 'text-white' : 'text-[#9A9891] hover:text-[#F4F3EF]'
                }`}
              >
                {selected && (
                  <motion.span
                    layoutId="archive-filter-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-lg bg-[#E84A27]"
                  />
                )}
                <span className="relative z-10">{filter}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Bento Grid */}
      <div
        data-testid="archive-grid"
        className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-12"
      >
        {filtered.map((specimen, idx) => {
          const spanClass =
            idx === 0 || (activeFilter === 'All' && idx === 2)
              ? 'lg:col-span-7'
              : 'lg:col-span-5';
          return (
            <motion.div
              key={specimen.id}
              layout
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: idx * 0.04,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={spanClass}
            >
              <FluidXRayLens
                specimen={specimen}
                proximityThreshold={180}
                apertureRadius={145}
                aspectClassName="aspect-[4/3] lg:aspect-auto lg:h-[390px]"
                onInspect={onInspectSpecimen}
              />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
