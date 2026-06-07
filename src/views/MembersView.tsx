import React from 'react';
import {
  Users, Calendar, DollarSign, FileText, Layers, Volume2,
  BarChart2, TrendingUp, Activity, Plus, RefreshCw, Search,
  CheckCircle2, UserCheck, ShieldAlert, CreditCard, Mail,
  Shield, X, Trash2, Lock, FileSpreadsheet,
  BarChart, Clock, Tag, MessageSquare, Bell, Settings
} from 'lucide-react';
import { Lang } from '../types';
import { translations } from '../translations';
import { ASSOC_SETTINGS } from '../App';


export interface MembersViewProps {
  state: any;
  lang: Lang;
  role: string;
  activePersona: string;
  setActiveTab: (tab: string) => void;
  pendingMembers: any[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  showMemberModal: boolean;
  setShowMemberModal: (v: boolean) => void;
  memberForm: any;
  setMemberForm: (f: any) => void;
  selectedMemberForDetail: any;
  setSelectedMemberForDetail: (m: any) => void;
  isEditingMember: boolean;
  setIsEditingMember: (v: boolean) => void;
  memberEditForm: any;
  setMemberEditForm: (f: any) => void;
  handleCreateMember: (e: any) => void;
  handleUpdateMember: (e: any) => void;
  handleDeleteMember: (id: string, fullName: string) => void;
  activeMembersTotal: number;
  filteredMembersList: any[];
  executePost: (url: string, body: any) => void;
  membersSupabaseStatus?: 'demo' | 'connected' | 'error';
}

export default function MembersView(props: MembersViewProps) {
  const { state, lang, role, activePersona, setActiveTab, pendingMembers, searchQuery, setSearchQuery, showMemberModal, setShowMemberModal,
    memberForm, setMemberForm, selectedMemberForDetail, setSelectedMemberForDetail,
    isEditingMember, setIsEditingMember, memberEditForm, setMemberEditForm,
    handleCreateMember, handleUpdateMember, handleDeleteMember, activeMembersTotal, filteredMembersList, executePost, membersSupabaseStatus } = props;
  const t = translations[lang] || translations.no;

  return (
<div className="bg-white rounded-xl border border-slate-250 shadow-sm p-6 space-y-6">
  
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div className="flex items-center gap-3">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Users className="w-5 h-5 text-[#278EA5]" /> {t.members}
      </h2>
      {(role === 'admin' || role === 'board') && membersSupabaseStatus === 'connected' && (
        <span className="bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold tracking-wider py-0.5 px-2 rounded-full border border-emerald-200">
          Supabase data connected
        </span>
      )}
      {(role === 'admin' || role === 'board') && (membersSupabaseStatus === 'demo' || membersSupabaseStatus === 'error') && (
        <span className="bg-amber-100 text-amber-800 text-[10px] uppercase font-bold tracking-wider py-0.5 px-2 rounded-full border border-amber-200">
          Demo data in use
        </span>
      )}
    </div>
    <div>
      <h3 className="text-xl font-bold text-[#0A2E36]">{t.members} Database</h3>
      <p className="text-xs text-slate-500">Official catalog of environmentalists, scuba divers, and volunteers.</p>
    </div>

    <div className="relative max-w-sm w-full">
      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
      <input 
        type="text" 
        placeholder={t.search} 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#278EA5]"
      />
    </div>
  </div>
  {/* ROLE-BASED ACCESS: Guest and Member see limited view */}
  {(role === 'guest' || role === 'member' || role === 'volunteer') ? (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
        <div className="text-3xl mb-2">🔒</div>
        <p className="font-bold text-blue-900 text-sm">
          {lang==='pl'?'Dostęp ograniczony':lang==='en'?'Restricted access':'Begrenset tilgang'}
        </p>
        <p className="text-xs text-blue-700 mt-1 max-w-md mx-auto">
          {lang==='pl'?'Pełna baza danych członków z danymi kontaktowymi jest dostępna tylko dla zarządu i administratorów Diving Ecology Education Frosta.':lang==='en'?'The full member database with contact details is only available to the board and administrators of Diving Ecology Education Frosta.':'Den fullstendige medlemsdatabasen med kontaktinformasjon er kun tilgjengelig for styret og administratorer i Diving Ecology Education Frosta.'}
        </p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h4 className="font-bold text-[#0A2E36] text-sm mb-3">
          {lang==='pl'?'Ogólna informacja o stowarzyszeniu':lang==='en'?'General association information':'Generell informasjon om foreningen'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
              {lang==='pl'?'Łączna liczba członków':lang==='en'?'Total members':'Antall medlemmer'}
            </p>
            <p className="text-2xl font-black text-[#0A2E36]">{state?.members.length}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
              {lang==='pl'?'Aktywni członkowie':lang==='en'?'Active members':'Aktive medlemmer'}
            </p>
            <p className="text-2xl font-black text-emerald-700">{activeMembersTotal}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
              {lang==='pl'?'Godziny wolontariatu':lang==='en'?'Volunteer hours':'Frivillige timer'}
            </p>
            <p className="text-2xl font-black text-indigo-700">{state?.members.reduce((acc, m) => acc + m.activityHistory.reduce((a2, h) => a2 + (h.hours || 0), 0), 0)}</p>
          </div>
        </div>
      </div>
      {role === 'guest' && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-5 text-center">
          <p className="font-bold text-teal-900 text-sm mb-1">
            {lang==='pl'?'Chcesz dołączyć?':lang==='en'?'Want to join?':'Vil du bli medlem?'}
          </p>
          <p className="text-xs text-teal-700 mb-3">
            {lang==='pl'?'Dołącz do Diving Ecology Education Frosta i weź udział w działaniach na rzecz środowiska morskiego.':lang==='en'?'Join Diving Ecology Education Frosta and take part in marine environment activities.':'Bli med i Diving Ecology Education Frosta og ta del i aktiviteter for det marine miljøet.'}
          </p>
          <a href={"mailto:" + ASSOC_SETTINGS.email} className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-4 py-2 rounded-lg">
            {lang==='pl'?'Skontaktuj się z zarządem':lang==='en'?'Contact the board':'Kontakt styret'}
          </a>
        </div>
      )}
    </div>
  ) : (

  <div className="overflow-x-auto">
    <table className="w-full text-xs text-left border-collapse">
      <thead>
        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
          <th className="px-4 py-3">FullName</th>
          <th className="px-4 py-3">Contact</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3">Fees</th>
          <th className="px-4 py-3 text-center">Lang</th>
          <th className="px-4 py-3">Member Since</th>
          <th className="px-4 py-3">Activity Scope</th>
          <th className="px-4 py-3 text-right">{t.actions}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {filteredMembersList.map((m) => {
          const totalScore = m.activityHistory.reduce((acc, c) => acc + c.points, 0);
          
          let statusColor = "bg-amber-100 text-amber-700";
          if (m.status === 'active') statusColor = "bg-emerald-100 text-emerald-800";
          else if (m.status === 'board') statusColor = "bg-blue-100 text-blue-800";
          else if (m.status === 'former') statusColor = "bg-slate-100 text-slate-500";

          let feeColor = "bg-red-100 text-red-700";
          if (m.paymentStatus === 'paid') feeColor = "bg-emerald-100 text-emerald-700";
          else if (m.paymentStatus === 'pending') feeColor = "bg-amber-100 text-amber-700";
          else if (m.paymentStatus === 'exempt') feeColor = "bg-purple-100 text-purple-700 font-bold";

          return (
            <tr key={m.id} className="hover:bg-slate-50/50 transition">
              <td className="px-4 py-3 font-semibold text-[#0A2E36]">
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{m.fullName}</span>
                  {m.address && <span className="text-[10px] text-slate-400 font-normal truncate max-w-xs">{m.address}</span>}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="font-semibold text-slate-800 block">{m.email}</span>
                <span className="text-[10px] text-slate-400 font-bold">{m.phone}</span>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2.5 py-0.5 rounded-full inline-block text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                  {m.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2.5 py-0.5 rounded-full inline-block text-[10px] font-bold uppercase tracking-wider ${feeColor}`}>
                  {m.paymentStatus}
                </span>
              </td>
              <td className="px-4 py-3 uppercase font-bold text-slate-600 text-center">{m.preferredLanguage}</td>
              <td className="px-4 py-3 text-slate-500">{m.dateJoined}</td>
              <td className="px-4 py-3">
                <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded text-center block">
                  {totalScore} {t.points} ({m.activityHistory.length} events)
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end space-x-1.5">
                  <button 
                    onClick={() => setSelectedMemberForDetail(m)}
                    className="text-[#278EA5] hover:bg-[#278EA5]/10 font-bold text-xs p-1 px-2.5 rounded border border-[#278EA5]/20 cursor-pointer"
                  >
                    Cabinet File
                  </button>
                  
                  {(role === 'board' || role === 'admin') && (
                    <button 
                      onClick={() => handleDeleteMember(m.id, m.fullName)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
  )}

</div>
  );
}

