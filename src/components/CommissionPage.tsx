import React, { useState } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import {
  validateCommissionForm,
  type CommissionFormInput,
} from '../utils/xrayPhysics';
import { MagneticButton } from './MagneticButton';
import { soundEngine } from '../utils/soundEngine';

interface CommissionPageProps {
  initialSubject?: string;
}

const DISCIPLINE_OPTIONS = [
  'Fluid Optics & UI',
  'Kinetic Product Showcase',
  'Interactive Hardware Configurator',
  'Bespoke Web Instrument',
];

const TIMELINE_OPTIONS = ['4–6 Weeks', 'Q1 2027', 'Q2 2027', 'Flexible'];

export const CommissionPage: React.FC<CommissionPageProps> = ({
  initialSubject = '',
}) => {
  const [form, setForm] = useState<CommissionFormInput>({
    name: '',
    email: '',
    organization: '',
    discipline: 'Fluid Optics & UI',
    timeline: '4–6 Weeks',
    brief: initialSubject
      ? `Interested in a proximity X-ray system inspired by ${initialSubject}. `
      : '',
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof CommissionFormInput, string>>
  >({});
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateCommissionForm(form);
    if (!result.valid) {
      soundEngine.playDetent(240);
      setErrors(result.errors);
      return;
    }
    soundEngine.playDetent(720);
    setErrors({});
    setSubmittedRef(
      `KA-${Math.floor(1000 + Math.random() * 9000)}`
    );
  };

  const resetForm = () => {
    setSubmittedRef(null);
    setForm({
      name: '',
      email: '',
      organization: '',
      discipline: 'Fluid Optics & UI',
      timeline: '4–6 Weeks',
      brief: '',
    });
    setErrors({});
  };

  return (
    <section
      data-page="commission"
      className="mx-auto max-w-[1320px] px-6 pt-12 pb-24 lg:pt-16"
    >
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Left Studio Brief */}
        <div className="space-y-6 lg:col-span-5">
          <div>
            <p className="text-xs font-medium text-[#9A9891]">
              New Studio Commissions
            </p>
            <h1 className="mt-2 font-display text-[clamp(2rem,3.6vw,3.25rem)] font-bold leading-tight tracking-tight text-[#F4F3EF] text-balance">
              Commission a tactile optical system
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-[#B8B6AE]">
              We partner with engineering teams, horology houses, acoustic laboratories, and flagship brands to design high-responsiveness interactive websites and real-time radiographic configurators.
            </p>
          </div>

          <div className="space-y-4 border-t border-[#1E1E24] pt-6 text-sm">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[#9A9891]">Zurich Studio</span>
              <span className="font-mono text-xs text-[#E4E3DD]">
                Limmatquai 94, 8001 Zürich
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[#9A9891]">Kyoto Lab</span>
              <span className="font-mono text-xs text-[#E4E3DD]">
                Nakagyo-ku, Kyoto 604-8006
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[#9A9891]">Direct Desk</span>
              <span className="font-mono text-xs text-[#7DD3FC]">
                studio@kineta-atelier.ch
              </span>
            </div>
          </div>
        </div>

        {/* Right Form / Confirmation */}
        <div className="lg:col-span-7">
          {submittedRef ? (
            <div
              data-testid="commission-confirmation"
              className="rounded-2xl border border-[#26323D] bg-[#10141A] p-8 sm:p-10"
            >
              <CheckCircle2 className="h-9 w-9 text-[#7DD3FC]" />
              <h2 className="mt-4 font-display text-2xl font-bold text-[#F4F3EF]">
                Commission dossier logged
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#B8B6AE]">
                Thank you, {form.name}. Your brief for <span className="text-[#F4F3EF]">{form.discipline}</span> has been queued under reference{' '}
                <span className="font-mono text-[#7DD3FC]">{submittedRef}</span>. Our lead optical engineer responds within one business day.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 border-y border-[#1F2730] py-4 text-xs sm:grid-cols-3">
                <div>
                  <span className="block text-[#9A9891]">Contact</span>
                  <span className="mt-1 block font-medium text-[#F4F3EF]">
                    {form.email}
                  </span>
                </div>
                <div>
                  <span className="block text-[#9A9891]">Discipline</span>
                  <span className="mt-1 block font-medium text-[#F4F3EF]">
                    {form.discipline}
                  </span>
                </div>
                <div>
                  <span className="block text-[#9A9891]">Target Window</span>
                  <span className="mt-1 block font-medium text-[#F4F3EF]">
                    {form.timeline}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="mt-6 rounded-lg border border-[#2C333E] bg-[#171C24] px-4 py-2.5 text-xs font-medium text-[#F4F3EF] transition-colors hover:border-[#E84A27] cursor-pointer"
              >
                Submit Another Inquiry
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-6 rounded-2xl border border-[#222229] bg-[#111115] p-6 sm:p-8"
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="commission-name"
                    className="block text-xs font-medium text-[#D5D4CE]"
                  >
                    Full Name
                  </label>
                  <input
                    id="commission-name"
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Elena Vance"
                    className="mt-2 w-full rounded-lg border border-[#27272F] bg-[#0B0B0D] px-3.5 py-2.5 text-sm text-[#F4F3EF] placeholder:text-[#63625C] focus:border-[#E84A27] focus:outline-none"
                  />
                  {errors.name && (
                    <p role="alert" className="mt-1.5 text-xs text-[#FB7185]">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="commission-email"
                    className="block text-xs font-medium text-[#D5D4CE]"
                  >
                    Work Email
                  </label>
                  <input
                    id="commission-email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="elena@helvetia.ch"
                    className="mt-2 w-full rounded-lg border border-[#27272F] bg-[#0B0B0D] px-3.5 py-2.5 text-sm text-[#F4F3EF] placeholder:text-[#63625C] focus:border-[#E84A27] focus:outline-none"
                  />
                  {errors.email && (
                    <p role="alert" className="mt-1.5 text-xs text-[#FB7185]">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="commission-org"
                  className="block text-xs font-medium text-[#D5D4CE]"
                >
                  Organization or Studio (Optional)
                </label>
                <input
                  id="commission-org"
                  type="text"
                  value={form.organization}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, organization: e.target.value }))
                  }
                  placeholder="Helvetia Acoustics AG"
                  className="mt-2 w-full rounded-lg border border-[#27272F] bg-[#0B0B0D] px-3.5 py-2.5 text-sm text-[#F4F3EF] placeholder:text-[#63625C] focus:border-[#E84A27] focus:outline-none"
                />
              </div>

              <div>
                <span className="block text-xs font-medium text-[#D5D4CE]">
                  Primary Discipline
                </span>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {DISCIPLINE_OPTIONS.map((option) => {
                    const active = form.discipline === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          soundEngine.playDetent(560);
                          setForm((prev) => ({ ...prev, discipline: option }));
                        }}
                        className={`rounded-lg border px-3.5 py-2 text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                          active
                            ? 'border-[#E84A27] bg-[#E84A27]/15 text-white'
                            : 'border-[#27272F] bg-[#16161B] text-[#9A9891] hover:border-[#3A3A46] hover:text-[#F4F3EF]'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
                {errors.discipline && (
                  <p role="alert" className="mt-1.5 text-xs text-[#FB7185]">
                    {errors.discipline}
                  </p>
                )}
              </div>

              <div>
                <span className="block text-xs font-medium text-[#D5D4CE]">
                  Target Delivery Window
                </span>
                <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {TIMELINE_OPTIONS.map((win) => {
                    const active = form.timeline === win;
                    return (
                      <button
                        key={win}
                        type="button"
                        onClick={() => {
                          soundEngine.playDetent(580);
                          setForm((prev) => ({ ...prev, timeline: win }));
                        }}
                        className={`rounded-lg border px-3 py-2 text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                          active
                            ? 'border-[#7DD3FC] bg-[#7DD3FC]/12 text-[#E0F2FE]'
                            : 'border-[#27272F] bg-[#16161B] text-[#9A9891] hover:border-[#3A3A46] hover:text-[#F4F3EF]'
                        }`}
                      >
                        {win}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="commission-brief"
                  className="block text-xs font-medium text-[#D5D4CE]"
                >
                  Project Scope &amp; Interactive Goals
                </label>
                <textarea
                  id="commission-brief"
                  rows={4}
                  value={form.brief}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, brief: e.target.value }))
                  }
                  placeholder="Describe the hardware, spatial interaction, or X-ray visualization you want to build..."
                  className="mt-2 w-full rounded-lg border border-[#27272F] bg-[#0B0B0D] px-3.5 py-2.5 text-sm text-[#F4F3EF] placeholder:text-[#63625C] focus:border-[#E84A27] focus:outline-none"
                />
                {errors.brief && (
                  <p role="alert" className="mt-1.5 text-xs text-[#FB7185]">
                    {errors.brief}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <span className="text-xs text-[#9A9891]">
                  NDA-ready technical review included
                </span>
                <MagneticButton
                  type="submit"
                  cursorLabel="SEND"
                  className="rounded-lg bg-[#E84A27] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#D23F1E]"
                >
                  <span>Send Project Brief</span>
                  <ArrowRight className="h-4 w-4" />
                </MagneticButton>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
