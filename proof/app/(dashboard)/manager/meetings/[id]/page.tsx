'use client';

import { useState } from 'react';
import { MeetingRecorder } from '@/components/meeting/MeetingRecorder';
import { ProcessingView } from '@/components/meeting/ProcessingView';
import ContributionCard from '@/components/dashboard/ContributionCard';
import { Users, Clock, Award } from 'lucide-react';

export default function MeetingPage({ params }: { params: { id: string } }) {
  const [status, setStatus] = useState<'RECORDING' | 'PROCESSING' | 'COMPLETE'>('RECORDING');

  if (status === 'RECORDING') {
    return <MeetingRecorder onStop={() => setStatus('PROCESSING')} />;
  }

  if (status === 'PROCESSING') {
    return <ProcessingView onComplete={() => setStatus('COMPLETE')} />;
  }

  // COMPLETE STATE
  const contributions = [
    {
      id: '1',
      type: 'IDEATION',
      title: 'Proposed offline mode architecture',
      description: 'Suggested a ServiceWorker caching approach for the mobile web view.',
      occurred_at: new Date().toISOString(),
      confidence: 0.88,
      project: { name: 'Project Orbit' },
      evidence: [],
      skills: ['System Design', 'PWA']
    },
    {
      id: '2',
      type: 'COLLABORATION',
      title: 'Aligned on API contract',
      description: 'Worked with frontend to finalize the GraphQL schema.',
      occurred_at: new Date().toISOString(),
      confidence: 0.92,
      project: { name: 'Project Orbit' },
      evidence: [],
      skills: ['API Design']
    }
  ];

  return (
    <div className="flex flex-col gap-8">
      <header className="p-6 rounded-xl border border-[#27272A] bg-[#141416]">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
            COMPLETE
          </span>
          <h1 className="text-2xl font-medium text-white">Mobile App Kickoff</h1>
        </div>
        
        <div className="flex items-center gap-6 text-sm text-zinc-400">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Today, 10:00 AM (45 min)</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>3 Participants</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span>2 Contributions Extracted</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 flex flex-col gap-6">
          <h2 className="text-xl font-medium text-white">Extracted Contributions</h2>
          <div className="flex flex-col gap-4">
            {contributions.map((c) => (
              <ContributionCard key={c.id} contribution={c as any} />
            ))}
          </div>
        </div>

        <div className="col-span-1 flex flex-col gap-6">
          <h2 className="text-xl font-medium text-white">Transcript snippet</h2>
          <div className="p-4 rounded-xl border border-[#27272A] bg-[#141416] text-sm text-zinc-300 space-y-4">
            <p><strong className="text-violet-400">Maya:</strong> What if we use a ServiceWorker to cache the GraphQL responses for offline mode?</p>
            <p><strong className="text-blue-400">Daniel:</strong> That makes sense. We can use workbox to handle the caching strategies.</p>
            <p><strong className="text-violet-400">Maya:</strong> Cool, I'll update the technical spec to include that.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
