'use client';

import { useState } from 'react';
import ContributionCard from '@/components/dashboard/ContributionCard';
import EvidenceDrawer from '@/components/dashboard/EvidenceDrawer';
import { Award, Briefcase, FileText, Share2 } from 'lucide-react';

export default function EmployeeDashboard() {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'morning' : currentHour < 18 ? 'afternoon' : 'evening';
  const [selectedContribution, setSelectedContribution] = useState<any | null>(null);

  const stats = {
    contributions: 42,
    projects: 4,
    deliverables: 15,
    crossTeam: 8,
  };

  const skills = [
    { name: 'React', count: 15 },
    { name: 'System Design', count: 8 },
    { name: 'Customer Research', count: 6 },
    { name: 'TypeScript', count: 12 },
    { name: 'UI/UX', count: 5 },
    { name: 'Mentoring', count: 3 },
  ];

  const recentContributions = [
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
    <div className="flex flex-col gap-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium text-white mb-2">Good {greeting}, Maya.</h1>
          <p className="text-zinc-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <button className="flex items-center gap-2 py-2 px-4 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-colors">
          <FileText className="w-5 h-5" />
          Generate Impact Report
        </button>
      </header>

      <div className="grid grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-[#27272A] bg-[#141416]">
          <div className="flex items-center gap-3 text-zinc-400 mb-3">
            <Award className="w-5 h-5" />
            <h3 className="font-medium text-sm">Contributions</h3>
          </div>
          <p className="text-3xl font-semibold text-white">{stats.contributions}</p>
        </div>
        <div className="p-5 rounded-xl border border-[#27272A] bg-[#141416]">
          <div className="flex items-center gap-3 text-zinc-400 mb-3">
            <Briefcase className="w-5 h-5" />
            <h3 className="font-medium text-sm">Projects</h3>
          </div>
          <p className="text-3xl font-semibold text-white">{stats.projects}</p>
        </div>
        <div className="p-5 rounded-xl border border-[#27272A] bg-[#141416]">
          <div className="flex items-center gap-3 text-zinc-400 mb-3">
            <FileText className="w-5 h-5" />
            <h3 className="font-medium text-sm">Completed Deliverables</h3>
          </div>
          <p className="text-3xl font-semibold text-white">{stats.deliverables}</p>
        </div>
        <div className="p-5 rounded-xl border border-[#27272A] bg-[#141416]">
          <div className="flex items-center gap-3 text-zinc-400 mb-3">
            <Share2 className="w-5 h-5" />
            <h3 className="font-medium text-sm">Cross-team Contributions</h3>
          </div>
          <p className="text-3xl font-semibold text-white">{stats.crossTeam}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 flex flex-col gap-6">
          <h2 className="text-xl font-medium text-white">Recent Contributions</h2>
          <div className="flex flex-col gap-4">
            {recentContributions.map((contribution) => (
              <ContributionCard 
                key={contribution.id} 
                contribution={contribution as any} 
                onClick={() => setSelectedContribution(contribution)}
              />
            ))}
          </div>
        </div>

        <div className="col-span-1 flex flex-col gap-6">
          <h2 className="text-xl font-medium text-white">Skills Demonstrated</h2>
          <div className="p-6 rounded-xl border border-[#27272A] bg-[#141416] flex flex-wrap gap-2">
            {skills.map(skill => (
              <div key={skill.name} className="px-3 py-1.5 rounded-lg border border-[#27272A] bg-[#1A1A1D] text-sm flex items-center gap-2">
                <span className="text-zinc-200">{skill.name}</span>
                <span className="text-zinc-500">×{skill.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <EvidenceDrawer 
        item={selectedContribution} 
        onClose={() => setSelectedContribution(null)} 
      />
    </div>
  );
}
