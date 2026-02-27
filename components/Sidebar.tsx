'use client';

import { Calendar, Users, Network, GitBranch, FileText } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { EditorType } from '@/types/project';

export default function Sidebar() {
  const { currentEditor, setCurrentEditor } = useProjectStore();

  const menuItems: { id: EditorType; label: string; icon: React.ReactNode }[] = [
    { id: 'gantt', label: 'Gantt Editor', icon: <Calendar className="w-5 h-5" /> },
    { id: 'raci', label: 'RACI Matrix', icon: <Users className="w-5 h-5" /> },
    { id: 'architecture', label: 'Architecture', icon: <Network className="w-5 h-5" /> },
    { id: 'flowchart', label: 'Flowchart', icon: <GitBranch className="w-5 h-5" /> },
    { id: 'templates', label: 'Templates', icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold">SaaS Editor</h1>
        <p className="text-sm text-gray-400 mt-1">Multi-Editor Platform</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setCurrentEditor(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentEditor === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          Built with Next.js & Zustand
        </p>
      </div>
    </div>
  );
}
