import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { MagneticButton } from './MagneticButton';
import { soundEngine } from '../utils/soundEngine';

export type PageRoute = 'overview' | 'archive' | 'lab' | 'commission';

interface TopBarProps {
  activePage: PageRoute;
  onNavigate: (page: PageRoute) => void;
}

const NAV_ITEMS: { id: PageRoute; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'archive', label: 'Archive' },
  { id: 'lab', label: 'Optics Lab' },
  { id: 'commission', label: 'Commission' },
];

export const TopBar: React.FC<TopBarProps> = ({ activePage, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (page: PageRoute) => {
    soundEngine.playDetent(520);
    setMobileMenuOpen(false);
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#1E1E24] bg-[#0B0B0D]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-5 py-3.5 sm:gap-8 sm:px-6 sm:py-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => handleNav('overview')}
          data-cursor="HOME"
          className="font-display text-lg font-bold tracking-tight text-[#F4F3EF] whitespace-nowrap shrink-0 cursor-pointer transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E84A27]"
        >
          Kineta Atelier
        </button>

        {/* Zone 2: 4 clean single-line text navigation links (Desktop) */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-8"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                data-cursor="VIEW"
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-1.5 text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E84A27] ${
                  isActive ? 'text-[#F4F3EF]' : 'text-[#9A9891] hover:text-[#F4F3EF]'
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-active-underline"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute inset-x-0 -bottom-0.5 h-[2px] bg-[#E84A27]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action (Desktop) + Mobile menu toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <MagneticButton
            type="button"
            onClick={() => handleNav('commission')}
            cursorLabel="START"
            className="hidden md:inline-flex rounded-lg bg-[#E84A27] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#D23F1E]"
          >
            Start Project
          </MagneticButton>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#24242C] bg-[#141418] text-[#F4F3EF] md:hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E84A27]"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-[#1E1E24] bg-[#0E0E12] md:hidden"
          >
            <nav
              aria-label="Mobile navigation"
              className="flex flex-col gap-1 px-5 py-4"
            >
              {NAV_ITEMS.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNav(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#191920] text-[#F4F3EF]'
                        : 'text-[#9A9891] hover:text-[#F4F3EF]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[#E84A27]" />}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => handleNav('commission')}
                className="mt-2 rounded-lg bg-[#E84A27] px-4 py-2.5 text-center text-xs font-semibold text-white"
              >
                Start Project
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
