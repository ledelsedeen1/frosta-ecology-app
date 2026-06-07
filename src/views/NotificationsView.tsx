import React from 'react';
import {
  Users, Calendar, DollarSign, FileText, Layers, Volume2, Mail,
  Shield, Search, Plus, Activity, TrendingUp, BarChart2, Clock,
  RefreshCw, CheckCircle2, X, Trash2, Lock, FileSpreadsheet,
  MessageSquare, Bell, Settings, CreditCard, Tag
} from 'lucide-react';
import { Lang } from '../types';
import { translations } from '../translations';


export interface NotificationsViewProps {
  state: any;
  lang: Lang;
  role: string;
  activePersona: string;
  setActiveTab: (tab: string) => void;

}

export default function NotificationsView(props: NotificationsViewProps) {
  const { state, lang, role, activePersona, setActiveTab } = props;
  const t = translations[lang] || translations.no;
  
  return (
<div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
  <div className="max-w-2xl mx-auto space-y-6">
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <Volume2 className="text-[#278EA5]" size={22} />
        <h2 className="text-xl font-black text-[#0A2E36]">
          {lang==='pl'?'Ustawienia powiadomień':lang==='en'?'Notification Settings':'Varslingsinnstillinger'}
        </h2>
      </div>
      <p className="text-slate-500 text-sm mb-4">Diving Ecology Education Frosta</p>
      <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 mb-5 text-amber-800 text-sm font-bold flex items-center gap-2">
        <span>⚠️</span>
        <span>{lang==='pl'?'Powiadomienia push: Nie skonfigurowane':lang==='en'?'Push notifications: Not configured':'Push-varsler: Ikke konfigurert'}</span>
      </div>
      <p className="text-slate-500 text-sm mb-5">
        {lang==='pl'
          ?'Powiadomienia push zostaną aktywowane po skonfigurowaniu Web Push lub Firebase Cloud Messaging.'
          :lang==='en'
          ?'Push notifications will be activated after Web Push or Firebase Cloud Messaging is configured.'
          :'Push-varsler aktiveres etter at Web Push eller Firebase Cloud Messaging er konfigurert.'}
      </p>

      {/* Notification Type Placeholders */}
      {[
        { key: 'event', label_no: 'Arrangementspåminnelser', label_pl: 'Przypomnienia o wydarzeniach', label_en: 'Event reminders', icon: '📅' },
        { key: 'fee', label_no: 'Purring på medlemskontingent', label_pl: 'Przypomnienia o składkach', label_en: 'Membership fee reminders', icon: '💳' },
        { key: 'board', label_no: 'Styrekunngjøringer', label_pl: 'Ogłoszenia zarządu', label_en: 'Board announcements', icon: '📢' },
        { key: 'volunteer', label_no: 'Frivilligforespørsler', label_pl: 'Prośby wolontariuszy', label_en: 'Volunteer requests', icon: '🙋' },
        { key: 'receipt', label_no: 'Oppdateringer om donasjonskvittering', label_pl: 'Aktualizacje potwierdzenia darowizny', label_en: 'Donation receipt updates', icon: '🧾' },
      ].map(item => (
        <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
          <div className="flex items-center gap-3">
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm font-semibold text-slate-700">
              {lang==='pl'?item.label_pl:lang==='en'?item.label_en:item.label_no}
            </span>
          </div>
          <span className="text-xs bg-slate-100 text-slate-400 px-3 py-1 rounded-full font-bold">
            {lang==='pl'?'Nie skonfigurowane':lang==='en'?'Not configured':'Ikke konfigurert'}
          </span>
        </div>
      ))}

      <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
          {lang==='pl'?'Integracje przyszłości':lang==='en'?'Future integrations':'Fremtidige integrasjoner'}
        </p>
        <ul className="text-xs text-slate-400 space-y-1">
          <li>• Web Push API (VAPID)</li>
          <li>• Firebase Cloud Messaging (FCM)</li>
          <li>• Apple Push Notification Service (APNs)</li>
          <li>• OneSignal / Knock / Novu</li>
        </ul>
      </div>
    </div>
  </div>
</div>
  );
}
