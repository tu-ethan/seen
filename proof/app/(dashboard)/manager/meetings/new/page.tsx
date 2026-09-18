'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewMeetingPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [project, setProject] = useState('Project Nova');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, POST to /api/meetings then redirect to the recording page
    // For demo, we'll just redirect to a mock recording page
    router.push('/manager/meetings/demo-recording');
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-medium text-white mb-2">New Meeting</h1>
        <p className="text-zinc-400">Set up a new meeting to record and extract contributions.</p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 rounded-xl border border-[#27272A] bg-[#141416]">
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="text-sm font-medium text-zinc-200">Meeting Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Weekly Sync"
            required
            className="px-4 py-2.5 rounded-lg bg-[#0F0F10] border border-[#27272A] text-white focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="project" className="text-sm font-medium text-zinc-200">Related Project</label>
          <select
            id="project"
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="px-4 py-2.5 rounded-lg bg-[#0F0F10] border border-[#27272A] text-white focus:outline-none focus:border-violet-500 transition-colors appearance-none"
          >
            <option value="Project Nova">Project Nova</option>
            <option value="Project Atlas">Project Atlas</option>
            <option value="Project Orbit">Project Orbit</option>
            <option value="None">None (General)</option>
          </select>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-zinc-200">Participants</label>
          <div className="flex flex-col gap-2">
            {['Maya Chen (Senior Product Engineer)', 'Daniel Park (Software Engineer)', 'Alex Rivera (Product Manager)'].map((p) => (
              <label key={p} className="flex items-center gap-3 p-3 rounded-lg border border-[#27272A] hover:bg-[#1A1A1D] cursor-pointer transition-colors">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-[#27272A] text-violet-500 focus:ring-violet-500/20 bg-[#0F0F10]" />
                <span className="text-zinc-300 text-sm">{p}</span>
              </label>
            ))}
          </div>
        </div>

        <button 
          type="submit"
          className="w-full mt-4 py-3 px-4 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-colors"
        >
          Start Recording
        </button>
      </form>
    </div>
  );
}
