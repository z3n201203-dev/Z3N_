import React, { useState } from 'react';
import { Volume2, VolumeX, SlidersHorizontal, ArrowUpRight } from 'lucide-react';
import { SPECIMENS, type SpecimenItem } from '../data/specimens';
import { FluidXRayLens } from './FluidXRayLens';
import { MagneticButton } from './MagneticButton';
import { soundEngine } from '../utils/soundEngine';

interface OpticsLabPageProps {
  onInspectSpecimen: (specimen: SpecimenItem) => void;
}

type XRayMode = 'proximity' | 'full' | 'split';

export const OpticsLabPage: React.FC<OpticsLabPageProps> = ({
  onInspectSpecimen,
}) => {
  const [selectedId, setSelectedId] = useState(SPECIMENS[0].id);
  const [proximityThreshold, setProximityThreshold] = useState(210);
  const [apertureRadius, setApertureRadius] = useState(165);
  const [viscosity, setViscosity] = useState(0.55);
  const [mode, setMode] = useState<XRayMode>('proximity');
  const [audioEnabled, setAudioEnabled] = useState(soundEngine.isEnabled());
  const [telemetry, setTelemetry] = useState({
    distance: 0,
    intensity: 0,
    velocity: 0,
  });

  const activeSpecimen =
    SPECIMENS.find((s) => s.id === selectedId) || SPECIMENS[0];

  const handleToggleAudio = () => {
    const next = !audioEnabled;
    soundEngine.setEnabled(next);
    setAudioEnabled(next);
    if (next) soundEngine.playDetent(660);
  };

  return (
    <section
      data-page="lab"
      className="mx-auto max-w-[1320px] px-6 pt-12 pb-24 lg:pt-16"
    >
      <div className="flex flex-col justify-between gap-6 border-b border-[#1E1E24] pb-8 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-medium text-[#9A9891]">
            Interactive Calibration Bench
          </p>
          <h1 className="mt-2 font-display text-[clamp(2rem,3.6vw,3.25rem)] font-bold tracking-tight text-[#F4F3EF] text-balance">
            Fluid X-Ray Optics Lab
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#B8B6AE]">
            Tune the proximity wake radius, fluid membrane aperture, and spring viscosity below, then move your pointer toward and across the specimen frame.
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggleAudio}
          aria-pressed={audioEnabled}
          data-cursor="AUDIO"
          className="inline-flex items-center gap-2 self-start rounded-lg border border-[#27272F] bg-[#141418] px-4 py-2.5 text-xs font-medium text-[#F4F3EF] transition-colors hover:border-[#E84A27] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E84A27]"
        >
          {audioEnabled ? (
            <Volume2 className="h-4 w-4 text-[#E84A27]" />
          ) : (
            <VolumeX className="h-4 w-4 text-[#9A9891]" />
          )}
          <span>{audioEnabled ? 'Tactile Audio On' : 'Tactile Audio Off'}</span>
        </button>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Calibration Controls Column */}
        <aside className="space-y-6 rounded-2xl border border-[#222229] bg-[#111115] p-6 lg:col-span-4">
          <div className="flex items-center justify-between border-b border-[#1E1E24] pb-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-[#E84A27]" />
              <h2 className="font-display text-base font-semibold text-[#F4F3EF]">
                Optical Parameters
              </h2>
            </div>
            <span className="font-mono text-xs text-[#7DD3FC] tabular-nums">
              {activeSpecimen.code}
            </span>
          </div>

          {/* Specimen Selector */}
          <div>
            <span className="block text-xs font-medium text-[#9A9891]">
              Specimen Plate
            </span>
            <div className="mt-2.5 grid grid-cols-1 gap-2">
              {SPECIMENS.slice(0, 3).map((item) => {
                const isSelected = item.id === activeSpecimen.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playDetent(520);
                      setSelectedId(item.id);
                    }}
                    data-cursor="SELECT"
                    className={`flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-left text-xs font-medium transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E84A27] ${
                      isSelected
                        ? 'border-[#E84A27] bg-[#E84A27]/12 text-[#F4F3EF]'
                        : 'border-[#222229] bg-[#16161B] text-[#B8B6AE] hover:border-[#34343E] hover:text-[#F4F3EF]'
                    }`}
                  >
                    <span className="truncate">{item.title}</span>
                    <span className="font-mono text-[11px] text-[#9A9891] shrink-0">
                      {item.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lens Mode Switch */}
          <div>
            <span className="block text-xs font-medium text-[#9A9891]">
              Radiograph Mode
            </span>
            <div className="mt-2.5 grid grid-cols-3 gap-1 rounded-lg border border-[#222229] bg-[#16161B] p-1">
              {(
                [
                  { id: 'proximity', label: 'Fluid' },
                  { id: 'split', label: 'Split' },
                  { id: 'full', label: 'Full X-Ray' },
                ] as { id: XRayMode; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playDetent(600);
                    setMode(opt.id);
                  }}
                  className={`rounded-md py-2 text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                    mode === opt.id
                      ? 'bg-[#E84A27] text-white'
                      : 'text-[#9A9891] hover:text-[#F4F3EF]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-5 border-t border-[#1E1E24] pt-5">
            <div>
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="proximity-slider" className="font-medium text-[#D5D4CE]">
                  Proximity Wake Distance
                </label>
                <span className="font-mono tabular-nums text-[#7DD3FC]">
                  {proximityThreshold} px
                </span>
              </div>
              <input
                id="proximity-slider"
                type="range"
                min={60}
                max={340}
                step={10}
                value={proximityThreshold}
                onChange={(e) => setProximityThreshold(Number(e.target.value))}
                className="mt-2 w-full accent-[#E84A27] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="aperture-slider" className="font-medium text-[#D5D4CE]">
                  Fluid Aperture Radius
                </label>
                <span className="font-mono tabular-nums text-[#7DD3FC]">
                  {apertureRadius} px
                </span>
              </div>
              <input
                id="aperture-slider"
                type="range"
                min={80}
                max={250}
                step={5}
                value={apertureRadius}
                onChange={(e) => setApertureRadius(Number(e.target.value))}
                className="mt-2 w-full accent-[#E84A27] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="viscosity-slider" className="font-medium text-[#D5D4CE]">
                  Fluid Viscosity
                </label>
                <span className="font-mono tabular-nums text-[#7DD3FC]">
                  {viscosity.toFixed(2)} Pa·s
                </span>
              </div>
              <input
                id="viscosity-slider"
                type="range"
                min={0.2}
                max={0.95}
                step={0.05}
                value={viscosity}
                onChange={(e) => setViscosity(Number(e.target.value))}
                className="mt-2 w-full accent-[#E84A27] cursor-pointer"
              />
            </div>
          </div>

          {/* Live Optical Field Telemetry */}
          <div className="grid grid-cols-3 gap-3 border-t border-[#1E1E24] pt-5">
            <div>
              <span className="block text-[11px] text-[#9A9891]">Distance</span>
              <span
                data-testid="lab-distance-readout"
                className="mt-1 block font-mono text-sm font-medium tabular-nums text-[#F4F3EF]"
              >
                {telemetry.distance} px
              </span>
            </div>
            <div>
              <span className="block text-[11px] text-[#9A9891]">Field Wake</span>
              <span
                data-testid="lab-intensity-readout"
                className="mt-1 block font-mono text-sm font-medium tabular-nums text-[#7DD3FC]"
              >
                {telemetry.intensity}%
              </span>
            </div>
            <div>
              <span className="block text-[11px] text-[#9A9891]">Velocity</span>
              <span className="mt-1 block font-mono text-sm font-medium tabular-nums text-[#F4F3EF]">
                {telemetry.velocity}
              </span>
            </div>
          </div>
        </aside>

        {/* Main Interactive Specimen Viewport */}
        <div className="space-y-5 lg:col-span-8">
          <FluidXRayLens
            specimen={activeSpecimen}
            proximityThreshold={proximityThreshold}
            apertureRadius={apertureRadius}
            viscosity={viscosity}
            mode={mode}
            onInspect={onInspectSpecimen}
            onTelemetryChange={setTelemetry}
          />

          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#1E1E24] bg-[#111115] p-5 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <h3 className="font-display text-base font-semibold text-[#F4F3EF]">
                {activeSpecimen.title} — {activeSpecimen.subtitle}
              </h3>
              <p className="text-xs leading-relaxed text-[#9A9891]">
                {activeSpecimen.architectureNote}
              </p>
            </div>
            <MagneticButton
              type="button"
              onClick={() => onInspectSpecimen(activeSpecimen)}
              cursorLabel="DOSSIER"
              className="rounded-lg border border-[#2C2C36] bg-[#18181E] px-4 py-2.5 text-xs font-medium text-[#F4F3EF] transition-colors hover:border-[#E84A27]"
            >
              <span>Full Dossier</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
};
