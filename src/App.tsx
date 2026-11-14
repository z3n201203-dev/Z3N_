import React, { useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';
import { FluidCursor } from './components/FluidCursor';
import { TopBar, type PageRoute } from './components/TopBar';
import { OverviewPage } from './components/OverviewPage';
import { ArchivePage } from './components/ArchivePage';
import { OpticsLabPage } from './components/OpticsLabPage';
import { CommissionPage } from './components/CommissionPage';
import { SpecimenModal } from './components/SpecimenModal';
import type { SpecimenItem } from './data/specimens';
import { soundEngine } from './utils/soundEngine';

export default function App() {
  const [activePage, setActivePage] = useState<PageRoute>('overview');
  const [inspectedSpecimen, setInspectedSpecimen] =
    useState<SpecimenItem | null>(null);
  const [commissionSubject, setCommissionSubject] = useState('');
  const [audioOn, setAudioOn] = useState(false);

  // Support optional ?autostart=1 or ?page=... query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page');
    if (
      pageParam === 'overview' ||
      pageParam === 'archive' ||
      pageParam === 'lab' ||
      pageParam === 'commission'
    ) {
      setActivePage(pageParam);
    }
  }, []);

  const handleCommissionSpecimen = (specimen: SpecimenItem) => {
    setInspectedSpecimen(null);
    setCommissionSubject(specimen.title);
    setActivePage('commission');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleAudio = () => {
    const next = !audioOn;
    soundEngine.setEnabled(next);
    setAudioOn(next);
    if (next) soundEngine.playDetent(640);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#0B0B0D] text-[#F4F3EF]">
        <FluidCursor />
        <TopBar activePage={activePage} onNavigate={setActivePage} />

        <main className="relative overflow-x-clip">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {activePage === 'overview' && (
                <OverviewPage
                  onNavigate={setActivePage}
                  onInspectSpecimen={setInspectedSpecimen}
                />
              )}
              {activePage === 'archive' && (
                <ArchivePage onInspectSpecimen={setInspectedSpecimen} />
              )}
              {activePage === 'lab' && (
                <OpticsLabPage onInspectSpecimen={setInspectedSpecimen} />
              )}
              {activePage === 'commission' && (
                <CommissionPage initialSubject={commissionSubject} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="border-t border-[#1A1A20] bg-[#0B0B0D]">
          <div className="mx-auto flex max-w-[1320px] flex-col items-start justify-between gap-4 px-6 py-8 text-xs text-[#8D8B84] sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-display font-semibold text-[#E4E3DD]">
                Kineta Atelier
              </span>
              <span aria-hidden="true">·</span>
              <span>Zurich &amp; Kyoto</span>
              <span aria-hidden="true">·</span>
              <span>© 2026 Kineta Atelier AG</span>
            </div>

            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={toggleAudio}
                aria-pressed={audioOn}
                className="inline-flex items-center gap-1.5 text-xs text-[#B8B6AE] transition-colors hover:text-[#F4F3EF] cursor-pointer"
              >
                {audioOn ? (
                  <Volume2 className="h-3.5 w-3.5 text-[#E84A27]" />
                ) : (
                  <VolumeX className="h-3.5 w-3.5" />
                )}
                <span>{audioOn ? 'Sound On' : 'Sound Off'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActivePage('lab');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-[#B8B6AE] transition-colors hover:text-[#F4F3EF] cursor-pointer"
              >
                Optics Lab
              </button>
              <button
                type="button"
                onClick={() => {
                  setActivePage('commission');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-[#B8B6AE] transition-colors hover:text-[#F4F3EF] cursor-pointer"
              >
                Commission
              </button>
            </div>
          </div>
        </footer>

        <SpecimenModal
          specimen={inspectedSpecimen}
          onClose={() => setInspectedSpecimen(null)}
          onCommissionSpecimen={handleCommissionSpecimen}
        />
      </div>
    </MotionConfig>
  );
}
