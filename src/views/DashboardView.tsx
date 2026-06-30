import React from 'react';
import { 
  Users, Calendar, DollarSign, FileText, Layers, Volume2,
  BarChart2, TrendingUp, Activity, Plus, RefreshCw, 
  CheckCircle2, UserCheck, ShieldAlert, CreditCard, Mail
} from 'lucide-react';
import { Lang } from '../types';
import { translations } from '../translations';
import { DivingLogo } from '../components/DivingLogo';
import { getMonthAbbr } from '../dateUtils';

export interface DashboardViewProps {
  state: any;
  lang: Lang;
  role: string;
  activePersona: string;
  activeMembersTotal: number;
  pendingMembers: any[];
  unpaidMembers: any[];
  estimatedCleanupTrashKg: number;
  loggedUser: any;
  unreadMsgCount: number;
  setActiveTab: (tab: string) => void;
  setShowMemberModal: (v: boolean) => void;
  setShowEventModal: (v: boolean) => void;
  executePost: (url: string, body: any) => void;
  setSelectedTemplate: (v: string) => void;
  setMemberForm: (v: any) => void;
  setShowDocModal: (v: boolean) => void;
  setShowProjModal: (v: boolean) => void;
  setShowAnnModal: (v: boolean) => void;
}

export default function DashboardView(props: DashboardViewProps) {
  const { 
    state, lang, role, activePersona, activeMembersTotal, pendingMembers,
    unpaidMembers, estimatedCleanupTrashKg, loggedUser, unreadMsgCount,
    setActiveTab, setShowMemberModal, setShowEventModal,
    executePost, setSelectedTemplate, setMemberForm, setShowDocModal,
    setShowProjModal, setShowAnnModal
  } = props;
  
  const t = translations[lang] || translations.no;
  const currentDateLabel = lang === 'pl'
    ? 'DZISIEJSZA DATA'
    : lang === 'en'
      ? 'CURRENT DATE'
      : 'DAGENS DATO';
  const volunteerHours = state?.members?.reduce(
    (acc, m) => acc + (m.activityHistory || []).reduce((a2, h) => a2 + (h.hours || 0), 0),
    0,
  ) ?? 0;

  return (
<div className="space-y-6">
  
  {/* Dashboard Welcome Canvas */}
  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
    <div className="flex items-center space-x-4">
      <DivingLogo />
      <div>
        <h2 className="text-xl font-bold text-[#0A2E36] leading-tight flex flex-wrap items-center gap-2">
          <span>{t.welcomeMessage}, {loggedUser.fullName}!</span>
          <span className="text-xs bg-[#278EA5]/15 text-[#278EA5] px-2 py-0.5 rounded capitalize font-mono font-bold">
            {t[role] || role}
          </span>
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xl">
          {lang==='pl'?'Witamy w wewnętrznym portalu Diving Ecology Education Frosta. Tutaj zarząd i członkowie mogą śledzić wydarzenia, składki członkowskie, projekty, dokumenty, wolontariat i komunikację wielojęzyczną.':lang==='en'?'Welcome to the internal portal of Diving Ecology Education Frosta. Here the board and members can follow activities, membership fees, projects, documents, volunteer work and multilingual communication.':'Velkommen til den interne portalen for Diving Ecology Education Frosta. Her kan styret og medlemmene følge aktiviteter, medlemskontingent, prosjekter, dokumenter, frivillig arbeid og flerspråklig kommunikasjon.'}
        </p>
      </div>
    </div>
    <div className="text-right shrink-0">
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">{currentDateLabel}</p>
      <p className="text-lg font-extrabold text-[#0A2E36] font-mono leading-none mt-1">{new Date().toISOString().split('T')[0]}</p>
      <span className="text-[10px] text-slate-500 font-normal">Trøndelag, Norge</span>
    </div>
  </div>

  {/* 4 Bento Statistical Cards */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black font-mono">{t.members} Total</span>
        <h3 className="text-3xl font-black text-[#0A2E36] mt-1">{state?.members.length}</h3>
        <p className="text-[10px] text-emerald-600 font-bold mt-1">● {activeMembersTotal} {t.active}</p>
      </div>
      <div className="p-3 bg-blue-50 text-[#278EA5] rounded-xl">
        <Users className="w-6 h-6" />
      </div>
    </div>

    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black font-mono">{t.unpaidContribs}</span>
        <h3 className="text-3xl font-black text-[#0A2E36] mt-1">{unpaidMembers.length}</h3>
        <p className="text-[10px] text-amber-600 font-bold mt-1">Pending Invoice Reminders</p>
      </div>
      <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
        <DollarSign className="w-6 h-6" />
      </div>
    </div>

    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black font-mono">{t.volunteerWork}</span>
        <h3 className="text-2xl font-black text-[#0A2E36] mt-1">
          {volunteerHours} hrs
        </h3>
        <p className="text-[10px] text-blue-600 font-bold mt-1">Accumulated hours</p>
      </div>
      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
        <Activity className="w-6 h-6" />
      </div>
    </div>

    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black font-mono">{t.fjordCleanupWeight}</span>
        <h3 className="text-3xl font-black text-[#0A2E36] mt-1">{estimatedCleanupTrashKg} kg</h3>
        <p className="text-[10px] text-teal-600 font-bold mt-1">Marine rubbish recovered</p>
      </div>
      <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
        <TrendingUp className="w-6 h-6" />
      </div>
    </div>

  </div>

  {/* Secondary Mini Bento Stats Row */}
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black font-mono">{t.unreadNews}</span>
        <h3 className="text-xl font-black text-[#0A2E36] mt-0.5">{unreadMsgCount}</h3>
        <button onClick={() => setActiveTab('comms')} className="text-[9px] text-[#278EA5] font-bold hover:underline cursor-pointer">Inbox Chat →</button>
      </div>
      <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
        <Mail className="w-5 h-5" />
      </div>
    </div>

    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black font-mono">{t.announcements}</span>
        <h3 className="text-xl font-black text-[#0A2E36] mt-0.5">{state?.announcements.length || 0}</h3>
        <p className="text-[9px] text-slate-500">Board bulletins active</p>
      </div>
      <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
        <Volume2 className="w-5 h-5" />
      </div>
    </div>

    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black font-mono">{t.activeProjects}</span>
        <h3 className="text-xl font-black text-[#0A2E36] mt-0.5">{state?.projects.length || 0}</h3>
        <button onClick={() => setActiveTab('projects')} className="text-[9px] text-[#278EA5] font-bold hover:underline cursor-pointer">Track Initiatives →</button>
      </div>
      <div className="p-2.5 bg-[#48c0d8]/10 text-[#278EA5] rounded-xl font-bold">
        <Layers className="w-5 h-5" />
      </div>
    </div>

    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black font-mono">{t.policyDocuments}</span>
        <h3 className="text-xl font-black text-[#0A2E36] mt-0.5">{state?.documents.length || 0}</h3>
        <button onClick={() => setActiveTab('documents')} className="text-[9px] text-[#278EA5] font-bold hover:underline cursor-pointer">Library Files →</button>
      </div>
      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
        <FileText className="w-5 h-5" />
      </div>
    </div>
  </div>

  {/* Dashboard layout core divisions */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    
    {/* Left Column: Applications & Actions */}
    <div className="lg:col-span-2 space-y-6">
      
      {/* Member review waiting list */}
      <div id="pending-applications-section" className="bg-white rounded-xl border border-slate-250 shadow-sm overflow-hidden">
        <div className="p-5 border-b bg-slate-50 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-[#278EA5]" />
            <h4 className="font-extrabold text-[#0A2E36]">{t.verificationWorkflow} ({pendingMembers.length})</h4>
          </div>
          {pendingMembers.length > 0 && (
            <span className="text-[9px] bg-red-150 text-red-700 px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
              Requires Board approval
            </span>
          )}
        </div>

        <div className="divide-y divide-slate-150 max-h-72 overflow-y-auto">
          {pendingMembers.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm italic font-medium">
              {t.noPendingApplications}
            </div>
          ) : (
            pendingMembers.map((m) => (
              <div key={m.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50 transition">
                <div>
                  <h5 className="font-black text-slate-850 text-sm flex items-center space-x-2">
                    <span>{m.fullName}</span>
                    <span className="text-[10px] bg-[#48C0D8]/20 text-[#0A2E36] font-bold px-2 py-0.5 rounded font-mono">
                      {m.memberType.toUpperCase()}
                    </span>
                  </h5>
                  <p className="text-xs text-slate-500 mt-1">
                    ✉ {m.email} • 📞 {m.phone || 'No phone'}
                  </p>
                  <p className="text-[11px] text-[#278EA5] mt-1 font-bold">
                    Language preference: <span className="uppercase">{m.preferredLanguage}</span> • GDPR consents: Privacy ✅, Photo {m.consentPhoto ? '✅' : '❌'}
                  </p>
                </div>
                
                <div className="mt-3 sm:mt-0 flex gap-1.5 self-start sm:self-center">
                  {(role === 'board' || role === 'admin') ? (
                    <>
                      <button 
                        onClick={() => executePost('/api/members/approve', { id: m.id })}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg shadow-sm cursor-pointer"
                      >
                        {t.approve}
                      </button>
                      <button 
                        onClick={() => executePost('/api/members/reject', { id: m.id })}
                        className="border border-slate-300 hover:bg-slate-100 text-slate-600 font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                      >
                        {t.reject}
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Board Review Only</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick navigation dashboard shortcuts */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="font-extrabold text-[#0A2E36] mb-4">{t.quickActions}</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          
          <button onClick={() => { setActiveTab('comms'); setSelectedTemplate('invitation'); }} className="p-3 bg-slate-50 hover:bg-[#278EA5]/10 rounded-lg text-left border border-slate-200 cursor-pointer">
            <p className="font-bold text-[#278EA5]">✉ {t.invitationTemplate}</p>
            <p className="text-[10px] text-slate-500 mt-1">Create outing invitations</p>
          </button>

          <button onClick={() => { setMemberForm(prev => ({ ...prev, status: 'new_applicant' })); setShowMemberModal(true); }} className="p-3 bg-slate-50 hover:bg-[#278EA5]/10 rounded-lg text-left border border-slate-200 cursor-pointer font-bold">
            <p className="font-bold text-[#278EA5]">👤 {t.addMember}</p>
            <p className="text-[10px] text-slate-500 mt-1">Register new applicants</p>
          </button>

          <button onClick={() => setActiveTab('reports')} className="p-3 bg-slate-50 hover:bg-[#278EA5]/10 rounded-lg text-left border border-slate-200 cursor-pointer">
            <p className="font-bold text-[#278EA5]">📊 Year Summary 2026</p>
            <p className="text-[10px] text-slate-500 mt-1">Compile annual figures</p>
          </button>

          <button onClick={() => { setActiveTab('documents'); setShowDocModal(true); }} className="p-3 bg-slate-50 hover:bg-[#278EA5]/10 rounded-lg text-left border border-slate-200 cursor-pointer">
            <p className="font-bold text-[#278EA5]">📄 {t.uploadDocument}</p>
            <p className="text-[10px] text-slate-500 mt-1">Upload files to library</p>
          </button>

          <button onClick={() => { setActiveTab('projects'); setShowProjModal(true); }} className="p-3 bg-slate-50 hover:bg-[#278EA5]/10 rounded-lg text-left border border-slate-200 cursor-pointer">
            <p className="font-bold text-[#278EA5]">🌿 {t.createProject}</p>
            <p className="text-[10px] text-slate-500 mt-1">Add new eco initiative</p>
          </button>

          <button onClick={() => { setShowEventModal(true); }} className="p-3 bg-slate-50 hover:bg-[#278EA5]/10 rounded-lg text-left border border-slate-200 cursor-pointer">
            <p className="font-bold text-[#278EA5]">📅 Create Clean Shoreline Outing</p>
            <p className="text-[10px] text-slate-500 mt-1">Launch fresh action days</p>
          </button>

          <button onClick={() => { setShowAnnModal(true); }} className="p-3 bg-slate-50 hover:bg-[#278EA5]/10 rounded-lg text-left border border-slate-200 cursor-pointer">
            <p className="font-bold text-[#278EA5]">📢 Broadcast Board Announcement</p>
            <p className="text-[10px] text-slate-500 mt-1">Post public board feed alert</p>
          </button>

          {pendingMembers.length > 0 && (
            <button 
              onClick={() => {
                const el = document.getElementById('pending-applications-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }} 
              className="p-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-left border border-emerald-200 text-emerald-850 cursor-pointer"
            >
              <p className="font-bold">✓ Review {pendingMembers.length} Applications</p>
              <p className="text-[10px] text-emerald-600 mt-1">Verify new aspirants</p>
            </button>
          )}

          <button 
            onClick={async () => {
              if (confirm("Construct bulk warning emails for all unpaid member records?")) {
                await executePost('/api/fees/send-reminder', { isBulk: true });
                alert("Bulk communication dispatched!");
              }
            }}
            className="p-3 bg-slate-50 hover:bg-red-50 rounded-lg text-left border border-slate-200 cursor-pointer text-red-700"
          >
            <p className="font-bold">🔔 Remind Outstanding Checks</p>
            <p className="text-[10px] text-slate-500 mt-1">Trigger invoice warns</p>
          </button>

          {role !== 'guest' && (
            <button 
              onClick={() => setActiveTab('membership_card')} 
              className="p-3 bg-gradient-to-br from-[#0B2E36] to-[#278EA5] text-white hover:opacity-90 rounded-lg text-left border border-[#278EA5]/20 cursor-pointer shadow-sm relative overflow-hidden"
            >
              <p className="font-bold flex items-center gap-1.5">
                <CreditCard className="w-4.5 h-4.5 text-[#48C0D8]" />
                {(role === 'board' || role === 'admin') ? t.membershipCards : t.myMembershipCard}
              </p>
              <p className="text-[10px] text-slate-200 mt-1">
                {(role === 'board' || role === 'admin') ? 'Manage & verify digital ID cards' : 'View, upload photo or print your digital card'}
              </p>
            </button>
          )}

        </div>
      </div>

    </div>

    {/* Right Side Column */}
    <div className="space-y-6">
      
      {/* Events list */}
      <div className="bg-white p-5 rounded-xl border border-slate-250 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">{t.manageEvents}</h4>
          <button onClick={() => setActiveTab('events')} className="text-xs text-[#278EA5] font-bold hover:underline cursor-pointer">
            {t.viewAll} →
          </button>
        </div>

        <div className="space-y-3">
          {state?.events.map((e) => {
            const dt = new Date(e.date);
            return (
              <div key={e.id} className="p-3 bg-[#48C0D8]/5 rounded-lg border-l-4 border-[#278EA5] flex space-x-3 items-start">
                <div className="text-center bg-[#278EA5]/15 rounded p-1.5 min-w-[42px] shrink-0 text-[#0A2E36]">
                  <span className="block text-[9px] font-black uppercase text-[#278EA5]">
                    {getMonthAbbr(dt.getMonth(), lang).toUpperCase()}
                  </span>
                  <span className="block text-lg font-black leading-none mt-1">
                    {dt.getDate()}
                  </span>
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-slate-800 truncate">{e.title}</h5>
                  <p className="text-[10px] text-slate-500 truncate">📍 {e.location}</p>
                  <p className="text-[10px] text-indigo-700 font-bold mt-1">
                    🏆 {e.pointsValue} {t.points} • {e.registrations.length} registered
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compliancy track logs */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
        <h4 className="font-extrabold text-slate-800 text-xs mb-3 uppercase tracking-wider">Governance Auditing (Diving Ecology Education Frosta DB)</h4>
        <div className="space-y-3 max-h-56 overflow-y-auto text-[11px] divide-y divide-slate-100">
          {state?.logs.map(log => (
            <div key={log.id} className="pt-2 text-slate-700">
              <div className="flex justify-between font-bold">
                <span>👤 {log.user}</span>
                <span className="text-slate-400 text-[10px] font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-slate-900 font-bold mt-0.5">{log.action}</p>
              <p className="text-slate-500 italic mt-0.5">"{log.details}"</p>
            </div>
          ))}
        </div>
      </div>

    </div>

  </div>

</div>
  );
}
