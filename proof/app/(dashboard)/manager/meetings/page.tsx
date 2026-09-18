import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function MeetingsPage() {
  const meetings = [
    { id: '1', title: 'Pricing Review Sync', project: 'Project Nova', date: 'Today, 10:00 AM', status: 'COMPLETE', participants: ['MC', 'DP', 'AR'], contributions: 12 },
    { id: '2', title: 'Mobile App Kickoff', project: 'Project Orbit', date: 'Yesterday', status: 'COMPLETE', participants: ['MC', 'AR'], contributions: 8 },
    { id: '3', title: 'Weekly Standup', project: 'General', date: '2 days ago', status: 'COMPLETE', participants: ['JL', 'MC', 'DP', 'AR'], contributions: 5 },
  ];

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium text-white mb-2">Meetings</h1>
          <p className="text-zinc-400">Record and analyze team conversations.</p>
        </div>
        <Link 
          href="/manager/meetings/new"
          className="flex items-center gap-2 py-2 px-4 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Start New Meeting
        </Link>
      </header>

      <div className="border border-[#27272A] bg-[#141416] rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#1A1A1D] border-b border-[#27272A] text-zinc-400">
            <tr>
              <th className="px-6 py-4 font-medium">Meeting</th>
              <th className="px-6 py-4 font-medium">Project</th>
              <th className="px-6 py-4 font-medium">Participants</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Extracted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272A]">
            {meetings.map((meeting) => (
              <tr key={meeting.id} className="hover:bg-[#1A1A1D] transition-colors">
                <td className="px-6 py-4">
                  <Link href={`/manager/meetings/${meeting.id}`} className="font-medium text-white hover:text-violet-400">
                    {meeting.title}
                  </Link>
                  <div className="text-zinc-500 mt-1">{meeting.date}</div>
                </td>
                <td className="px-6 py-4 text-zinc-300">{meeting.project}</td>
                <td className="px-6 py-4">
                  <div className="flex -space-x-2">
                    {meeting.participants.map((p, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-violet-500/20 border-2 border-[#141416] text-violet-400 flex items-center justify-center text-xs font-medium">
                        {p}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                    {meeting.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-300">
                  {meeting.contributions} contributions
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
