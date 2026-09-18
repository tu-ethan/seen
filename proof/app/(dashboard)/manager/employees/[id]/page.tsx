'use client';

import { useState } from 'react';
import ContributionCard from '@/components/dashboard/ContributionCard';
import EvidenceDrawer from '@/components/dashboard/EvidenceDrawer';
import { FileText } from 'lucide-react';

export default function EmployeeProfile({ params }: { params: { id: string } }) {
  const [selectedContribution, setSelectedContribution] = useState<any | null>(null);

  // Demo Maya Chen profile
  const profile = {
    name: 'Maya Chen',
    role: 'Senior Product Engineer',
    joined: 'Jan 2024',
    manager: 'Jordan Lee',
    stats: {
      contributions: 42,
      projects: 4,
      deliverables: 15,
      skills: 12,
    },
    skills: [
      { name: 'React', count: 15 },
      { name: 'System Design', count: 8 },
      { name: 'Customer Research', count: 6 },
      { name: 'TypeScript', count: 12 },
      { name: 'UI/UX', count: 5 },
      { name: 'Mentoring', count: 3 },
    ]
  };

  const contributions = [
    {
      id: '1',
      type: 'EXECUTION',
      title: 'Implemented Pricing UI',
      description: 'Built the new dynamic pricing components for Project Nova.',
      occurred_at: new Date().toISOString(),
      confidence: 0.95,
      project: { name: 'Project Nova' },
      evidence: [{ id: 'e1', evidence_text: "I finished the pricing UI components, they're ready for review." }],
      skills: ['React', 'UI/UX']
    },
    {
      id: '2',
      type: 'IDEATION',
      title: 'Proposed offline mode architecture',
      description: 'Suggested a ServiceWorker caching approach for the mobile web view.',
      occurred_at: new Date(Date.now() - 86400000).toISOString(),
      confidence: 0.88,
      project: { name: 'Project Orbit' },
      evidence: [{ id: 'e2', evidence_text: "What if we use a ServiceWorker to cache the GraphQL responses for offline mode?" }],
      skills: ['System Design', 'PWA']
    },
    {
      id: '3',
      type: 'COLLABORATION',
      title: 'Paired with backend on API design',
      description: 'Worked with Daniel to finalize the GraphQL schema for the new onboarding flow.',
      occurred_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      confidence: 0.92,
      project: { name: 'Project Atlas' },
      evidence: [{ id: 'e3', evidence_text: "Daniel and I spent an hour figuring out the schema, we're aligned now." }],
      skills: ['API Design', 'Communication']
    }
  ];

  return (
    <div className="flex gap-8 items-start">
      <div className="w-64 shrink-0 flex flex-col gap-6">
        <div className="p-6 rounded-xl border border-[#27272A] bg-[#141416] flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center font-medium text-2xl mb-4">
            MC
          </div>
          <h1 className="text-xl font-medium text-white mb-1">{profile.name}</h1>
          <p className="text-sm text-zinc-400 mb-6">{profile.role}</p>

          <div className="w-full flex flex-col gap-3 text-sm border-t border-[#27272A] pt-4 text-left">
            <div>
              <span className="text-zinc-500 block mb-0.5">Joined</span>
              <span className="text-zinc-200">{profile.joined}</span>
            </div>
            <div>
              <span className="text-zinc-500 block mb-0.5">Manager</span>
              <span className="text-zinc-200">{profile.manager}</span>
            </div>
          </div>
        </div>

        <button className="w-full py-3 px-4 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
          <FileText className="w-4 h-4" />
          Generate Impact Report
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-8">
        <div className="grid grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-[#27272A] bg-[#141416]">
            <h3 className="font-medium text-sm text-zinc-400 mb-2">Total Contributions</h3>
            <p className="text-2xl font-semibold text-white">{profile.stats.contributions}</p>
          </div>
          <div className="p-5 rounded-xl border border-[#27272A] bg-[#141416]">
            <h3 className="font-medium text-sm text-zinc-400 mb-2">Projects Involved</h3>
            <p className="text-2xl font-semibold text-white">{profile.stats.projects}</p>
          </div>
          <div className="p-5 rounded-xl border border-[#27272A] bg-[#141416]">
            <h3 className="font-medium text-sm text-zinc-400 mb-2">Completed Work</h3>
            <p className="text-2xl font-semibold text-white">{profile.stats.deliverables}</p>
          </div>
          <div className="p-5 rounded-xl border border-[#27272A] bg-[#141416]">
            <h3 className="font-medium text-sm text-zinc-400 mb-2">Skills Assessed</h3>
            <p className="text-2xl font-semibold text-white">{profile.stats.skills}</p>
          </div>
        </div>

        <section>
          <h2 className="text-lg font-medium text-white mb-4">Skills Demonstrated</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map(skill => (
              <div key={skill.name} className="px-3 py-1.5 rounded-lg border border-[#27272A] bg-[#141416] text-sm flex items-center gap-2">
                <span className="text-zinc-200">{skill.name}</span>
                <span className="text-zinc-600">×{skill.count}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium text-white mb-4">Recent Contributions</h2>
          <div className="flex flex-col gap-3">
            {contributions.map(contribution => (
              <ContributionCard 
                key={contribution.id} 
                contribution={contribution as any} 
                onClick={() => setSelectedContribution(contribution)}
              />
            ))}
          </div>
        </section>
      </div>

      <EvidenceDrawer 
        item={selectedContribution} 
        onClose={() => setSelectedContribution(null)} 
      />
    </div>
  );
}
