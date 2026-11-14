import React from 'react';
import { motion, type Variants } from 'motion/react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { SPECIMENS, type SpecimenItem } from '../data/specimens';
import { FluidXRayLens } from './FluidXRayLens';
import { MagneticButton } from './MagneticButton';
import { ParallaxStage } from './ParallaxStage';
import type { PageRoute } from './TopBar';

interface OverviewPageProps {
  onNavigate: (page: PageRoute) => void;
  onInspectSpecimen: (specimen: SpecimenItem) => void;
}

const STUDIO_METRICS = [
  { value: '0.004 mm', label: 'Radiographic Alignment Tolerance' },
  { value: '190 px', label: 'Proximity Fluid Wake Radius' },
  { value: '120 Hz', label: 'Damped Spring Solver Loop' },
  { value: '38', label: 'Commissioned Optical Instruments' },
];

const DISCIPLINES = [
  {
    index: '01.',
    title: 'Proximity Fluid Radiography',
    description:
      'Surfaces remain quiet until the viewer approaches within threshold distance. An organic liquid lens blooms along pointer velocity, peeling exterior finishes back to reveal calibrated internal assemblies.',
    proof: 'Zero-frame-drop SVG + canvas solver at 120 Hz',
  },
  {
    index: '02.',
    title: 'Multi-Depth Scroll & Cursor Parallax',
    description:
      'Every plate, typographic layer, and internal schematic responds along distinct Z-planes. Spring-damped transforms preserve physical inertia without triggering layout reflow.',
    proof: 'Compositor-only translate3d & perspective transforms',
  },
  {
    index: '03.',
    title: 'Tactile Detent Micro-Interactions',
    description:
      'Magnetic button attraction, velocity-reactive ribbon trails, expanding click shockwaves, and optional acoustic detents reward every gesture across desktop and touch surfaces.',
    proof: 'Sub-16ms pointer response with reduced-motion parity',
  },
];

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const heroColumnVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.04,
    },
  },
};

const heroItemVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.52,
      ease: EASE_OUT_EXPO,
    },
  },
};

const heroSpecimenVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.965 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.65,
      delay: 0.16,
      ease: EASE_OUT_EXPO,
    },
  },
};

const metricsGridVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.065,
      delayChildren: 0.32,
    },
  },
};

const metricItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: EASE_OUT_EXPO,
    },
  },
};

const sectionStaggerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.11,
      delayChildren: 0.05,
    },
  },
};

const sectionItemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.54,
      ease: EASE_OUT_EXPO,
    },
  },
};

