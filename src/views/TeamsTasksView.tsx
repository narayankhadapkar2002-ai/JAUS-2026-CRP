import React, { useState } from 'react';
import { 
  Users, 
  FolderKanban, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Edit2, 
  Trash2, 
  Check, 
  X,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Briefcase,
  History,
  Tag,
  Settings2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Team, Task, TaskStatus, Member } from '../types';

interface TeamsTasksViewProps {
  initialTab?: 'teams' | 'tasks';
}

export const TeamsTasksView: React.FC<TeamsTasksViewProps> = ({ initialTab = 'teams' }) => {
  const { 
    teams, 
    tasks, 
    members, 
    currentUser, 
    createTeam, 
    updateTeam, 
    deleteTeam,
    createTask, 
    updateTaskStatus,
    deleteTask,
    taskStatuses,
    addTaskStatus,
    removeTaskStatus,
    assignMemberToTeam,
    removeMemberFromTeam,
    updateMemberResponsibilities,
    requestPinAuth 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'teams' | 'tasks' | 'history'>('teams');

  React.useEffect(() => {
    if (initialTab === 'tasks') {
      setActiveTab('tasks');
    } else if (initialTab === 'teams') {
      setActiveTab('teams');
    }
  }, [initialTab]);

  const isAdmin = currentUser?.category === 'CM';

  // Team creation / edit modal state
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [selectedLeaders, setSelectedLeaders] = useState<string[]>([]);
  const [selectedHeads, setSelectedHeads] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Manage Team Members Modal state
  const [managingMembersTeam, setManagingMembersTeam] = useState<Team | null>(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Manage Member Responsibilities Modal state
  const [managingRespMember, setManagingRespMember] = useState<Member | null>(null);
  const [newRespInput, setNewRespInput] = useState('');
  const [memberRespList, setMemberRespList] = useState<string[]>([]);

  // Task creation state
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignType, setTaskAssignType] = useState<'member' | 'team'>('member');
  const [taskAssignId, setTaskAssignId] = useState<string>(members[0]?.id || '');
  const [taskDueDate, setTaskDueDate] = useState<string>('2026-09-20');

  // Task Statuses Management Modal state
  const [isManagingStatuses, setIsManagingStatuses] = useState(false);
  const [newStatusInput, setNewStatusInput] = useState('');

  // Member Activity History selected member
  const [selectedHistoryMemberId, setSelectedHistoryMemberId] = useState<string>(members[0]?.id || '');

  // Filter tasks
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('all');
  const [taskTargetFilter, setTaskTargetFilter] = useState<'all' | 'member' | 'team'>('all');

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Only Committee Members / Admins can modify organizational departments.');
      return;
    }

    const authed = await requestPinAuth({
      title: editingTeamId ? 'Update Department Structure' : 'Create New Department',
      description: `Authorize setup for ${teamName}`,
      actionName: 'Department Config',
      requiredRole: 'Admin'
    });

    if (!authed) return;

    if (editingTeamId) {
      updateTeam(editingTeamId, {
        name: teamName,
        description: teamDesc,
        leaders: selectedLeaders,
        departmentHeads: selectedHeads,
        memberIds: selectedMembers
      });
      // Also sync member.assignedTeams
      selectedMembers.forEach(mId => assignMemberToTeam(mId, editingTeamId));
      setEditingTeamId(null);
    } else {
      createTeam({
        name: teamName,
        description: teamDesc,
        leaders: selectedLeaders,
        departmentHeads: selectedHeads,
        memberIds: selectedMembers,
        isActive: true
      });
      setIsCreatingTeam(false);
    }

    setTeamName('');
    setTeamDesc('');
    setSelectedLeaders([]);
    setSelectedHeads([]);
    setSelectedMembers([]);
  };

  const startEditTeam = (team: Team) => {
    setEditingTeamId(team.id);
    setTeamName(team.name);
    setTeamDesc(team.description);
    setSelectedLeaders(team.leaders || []);
    setSelectedHeads(team.departmentHeads || []);
    setSelectedMembers(team.memberIds || []);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    let assignedName = '';
    if (taskAssignType === 'member') {
      assignedName = members.find(m => m.id === taskAssignId)?.fullName || 'Member';
    } else {
      assignedName = teams.find(t => t.id === taskAssignId)?.name || 'Team';
    }

    createTask({
      title: taskTitle,
      description: taskDesc,
      assignedToType: taskAssignType,
      assignedToId: taskAssignId,
      assignedToName: assignedName,
      dueDate: taskDueDate,
      status: taskStatuses[0] || 'To Do',
      createdBy: currentUser?.fullName || 'Admin'
    });

    setIsCreatingTask(false);
    setTaskTitle('');
    setTaskDesc('');
  };

  const handleSaveMemberResponsibilities = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingRespMember) return;
    updateMemberResponsibilities(managingRespMember.id, memberRespList);
    setManagingRespMember(null);
  };

  const handleAddNewStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatusInput.trim()) return;
    addTaskStatus(newStatusInput.trim());
    setNewStatusInput('');
  };

  const filteredTasks = tasks.filter(t => {
    if (taskStatusFilter !== 'all' && t.status !== taskStatusFilter) return false;
    if (taskTargetFilter !== 'all' && t.assignedToType !== taskTargetFilter) return false;
    return true;
  });

  const selectedHistoryMember = members.find(m => m.id === selectedHistoryMemberId) || members[0];
  const memberCompletedTasks = tasks.filter(t => 
    t.assignedToType === 'member' && 
    t.assignedToId === selectedHistoryMember?.id && 
    t.status === 'Completed'
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header and Mode Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                JAUS 2026 ERP
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
                Equal Multi-Team Membership
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                Duty & Workflow Engine
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
              Departments, Tasks & Member Duties
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Structure: <strong>Member → Multiple Teams/Departments (All Equal) → Multiple Responsibilities → Tasks/Duties</strong>. Organizational category (CM, SB, KY, YK), team membership, designation, and task assignment remain strictly separated.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 shrink-0">
            {activeTab === 'teams' && isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setIsCreatingTeam(true);
                  setEditingTeamId(null);
                  setTeamName('');
                  setTeamDesc('');
                  setSelectedLeaders([]);
                  setSelectedHeads([]);
                  setSelectedMembers([]);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Department</span>
              </button>
            )}

            {activeTab === 'tasks' && (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsManagingStatuses(true)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-colors"
                    title="Manage Task Workflow Statuses"
                  >
                    <Settings2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Workflow Statuses ({taskStatuses.length})</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsCreatingTask(true)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Assign Duty / Task</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'teams'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Departments & Wings ({teams.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'tasks'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Tasks & Duties ({tasks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Member Activity & Completed Duties</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: TEAMS & DEPARTMENTS ================= */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              All assigned departments are treated as <strong>equal</strong>. There is no primary department.
            </span>
            <span className="font-mono text-[11px]">
              Active Departments: {teams.filter(t => t.isActive).length} / {teams.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {teams.map(team => {
              const leaderMembers = members.filter(m => (team.leaders || []).includes(m.id));
              const headMembers = members.filter(m => (team.departmentHeads || []).includes(m.id));
              const assignedMembers = members.filter(m => (team.memberIds || []).includes(m.id));

              return (
                <div key={team.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm">{team.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            team.isActive 
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            {team.isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{team.description}</p>
                      </div>

                      {isAdmin && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditTeam(team)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition-colors"
                            title="Rename / Edit Department"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => updateTeam(team.id, { isActive: !team.isActive })}
                            className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                              team.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={team.isActive ? 'Deactivate Department' : 'Activate Department'}
                          >
                            {team.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Department Heads & Team Leaders (Multiple Supported) */}
                    <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-indigo-600" />
                          <span>Department Heads ({headMembers.length})</span>
                        </span>
                        <div className="space-y-1">
                          {headMembers.length > 0 ? (
                            headMembers.map(h => (
                              <div key={h.id} className="font-semibold text-slate-800 text-[11px] truncate flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                <span>{h.fullName}</span>
                                <span className="text-[9px] text-slate-400 font-mono">({h.category})</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">No head appointed</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1 flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-amber-600" />
                          <span>Team Leaders ({leaderMembers.length})</span>
                        </span>
                        <div className="space-y-1">
                          {leaderMembers.length > 0 ? (
                            leaderMembers.map(l => (
                              <div key={l.id} className="font-semibold text-slate-800 text-[11px] truncate flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>{l.fullName}</span>
                                <span className="text-[9px] text-slate-400 font-mono">({l.category})</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">No leader appointed</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Assigned Members List */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          <span>Assigned Members ({assignedMembers.length})</span>
                        </span>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => setManagingMembersTeam(team)}
                            className="text-[11px] font-bold text-amber-700 hover:underline"
                          >
                            + Manage Team Members
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                        {assignedMembers.map(m => (
                          <div 
                            key={m.id} 
                            className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-center gap-1.5 font-medium group"
                          >
                            <span>{m.fullName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({m.category})</span>
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => removeMemberFromTeam(m.id, team.id)}
                                className="text-slate-400 hover:text-rose-600 ml-0.5"
                                title="Remove from this department"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                        {assignedMembers.length === 0 && (
                          <span className="text-slate-400 italic text-xs">No members currently assigned to this department.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Created: {team.createdAt}</span>
                    <span className="text-slate-500 font-medium">Department ID: {team.id}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 2: TASKS & DUTIES ================= */}
      {activeTab === 'tasks' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Workflow Status:</span>
                <select
                  value={taskStatusFilter}
                  onChange={(e) => setTaskStatusFilter(e.target.value)}
                  className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold outline-hidden"
                >
                  <option value="all">All Statuses ({tasks.length})</option>
                  {taskStatuses.map(s => (
                    <option key={s} value={s}>{s} ({tasks.filter(t => t.status === s).length})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Assignment Target:</span>
                <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setTaskTargetFilter('all')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      taskTargetFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskTargetFilter('member')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      taskTargetFilter === 'member' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Individual Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskTargetFilter('team')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      taskTargetFilter === 'team' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Entire Team
                  </button>
                </div>
              </div>
            </div>

            <div className="text-slate-500 font-medium">
              Showing <strong>{filteredTasks.length}</strong> tasks
            </div>
          </div>

          {/* Kanban / Tasks Column Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {taskStatuses.map(status => {
              const statusTasks = filteredTasks.filter(t => t.status === status);

              return (
                <div key={status} className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-800">{status}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-slate-700 shadow-2xs border border-slate-200">
                      {statusTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {statusTasks.map(task => (
                      <div key={task.id} className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs space-y-2.5 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-slate-900 leading-snug text-xs">{task.title}</h4>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => deleteTask(task.id)}
                              className="text-slate-400 hover:text-rose-600"
                              title="Delete task"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">{task.description}</p>
                        )}

                        {/* Identification of Member vs Entire Team */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className={`px-2 py-0.5 rounded-md font-bold flex items-center gap-1 ${
                            task.assignedToType === 'team'
                              ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                              : 'bg-amber-50 text-amber-900 border border-amber-200'
                          }`}>
                            {task.assignedToType === 'team' ? <FolderKanban className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                            <span>{task.assignedToName}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Due: {task.dueDate}</span>
                        </div>

                        {/* Interactive Status Selector */}
                        <div className="pt-1">
                          <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block mb-0.5">
                            Update Status:
                          </label>
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                            className="w-full text-xs p-1.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-800 outline-hidden"
                          >
                            {taskStatuses.map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>

                        {task.completedAt && (
                          <div className="text-[9px] text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Completed on: {task.completedAt}</span>
                          </div>
                        )}
                      </div>
                    ))}

                    {statusTasks.length === 0 && (
                      <div className="p-4 text-center text-slate-400 text-xs italic bg-white/50 rounded-xl border border-dashed border-slate-200">
                        No tasks in {status}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 3: MEMBER RESPONSIBILITIES & ACTIVITY HISTORY ================= */}
      {activeTab === 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Member Picker & Responsibilities (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-600" />
              <span>Select Member & Manage Designations</span>
            </h3>

            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs text-amber-950 space-y-1">
              <strong>Core Separation Rule:</strong>
              <p className="text-[11px] leading-relaxed">
                A member's responsibilities/designations are strictly separate from organizational categories (CM, SB, KY, YK).
                Being assigned a leadership role does NOT change their category.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Select Member:</label>
              <select
                value={selectedHistoryMemberId}
                onChange={(e) => setSelectedHistoryMemberId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-hidden"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} — Category: {m.category} ({m.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Member Details Card */}
            {selectedHistoryMember && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm">{selectedHistoryMember.fullName}</div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    Category: {selectedHistoryMember.category}
                  </span>
                </div>

                {/* Assigned Equal Teams */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Equal Assigned Departments (No Primary):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedHistoryMember.assignedTeams && selectedHistoryMember.assignedTeams.length > 0 ? (
                      selectedHistoryMember.assignedTeams.map(tId => {
                        const t = teams.find(team => team.id === tId);
                        return (
                          <span key={tId} className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold text-[10px]">
                            {t?.name || tId}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">No departments currently assigned</span>
                    )}
                  </div>
                </div>

                {/* Member Responsibilities */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Responsibilities / Designations:
                    </span>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setManagingRespMember(selectedHistoryMember);
                          setMemberRespList([...(selectedHistoryMember.responsibilities || [])]);
                        }}
                        className="text-[11px] font-bold text-amber-700 hover:underline"
                      >
                        + Edit Responsibilities
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedHistoryMember.responsibilities && selectedHistoryMember.responsibilities.length > 0 ? (
                      selectedHistoryMember.responsibilities.map((resp, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[10px]">
                          {resp}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">No special designations</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Activity & Completed Duties Ledger (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-600" />
                  <span>Preserved Member Activity & Duty History</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Permanent record of completed tasks and duties for <strong>{selectedHistoryMember?.fullName}</strong>
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                Completed Duties: {memberCompletedTasks.length}
              </span>
            </div>

            {/* Completed Tasks section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Completed Tasks & Duties Log
              </h4>
              {memberCompletedTasks.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400 italic">
                  No completed tasks recorded for this member yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {memberCompletedTasks.map(t => (
                    <div key={t.id} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{t.title}</span>
                        <span className="text-[10px] text-emerald-700 font-mono">
                          Completed: {t.completedAt || 'Recently'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">{t.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* General Activity History log */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                System Activity Log
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                {selectedHistoryMember?.activityHistory && selectedHistoryMember.activityHistory.length > 0 ? (
                  selectedHistoryMember.activityHistory.map(act => (
                    <div key={act.id} className="p-3 text-xs hover:bg-slate-50">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>{act.action}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{act.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{act.details}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400 text-xs italic">
                    No activity logs recorded.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT DEPARTMENT ================= */}
      {(isCreatingTeam || editingTeamId) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-sm uppercase tracking-wider">
                {editingTeamId ? 'Rename & Edit Department' : 'Create New Department/Wing'}
              </h3>
              <button
                type="button"
                onClick={() => { setIsCreatingTeam(false); setEditingTeamId(null); }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeam} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Department Name *</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Mandap & Sound Engineering"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description & Scope of Responsibilities</label>
                <textarea
                  value={teamDesc}
                  onChange={(e) => setTeamDesc(e.target.value)}
                  rows={3}
                  placeholder="Specify key duties and voluntary mandates..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              {/* Department Heads (Multiple Allowed) */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Department Heads (Can have multiple simultaneously)
                </label>
                <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50">
                  {members.map(m => (
                    <label key={m.id} className="flex items-center gap-2 p-1 hover:bg-white rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedHeads.includes(m.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedHeads([...selectedHeads, m.id]);
                          else setSelectedHeads(selectedHeads.filter(id => id !== m.id));
                        }}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-slate-800 font-medium">{m.fullName} ({m.category})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Team Leaders (Multiple Allowed) */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Team Leaders (Can have multiple simultaneously)
                </label>
                <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50">
                  {members.map(m => (
                    <label key={m.id} className="flex items-center gap-2 p-1 hover:bg-white rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedLeaders.includes(m.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedLeaders([...selectedLeaders, m.id]);
                          else setSelectedLeaders(selectedLeaders.filter(id => id !== m.id));
                        }}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-slate-800 font-medium">{m.fullName} ({m.category})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsCreatingTeam(false); setEditingTeamId(null); }}
                  className="px-4 py-2 bg-slate-100 rounded-xl text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: MANAGE TEAM MEMBERS ================= */}
      {managingMembersTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="font-bold text-sm">Assign Members: {managingMembersTeam.name}</h3>
                <p className="text-[11px] text-slate-400">Members can belong to multiple departments without hierarchy.</p>
              </div>
              <button
                type="button"
                onClick={() => setManagingMembersTeam(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Search Members:</label>
                <input
                  type="text"
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  placeholder="Search by member name or mobile..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-hidden font-medium"
                />
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                {members
                  .filter(m => m.fullName.toLowerCase().includes(memberSearchQuery.toLowerCase()) || m.mobile.includes(memberSearchQuery))
                  .map(m => {
                    const isAssigned = (managingMembersTeam.memberIds || []).includes(m.id);

                    return (
                      <div key={m.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                        <div>
                          <div className="font-bold text-slate-800">{m.fullName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {m.mobile} • Category: {m.category}
                          </div>
                        </div>

                        {isAssigned ? (
                          <button
                            type="button"
                            onClick={() => removeMemberFromTeam(m.id, managingMembersTeam.id)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold border border-rose-200"
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => assignMemberToTeam(m.id, managingMembersTeam.id)}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-2xs"
                          >
                            + Assign
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setManagingMembersTeam(null)}
                  className="px-4 py-2 bg-slate-100 rounded-xl text-slate-800 font-bold text-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ASSIGN DUTY / TASK ================= */}
      {isCreatingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-sm uppercase tracking-wider">Assign Responsibility / Duty</h3>
              <button
                type="button"
                onClick={() => setIsCreatingTask(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Task Title *</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Inspect Stage Lighting and Generator Wiring"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Detailed Instructions</label>
                <textarea
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  rows={3}
                  placeholder="Specify safety protocols, checkpoints, or schedule..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Assigned Target *</label>
                  <select
                    value={taskAssignType}
                    onChange={(e) => {
                      const type = e.target.value as 'member' | 'team';
                      setTaskAssignType(type);
                      setTaskAssignId(type === 'member' ? (members[0]?.id || '') : (teams[0]?.id || ''));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-hidden font-medium"
                  >
                    <option value="member">Individual Member</option>
                    <option value="team">Entire Department/Team</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Select Assignee *</label>
                  <select
                    value={taskAssignId}
                    onChange={(e) => setTaskAssignId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-hidden font-medium"
                  >
                    {taskAssignType === 'member' ? (
                      members.map(m => (
                        <option key={m.id} value={m.id}>{m.fullName} ({m.category})</option>
                      ))
                    ) : (
                      teams.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Due Date *</label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-hidden font-medium"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreatingTask(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-xs"
                >
                  Create & Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: MANAGE WORKFLOW STATUSES ================= */}
      {isManagingStatuses && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-sm">Manage Workflow Task Statuses</h3>
              <button
                type="button"
                onClick={() => setIsManagingStatuses(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Customize the organizational workflow stages for task tracking.
              </p>

              <form onSubmit={handleAddNewStatus} className="flex gap-2">
                <input
                  type="text"
                  value={newStatusInput}
                  onChange={(e) => setNewStatusInput(e.target.value)}
                  placeholder="New status name (e.g. Blocked, In Review)..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-hidden font-medium"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold"
                >
                  Add Status
                </button>
              </form>

              <div className="space-y-2">
                <span className="font-bold text-slate-700 block">Current Statuses:</span>
                <div className="space-y-1.5">
                  {taskStatuses.map(st => (
                    <div key={st} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between font-semibold text-slate-800">
                      <span>{st}</span>
                      {taskStatuses.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeTaskStatus(st)}
                          className="text-slate-400 hover:text-rose-600"
                          title="Remove status"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsManagingStatuses(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl text-slate-800 font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT MEMBER RESPONSIBILITIES ================= */}
      {managingRespMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="font-bold text-sm">Member Designations & Responsibilities</h3>
                <p className="text-[10px] text-slate-400">{managingRespMember.fullName} ({managingRespMember.category})</p>
              </div>
              <button
                type="button"
                onClick={() => setManagingRespMember(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMemberResponsibilities} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 text-[11px]">
                Note: Updating designations does not change the member's organizational category ({managingRespMember.category}).
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Add Designation:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRespInput}
                    onChange={(e) => setNewRespInput(e.target.value)}
                    placeholder="e.g. Stage Sound Coordinator..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-hidden font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newRespInput.trim()) {
                        setMemberRespList([...memberRespList, newRespInput.trim()]);
                        setNewRespInput('');
                      }
                    }}
                    className="px-3 py-2 bg-amber-600 text-white font-bold rounded-xl"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-slate-700 block">Assigned Designations:</span>
                <div className="flex flex-wrap gap-1.5">
                  {memberRespList.map((resp, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1.5 border border-slate-200">
                      <span>{resp}</span>
                      <button
                        type="button"
                        onClick={() => setMemberRespList(memberRespList.filter((_, idx) => idx !== i))}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {memberRespList.length === 0 && (
                    <span className="text-slate-400 italic">No designations assigned.</span>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setManagingRespMember(null)}
                  className="px-4 py-2 bg-slate-100 rounded-xl text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Save Designations
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
