import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

/**
 * Visual stepper showing the 3 main steps of the generation workflow.
 * Helps admin understand exactly what to do next.
 */
export default function GeneratorWorkflowStepper({ selectedCount = 0, hasConfig = false }) {
  const steps = [
    {
      num: 1,
      label: 'Pilih Subjek',
      hint: 'Tap subjek yang nak digenerate',
      done: selectedCount > 0,
      active: selectedCount === 0,
    },
    {
      num: 2,
      label: 'Set Target',
      hint: 'Tetapkan bilangan games & soalan',
      done: selectedCount > 0 && hasConfig,
      active: selectedCount > 0 && !hasConfig,
    },
    {
      num: 3,
      label: 'Queue Generation',
      hint: 'Klik butang queue di bawah',
      done: false,
      active: selectedCount > 0 && hasConfig,
    },
  ];

  return (
    <div className="mb-4 rounded-2xl border border-white/15 bg-white/[0.06] p-3 md:p-4">
      <div className="flex items-center justify-between gap-2 md:gap-3">
        {steps.map((step, i) => (
          <React.Fragment key={step.num}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <motion.div
                  initial={false}
                  animate={{
                    scale: step.active ? 1.05 : 1,
                    backgroundColor: step.done ? '#34d399' : step.active ? '#fbbf24' : 'rgba(255,255,255,0.12)',
                  }}
                  className="w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
                >
                  {step.done ? (
                    <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-950" strokeWidth={3} />
                  ) : (
                    <span className={`text-[11px] md:text-xs font-black ${step.active ? 'text-yellow-950' : 'text-white/50'}`}>
                      {step.num}
                    </span>
                  )}
                </motion.div>
                <p className={`text-[11px] md:text-xs font-black truncate ${step.active || step.done ? 'text-white' : 'text-white/45'}`}>
                  {step.label}
                </p>
              </div>
              <p className="text-[10px] md:text-[11px] text-white/45 font-semibold leading-tight pl-8 md:pl-9">
                {step.hint}
              </p>
            </div>
            {i < steps.length - 1 && (
              <div className={`hidden md:block h-px flex-shrink-0 w-6 md:w-10 transition-colors ${step.done ? 'bg-green-300/60' : 'bg-white/15'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}