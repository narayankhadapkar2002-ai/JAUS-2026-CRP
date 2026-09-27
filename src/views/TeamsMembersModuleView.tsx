import React, { useState, useEffect } from 'react';
import { Users, FolderKanban, CheckSquare, BarChart2, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MembersView } from './MembersView';
import { TeamsTasksView } from './TeamsTasksView';
import { MemberReportsView } from './MemberReportsView';

interface TeamsMembersModuleViewProps {
  initialSubTab?: string;
  onNavigateSub?: (tab: string) => void;
}

export const TeamsMembersModuleView: React.FC<TeamsMembersModuleViewProps> = ({ 
  initialSubTab = 'org-members',
  onNavigateSub 
}) => {
  const { currentUser, tasks } = useApp();
  const isAdmin = currentUser?.category === 'CM';

  // Normalize subTab
  const getNormalizedTab = (tab: string) => {
    if (tab === 'org-teams') return 'teams';
    if (tab === 'org-tasks') return 'tasks';
    if (tab === 'org-reports') return 'reports';
    return 'members';
  };

  const [activeSubTab, setActiveSubTab] = useState<'members' | 'teams' | 'tasks' | 'reports'>(
    getNormalizedTab(initialSubTab)
  );

  useEffect(() => {
    setActiveSubTab(getNormalizedTab(initialSubTab));
  }, [initialSubTab]);

  const handleTabChange = (tab: 'members' | 'teams' | 'tasks' | 'reports') => {
    setActiveSubTab(tab);
    if (onNavigateSub) {
      if (tab === 'members') onNavigateSub('org-members');
      else if (tab === 'teams') onNavigateSub('org-teams');
      else if (tab === 'tasks') onNavigateSub('org-tasks');
      else if (tab === 'reports') onNavigateSub('org-reports');
    }
  };

  const pendingTasksCount = tasks.filter(t => t.status !== 'Completed').length;

  return (
    <div className="flex flex-col min-h-full">
      {/* Module Sub-Navigation Bar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Teams & Members Module
              </h2>
              <p className="text-[11px] text-slate-500">
                Member directory, department hierarchy, tasks & responsibilities
              </p>
            </div>
          </div>

          {/* Sub Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => handleTabChange('members')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeSubTab === 'members'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Members Directory</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('teams')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeSubTab === 'teams'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Teams & Departments</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('tasks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeSubTab === 'tasks'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Tasks & Duties</span>
              {pendingTasksCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeSubTab === 'tasks' ? 'bg-amber-800 text-white' : 'bg-amber-100 text-amber-800'
                }`}>
                  {pendingTasksCount}
                </span>
              )}
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => handleTabChange('reports')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeSubTab === 'reports'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Reports & Analytics</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1">
        {activeSubTab === 'members' && <MembersView />}
        {activeSubTab === 'teams' && <TeamsTasksView initialTab="teams" />}
        {activeSubTab === 'tasks' && <TeamsTasksView initialTab="tasks" />}
        {activeSubTab === 'reports' && isAdmin && <MemberReportsView />}
      </div>
    </div>
  );
};