export const OverviewPage: React.FC<OverviewPageProps> = ({
  onNavigate,
  onInspectSpecimen,
}) => {
  const heroSpecimen = SPECIMENS[0];
  const acousticSpecimen = SPECIMENS[1];
  const chassisSpecimen = SPECIMENS[2];

  return (
    <div data-page="overview" className="pb-24">
      {/* Hero Split Section */}
      <section className="mx-auto max-w-[1320px] px-6 pt-12 pb-12 lg:pt-16 lg:pb-16">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Typography & Primary Action */}
          <motion.div
            variants={heroColumnVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col justify-between lg:col-span-5"
          >
            <div>
              <motion.p
                variants={heroItemVariants}
                className="text-xs font-medium tracking-wide text-[#9A9891]"
              >
                Spatial Interaction Studio · Zurich &amp; Kyoto
              </motion.p>

              <motion.h1
                variants={heroItemVariants}
                className="mt-5 font-display text-[clamp(2.4rem,4.3vw,3.9rem)] font-bold leading-[1.04] tracking-tight text-[#F4F3EF] text-balance"
              >
                Surfaces conceal. Proximity reveals.
              </motion.h1>

              <motion.p
                variants={heroItemVariants}
                className="mt-6 max-w-lg text-base leading-relaxed text-[#B8B6AE]"
              >
                Kineta Atelier engineers kinetic web instruments where every cursor movement leaves a reactive fluid wake. Approach any specimen below to trigger its liquid X-ray lens and inspect the architecture beneath the shell.
              </motion.p>
            </div>

            <motion.div
              variants={heroItemVariants}
              className="mt-8 flex flex-wrap items-center gap-5"
            >
              <MagneticButton
                type="button"
                onClick={() => onNavigate('lab')}
                cursorLabel="OPEN LAB"
                className="rounded-lg bg-[#E84A27] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#D23F1E]"
              >
                <span>Open Optics Lab</span>
                <ArrowRight className="h-4 w-4" />
              </MagneticButton>

              <button
                type="button"
                onClick={() => onNavigate('archive')}
                data-cursor="ARCHIVE"
                className="inline-flex items-center gap-2 py-2.5 text-sm font-medium text-[#E4E3DD] underline-offset-4 transition-colors hover:text-white hover:underline whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E84A27]"
              >
                <span>Browse Work Archive</span>
                <ArrowUpRight className="h-4 w-4 text-[#9A9891]" />
              </button>
            </motion.div>
          </motion.div>

          {/* Right Dominant Hero Fluid X-Ray Specimen */}
          <motion.div
            variants={heroSpecimenVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 will-change-transform"
          >
            <FluidXRayLens
              specimen={heroSpecimen}
              proximityThreshold={210}
              apertureRadius={170}
              onInspect={onInspectSpecimen}
              className="h-full"
            />
          </motion.div>
        </div>

        {/* Full-Width 4-Column Studio Metrics Strip */}
        <motion.div
          variants={metricsGridVariants}
          initial="hidden"
          animate="visible"
          className="mt-12 grid grid-cols-2 gap-6 border-y border-[#1E1E24] py-7 lg:grid-cols-4"
        >
          {STUDIO_METRICS.map((metric) => (
            <motion.div
              key={metric.label}
              variants={metricItemVariants}
              className="space-y-1"
            >
              <div className="font-mono text-2xl font-medium tracking-tight tabular-nums text-[#F4F3EF]">
                {metric.value}
              </div>
              <div className="text-xs text-[#9A9891]">{metric.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Subtle Editorial Marquee Divider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.48 }}
        className="overflow-hidden border-y border-[#1A1A20] bg-[#0E0E12] py-3.5"
        aria-hidden="true"
      >
        <div className="flex w-max animate-kineta-marquee whitespace-nowrap text-xs font-medium tracking-wide text-[#7E7C75]">
          {Array.from({ length: 6 }).map((_, idx) => (
            <span key={idx} className="mx-6 inline-flex items-center gap-6">
              <span>Proximity Fluid Radiography</span>
              <span>·</span>
              <span>Damped Spring Parallax</span>
              <span>·</span>
              <span>Tactile Optical Instruments</span>
              <span>·</span>
            </span>
          ))}
        </div>
      </motion.div>

      {/* Multi-Depth Parallax Specimen Showcase */}
      <motion.section
        variants={sectionStaggerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="mx-auto max-w-[1320px] px-6 py-20"
      >
        <motion.div
          variants={sectionItemVariants}
          className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div>
            <p className="text-xs font-medium text-[#9A9891]">
              Featured Kinetic Specimens
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#F4F3EF] text-balance">
              Dual-layer assemblies built for close inspection
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('archive')}
            data-cursor="ALL WORKS"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#E84A27] hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E84A27]"
          >
            <span>View all 6 specimens</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <motion.div variants={sectionItemVariants} className="lg:col-span-5">
            <ParallaxStage offsetRange={24}>
              <FluidXRayLens
                specimen={acousticSpecimen}
                proximityThreshold={185}
                apertureRadius={150}
                onInspect={onInspectSpecimen}
              />
              <p className="mt-4 text-sm leading-relaxed text-[#9A9891]">
                {acousticSpecimen.summary}
              </p>
            </ParallaxStage>
          </motion.div>

          <motion.div variants={sectionItemVariants} className="lg:col-span-7 lg:pt-12">
            <ParallaxStage offsetRange={44}>
              <FluidXRayLens
                specimen={chassisSpecimen}
                proximityThreshold={195}
                apertureRadius={165}
                onInspect={onInspectSpecimen}
              />
              <p className="mt-4 text-sm leading-relaxed text-[#9A9891]">
                {chassisSpecimen.summary}
              </p>
            </ParallaxStage>
          </motion.div>
        </div>
      </motion.section>

      {/* Studio Disciplines — Editorial Numbering + Claim-to-Proof */}
      <motion.section
        variants={sectionStaggerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="mx-auto max-w-[1320px] px-6 pt-8"
      >
        <div className="border-t border-[#1E1E24] pt-16">
          <motion.div variants={sectionItemVariants} className="mb-10 max-w-2xl">
            <p className="text-xs font-medium text-[#9A9891]">Craft &amp; Engineering</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#F4F3EF] text-balance">
              Every interaction tuned like a mechanical escapement
            </h2>
          </motion.div>

          <div className="divide-y divide-[#1E1E24] border-y border-[#1E1E24]">
            {DISCIPLINES.map((item) => (
              <motion.div
                key={item.index}
                variants={sectionItemVariants}
                whileHover={{ x: 6 }}
                transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
                className="grid grid-cols-1 gap-4 py-8 lg:grid-cols-12 lg:items-baseline"
              >
                <div className="font-mono text-sm font-medium text-[#E84A27] lg:col-span-2">
                  {item.index}
                </div>
                <h3 className="font-display text-xl font-semibold text-[#F4F3EF] lg:col-span-4">
                  {item.title}
                </h3>
                <div className="space-y-2 lg:col-span-6">
                  <p className="text-sm leading-relaxed text-[#B8B6AE]">
                    {item.description}
                  </p>
                  <p className="font-mono text-xs text-[#7DD3FC]">{item.proof}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
};
