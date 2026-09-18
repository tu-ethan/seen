'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface ProcessingViewProps {
  onComplete: () => void;
}

export function ProcessingView({ onComplete }: ProcessingViewProps) {
  const [step, setStep] = useState(0);

  const steps = [
    'Transcribing conversation...',
    'Identifying contributors...',
    'Extracting work completed...',
    'Connecting to projects...',
    'Building contribution history...'
  ];

  useEffect(() => {
    if (step < steps.length) {
      const timer = setTimeout(() => {
        setStep(s => s + 1);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [step, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
        <h2 className="text-2xl font-medium text-white mb-2">Processing Meeting</h2>
        <p className="text-zinc-400">Gemini is analyzing the transcript for contributions.</p>
      </div>

      <div className="w-full max-w-md p-6 rounded-xl border border-[#27272A] bg-[#141416] flex flex-col gap-4">
        {steps.map((text, index) => {
          const isComplete = step > index;
          const isActive = step === index;
          
          return (
            <div key={index} className={`flex items-center gap-3 ${isActive ? 'text-white' : isComplete ? 'text-emerald-400' : 'text-zinc-600'}`}>
              {isComplete ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : isActive ? (
                <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-zinc-700" />
              )}
              <span className={isActive ? 'font-medium' : ''}>{text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
