import React from 'react';
import {
  Users, Calendar, DollarSign, FileText, Layers, Volume2, Mail,
  Shield, Search, Plus, Activity, TrendingUp, BarChart2, Clock,
  RefreshCw, CheckCircle2, X, Trash2, Lock, FileSpreadsheet,
  MessageSquare, Bell, Settings, CreditCard, Tag
} from 'lucide-react';
import { Lang } from '../types';
import { translations } from '../translations';
import { ASSOC_SETTINGS } from '../App';


export interface VolunteersViewProps {
  state: any;
  lang: Lang;
  role: string;
  activePersona: string;
  setActiveTab: (tab: string) => void;
  estimatedCleanupTrashKg: number;
}

export default function VolunteersView(props: VolunteersViewProps) {
  const { state, lang, role, activePersona, setActiveTab, estimatedCleanupTrashKg } = props;
  const t = translations[lang] || translations.no;
  
  return (
<div className="space-y-6">

  {/* Guest limited view */}
  {role === 'guest' ? (
    <div className="space-y-4">
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-6 text-center">
        <div className="text-4xl mb-3">🌊</div>
        <h3 className="font-bold text-teal-900 text-lg mb-2">
          {lang==='pl'?'Wolontariat w Diving Ecology Education Frosta':lang==='en'?'Volunteer with Diving Ecology Education Frosta':'Frivillig arbeid i Diving Ecology Education Frosta'}
        </h3>
        <p className="text-sm text-teal-700 max-w-md mx-auto mb-4">
          {lang==='pl'?'Dołącz do naszych wolontariuszy pracujących na rzecz ekologii morskiej, sprzątania podwodnego i edukacji środowiskowej we Frosta.':lang==='en'?'Join our volunteers working for marine ecology, underwater cleanup and environmental education in Frosta.':'Bli med frivillige som jobber for havøkologi, undervannrydding og miljøopplæring i Frosta.'}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6 text-xs">
          <div className="bg-white rounded-lg p-3 border border-teal-100">
            <div className="text-2xl mb-1">🤿</div>
            <p className="font-bold text-teal-800">{lang==='pl'?'Dykorydding podwodne':lang==='en'?'Underwater cleanup':'Undervannsrydding'}</p>
            <p className="text-teal-600 mt-1">{lang==='pl'?'Nurkuj i sprzątaj dno morskie':lang==='en'?'Dive and clean the seabed':'Dykk og rydd havbunnen'}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-teal-100">
            <div className="text-2xl mb-1">🌿</div>
            <p className="font-bold text-teal-800">{lang==='pl'?'Edukacja ekologiczna':lang==='en'?'Ecology education':'Naturveiledning'}</p>
            <p className="text-teal-600 mt-1">{lang==='pl'?'Prowadź warsztaty dla społeczności':lang==='en'?'Run community workshops':'Led lokale naturkurs'}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-teal-100">
            <div className="text-2xl mb-1">🏖️</div>
            <p className="font-bold text-teal-800">{lang==='pl'?'Sprzątanie wybrzeża':lang==='en'?'Shoreline cleanup':'Strandrydding'}</p>
            <p className="text-teal-600 mt-1">{lang==='pl'?'Oczyszczaj brzegi Frostfjorden':lang==='en'?'Clean the shores of Frostfjorden':'Rydd strendene ved Frostfjorden'}</p>
          </div>
        </div>
        <a href={"mailto:" + ASSOC_SETTINGS.email} className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-6 py-3 rounded-xl">
          {lang==='pl'?'Skontaktuj się i zacznij jako wolontariusz':lang==='en'?'Get in touch to start volunteering':'Ta kontakt for å bli frivillig'}
        </a>
      </div>
    </div>
  ) : (
    <div className="space-y-6">

      {/* Demo notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
        <span className="text-base mt-0.5">⚠️</span>
        <span>{lang==='pl'?'Dane demonstracyjne – aktywność wolontariacka i punkty są danymi testowymi prototypu.':lang==='en'?'Demo data – volunteer activity and points are prototype test data.':'Demo-data – frivilligaktivitet og poeng er testdata for prototypen.'}</span>
      </div>

      {/* Volunteer stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{lang==='pl'?'Aktywni wolontariusze':lang==='en'?'Active volunteers':'Aktive frivillige'}</p>
          <p className="text-2xl font-black text-[#0A2E36]">6</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{lang==='pl'?'Łączne godziny':lang==='en'?'Total hours':'Totale timer'}</p>
          <p className="text-2xl font-black text-indigo-700">{state?.members.reduce((acc, m) => acc + m.activityHistory.reduce((a2, h) => a2 + (h.hours || 0), 0), 0)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{lang==='pl'?'Akcje sprzątania':lang==='en'?'Cleanup events':'Ryddeaksjoner'}</p>
          <p className="text-2xl font-black text-teal-700">4</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{lang==='pl'?'Kg odpadów':lang==='en'?'Kg waste removed':'Kg avfall'}</p>
          <p className="text-2xl font-black text-emerald-700">{estimatedCleanupTrashKg}</p>
        </div>
      </div>

      {/* Volunteer leaderboard */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-base font-bold text-[#0A2E36] mb-4">
          🏆 {lang==='pl'?'Tablica liderów wolontariatu':lang==='en'?'Volunteer leaderboard':'Frivilligtoppen'}
        </h3>
        <div className="space-y-3">
          {[
            { name: 'Arne Solbakken', hours: 18, events: 6, badge: lang==='pl'?'Lider projektu':lang==='en'?'Project Leader':'Prosjektleder', badgeColor: 'bg-purple-100 text-purple-800', icon: '🥇' },
            { name: 'Marek Kowalski', hours: 14, events: 5, badge: lang==='pl'?'Wolontariusz ekologiczny':lang==='en'?'Eco Volunteer':'Øko-frivillig', badgeColor: 'bg-teal-100 text-teal-800', icon: '🥈' },
            { name: 'Ingrid Haugum', hours: 12, events: 4, badge: lang==='pl'?'Podstawowy zespół':lang==='en'?'Core Team':'Kjerneteam', badgeColor: 'bg-blue-100 text-blue-800', icon: '🥉' },
            { name: 'Lars-Erik Svendsen', hours: 8, events: 3, badge: lang==='pl'?'Aktywny członek':lang==='en'?'Active Member':'Aktivt Medlem', badgeColor: 'bg-green-100 text-green-800', icon: '🎖️' },
            { name: 'Elena Rostova', hours: 6, events: 3, badge: lang==='pl'?'Aktywny członek':lang==='en'?'Active Member':'Aktivt Medlem', badgeColor: 'bg-green-100 text-green-800', icon: '🎖️' },
            { name: 'Janusz Nowak', hours: 4, events: 2, badge: lang==='pl'?'Wspierający':lang==='en'?'Supporter':'Støttespiller', badgeColor: 'bg-slate-100 text-slate-700', icon: '⭐' },
          ].map((v, idx) => (
            <div key={v.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
              <div className="flex items-center gap-3">
                <span className="text-xl w-7 text-center">{v.icon}</span>
                <div>
                  <p className="font-semibold text-[#0A2E36] text-sm">{v.name}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${v.badgeColor}`}>{v.badge}</span>
                </div>
              </div>
              <div className="text-right text-xs">
                <p className="font-black text-indigo-700 text-base">{v.hours} {lang==='pl'?'godz':lang==='en'?'hrs':'t'}</p>
                <p className="text-slate-500">{v.events} {lang==='pl'?'akcji':lang==='en'?'events':'aksjoner'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badge levels explanation */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-base font-bold text-[#0A2E36] mb-3">
          🎗️ {lang==='pl'?'Poziomy wolontariatu':lang==='en'?'Volunteer levels':'Frivillig-nivåer'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
          {[
            { badge: lang==='pl'?'Wspierający':lang==='en'?'Supporter':'Støttespiller', req: lang==='pl'?'1–3 akcje':lang==='en'?'1–3 events':'1–3 aksjoner', color: 'bg-slate-100 text-slate-700' },
            { badge: lang==='pl'?'Aktywny Członek':lang==='en'?'Active Member':'Aktivt Medlem', req: lang==='pl'?'4–6 akcji':lang==='en'?'4–6 events':'4–6 aksjoner', color: 'bg-green-100 text-green-800' },
            { badge: lang==='pl'?'Wolontariusz Ekologiczny':lang==='en'?'Eco Volunteer':'Øko-frivillig', req: lang==='pl'?'7–10 akcji':lang==='en'?'7–10 events':'7–10 aksjoner', color: 'bg-teal-100 text-teal-800' },
            { badge: lang==='pl'?'Podstawowy Zespół':lang==='en'?'Core Team':'Kjerneteam', req: lang==='pl'?'11–14 akcji':lang==='en'?'11–14 events':'11–14 aksjoner', color: 'bg-blue-100 text-blue-800' },
            { badge: lang==='pl'?'Lider Projektu':lang==='en'?'Project Leader':'Prosjektleder', req: lang==='pl'?'15+ akcji':lang==='en'?'15+ events':'15+ aksjoner', color: 'bg-purple-100 text-purple-800' },
          ].map(b => (
            <div key={b.badge} className="text-center p-2 rounded-lg border border-slate-100">
              <span className={`text-[10px] px-2 py-1 rounded-full font-bold block mb-1 ${b.color}`}>{b.badge}</span>
              <span className="text-[10px] text-slate-500">{b.req}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming volunteer opportunities */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-base font-bold text-[#0A2E36] mb-3">
          📅 {lang==='pl'?'Nadchodzące możliwości wolontariatu':lang==='en'?'Upcoming volunteer opportunities':'Kommende frivilligmuligheter'}
        </h3>
        <div className="space-y-3">
          {[
            { date: '2026-06-14', title: lang==='pl'?'Sprzątanie podwodne – Småland':lang==='en'?'Underwater cleanup – Småland':'Undervannsrydding – Småland', slots: 8, type: lang==='pl'?'Nurkowanie + brzeg':lang==='en'?'Diving + shore':'Dykk + strand' },
            { date: '2026-07-05', title: lang==='pl'?'Warsztaty ekologiczne – szkoła w Frosta':lang==='en'?'Ecology workshop – Frosta school':'Naturkurs – Frosta skole', slots: 4, type: lang==='pl'?'Edukacja':lang==='en'?'Education':'Undervisning' },
            { date: '2026-08-09', title: lang==='pl'?'Instalacja sprzętu AED przy plaży':lang==='en'?'AED equipment installation at beach':'AED-utstyr installering ved strand', slots: 3, type: lang==='pl'?'Bezpieczeństwo':lang==='en'?'Safety':'Sikkerhet' },
          ].map(op => (
            <div key={op.date} className="flex items-start justify-between p-3 border border-slate-100 rounded-lg">
              <div>
                <p className="font-semibold text-[#0A2E36] text-sm">{op.title}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{op.date} · <span className="text-[#278EA5] font-bold">{op.type}</span></p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-xs font-bold text-emerald-700">{op.slots} {lang==='pl'?'miejsc':lang==='en'?'slots':'plasser'}</p>
                <p className="text-[10px] text-slate-400">{lang==='pl'?'dostępne':lang==='en'?'available':'ledige'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )}

</div>
  );
}
