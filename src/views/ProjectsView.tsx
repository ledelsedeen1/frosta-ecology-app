import React from 'react';
import {
  Users, Calendar, DollarSign, FileText, Layers, Volume2, Mail,
  Shield, Search, Plus, Activity, TrendingUp, BarChart2, Clock,
  RefreshCw, CheckCircle2, X, Trash2, Lock, FileSpreadsheet,
  MessageSquare, Bell, Settings, CreditCard, Tag
} from 'lucide-react';
import { Lang } from '../types';
import { translations } from '../translations';


export interface ProjectsViewProps {
  state: any;
  lang: Lang;
  role: string;
  activePersona: string;
  setActiveTab: (tab: string) => void;
  showProjModal: boolean;
  setShowProjModal: (v: boolean) => void;
  projForm: any;
  setProjForm: (f: any) => void;
  showTaskInsert: boolean;
  setShowTaskInsert: (v: boolean) => void;
  taskInsertProjectId: string;
  setTaskInsertProjectId: (id: string) => void;
  newTaskTitle: string;
  setNewTaskTitle: (v: string) => void;
  newTaskAssignee: string;
  setNewTaskAssignee: (v: string) => void;
  handleCreateProject: (e: any) => void;
  handleAddTaskToProject: () => void;
  executePost: (url: string, body: any) => void;
}

export default function ProjectsView(props: ProjectsViewProps) {
  const { state, lang, role, activePersona, setActiveTab, showProjModal, setShowProjModal, projForm, setProjForm, showTaskInsert, setShowTaskInsert, taskInsertProjectId, setTaskInsertProjectId, newTaskTitle, setNewTaskTitle, newTaskAssignee, setNewTaskAssignee, handleCreateProject, handleAddTaskToProject, executePost } = props;
  const t = translations[lang] || translations.no;
  
  return (
<div className="space-y-6">
  
  <div className="flex justify-between items-center">
    <div>
      <h3 className="text-xl font-bold text-[#0A2E36]">{t.projectsGrants}</h3>
      <p className="text-xs text-slate-500">Active regional ecological milestones, grants trackers, community targets.</p>
    </div>
    {(role === 'board' || role === 'admin') && (
      <button onClick={() => setShowProjModal(true)} className="bg-[#278EA5] text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer">
        Add Project
      </button>
    )}
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {state?.projects.map(p => {
      const complTasks = p.tasks.filter(t => t.completed).length;
      const percent = p.tasks.length > 0 ? Math.round((complTasks / p.tasks.length) * 100) : 0;
      return (
        <div key={p.id} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] font-black bg-blue-100 text-[#0A2E36] px-2.5 py-1 rounded uppercase tracking-wider">{p.status}</span>
              <h4 className="font-extrabold text-[#0A2E36] text-base mt-2">{p.name}</h4>
            </div>

            <div className="text-right">
              <p className="text-[9px] text-slate-400 font-extrabold uppercase">Budget Estimate</p>
              <p className="text-sm font-black text-slate-850">{p.budget.toLocaleString()} NOK</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-normal">{p.description}</p>

          <div className="grid grid-cols-2 gap-2 text-[11px] p-2 bg-slate-50 border rounded text-slate-700">
            <p><strong>Owner:</strong> {p.responsiblePerson}</p>
            <p><strong>Sponsors:</strong> {p.sponsors.join(', ') || 'N/A'}</p>
            <p className="col-span-2"><strong>Funding Grantor:</strong> {p.fundingSource || 'Crowdfunded'}</p>
          </div>

          {/* visual progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span>Milestones Met ({complTasks}/{p.tasks.length})</span>
              <span>{percent}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-[#278EA5] h-full" style={{ width: `${percent}%` }}></div>
            </div>
          </div>

          {/* project checkoff list */}
          <div className="space-y-2 pt-2 border-t text-xs">
            <div className="flex justify-between items-center font-bold text-slate-700">
              <span>Active Task Milestones:</span>
              {(role === 'board' || role === 'admin') && (
                <button 
                  onClick={() => { setTaskInsertProjectId(p.id); setShowTaskInsert(true); }}
                  className="text-[10px] text-[#278EA5] font-black hover:underline cursor-pointer"
                >
                  + New Task
                </button>
              )}
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {p.tasks.length === 0 ? (
                <p className="text-slate-400 italic p-2 text-center">No tasks listed for project.</p>
              ) : (
                p.tasks.map(t => (
                  <div key={t.id} className="flex justify-between items-center p-2 bg-slate-50/50 rounded">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={t.completed}
                        disabled={role === 'guest' || role === 'member'}
                        onChange={() => executePost('/api/projects/task-toggle', { projectId: p.id, taskId: t.id })}
                        className="rounded"
                      />
                      <span className={`text-xs ${t.completed ? 'line-through text-slate-400' : 'text-slate-700 font-bold'}`}>
                        {t.title}
                      </span>
                    </label>
                    <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold font-mono">
                      Due: {t.dueDate}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Progress Report Notes */}
          <div className="bg-slate-50 p-3 rounded-lg border text-xs">
            <div className="flex justify-between items-center mb-1">
              <span className="font-extrabold text-slate-700 uppercase font-mono text-[9px] tracking-wider">Progress Report Notes:</span>
              {(role === 'board' || role === 'admin') && (
                <button 
                  onClick={async () => {
                    const text = prompt("Edit live progress notes:", p.progressNotes);
                    if (text !== null) {
                      await executePost('/api/projects/update-progress', { projectId: p.id, progressNotes: text });
                    }
                  }}
                  className="text-[10px] text-[#278EA5] hover:underline cursor-pointer font-bold"
                >
                  Edit Log Note
                </button>
              )}
            </div>
            <p className="text-slate-600 font-mono italic leading-relaxed text-[11px]">"{p.progressNotes}"</p>
          </div>

        </div>
      );
    })}
  </div>

</div>
  );
}