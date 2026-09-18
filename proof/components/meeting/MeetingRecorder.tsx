'use client';

import { useState, useEffect } from 'react';
import { Mic, Square } from 'lucide-react';

interface MeetingRecorderProps {
  onStop: () => void;
}

export function MeetingRecorder({ onStop }: MeetingRecorderProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-8">
      <div className="flex flex-col items-center gap-4">
        <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center animate-pulse">
          <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
            <Mic className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-medium text-white mb-2">Recording Meeting</h2>
          <p className="text-4xl font-mono text-zinc-300 tracking-wider">{formatTime(seconds)}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="w-10 h-10 rounded-full bg-violet-500/20 border-2 border-[#0F0F10] text-violet-400 flex items-center justify-center text-sm font-medium z-10">MC</div>
        <div className="w-10 h-10 rounded-full bg-violet-500/20 border-2 border-[#0F0F10] text-violet-400 flex items-center justify-center text-sm font-medium -ml-4 z-20">DP</div>
        <div className="w-10 h-10 rounded-full bg-violet-500/20 border-2 border-[#0F0F10] text-violet-400 flex items-center justify-center text-sm font-medium -ml-4 z-30">AR</div>
      </div>

      <div className="w-full max-w-xl p-6 rounded-xl border border-[#27272A] bg-[#141416] min-h-[200px] flex flex-col justify-end">
        <p className="text-zinc-500 italic text-sm mb-4">Live transcript...</p>
        <div className="space-y-3 text-sm">
          <p className="text-zinc-300"><strong className="text-violet-400">Maya:</strong> Okay, let's talk about the offline mode.</p>
          <p className="text-zinc-300"><strong className="text-blue-400">Daniel:</strong> Yeah, I was looking at the service worker implementation.</p>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={onStop}
          className="py-3 px-8 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <Square className="w-5 h-5 fill-current" />
          End Meeting
        </button>
        <button 
          onClick={onStop}
          className="py-3 px-6 rounded-xl bg-[#141416] border border-[#27272A] text-zinc-300 font-medium hover:bg-[#1A1A1D] transition-colors"
        >
          Use Demo Recording
        </button>
      </div>
    </div>
  );
}
