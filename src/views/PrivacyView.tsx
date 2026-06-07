import {
  Users, Calendar, DollarSign, FileText, Layers, Volume2, Mail,
  Shield, Search, Plus, Activity, TrendingUp, BarChart2, Clock,
  RefreshCw, CheckCircle2, X, Trash2, Lock, FileSpreadsheet,
  MessageSquare, Bell, Settings, CreditCard, Tag
} from 'lucide-react';
import { Lang } from '../types';
import { translations } from '../translations';


export interface PrivacyViewProps {
  state: any;
  lang: Lang;
  role: string;
  activePersona: string;
  setActiveTab: (tab: string) => void;
  executePost: (url: string, body: any) => Promise<any>;
  fetchState: () => void;
}

export default function PrivacyView(props: PrivacyViewProps) {
  const { state, lang, role, activePersona, setActiveTab, executePost, fetchState } = props;
  const t = translations[lang] || translations.no;
  
  return (
<div className="bg-white rounded-xl border p-6 space-y-6 max-w-2xl mx-auto">
  <div className="flex items-center space-x-2 text-[#0A2E36] font-bold border-b pb-4">
    <Shield className="w-6 h-6 text-[#278EA5]" />
    <h3 className="text-lg">{t.privacyInfo}</h3>
  </div>

  <div className="space-y-4 text-xs text-slate-600 font-normal leading-relaxed">
    <p className="bg-[#278EA5]/10 text-slate-800 p-3 rounded-lg font-bold">
      {t.boardAlertPrivate}
    </p>

    <h4 className="font-extrabold text-slate-800">GDPR Compliance parameters configured:</h4>
    <ul className="list-disc pl-5 space-y-2">
      <li><strong>Erase-Me Rights:</strong> Close account trigger purges details instantly.</li>
      <li><strong>Contact Protocols:</strong> Isolated resuscitator details kept internal to board rescue helpers.</li>
    </ul>

    <div className="border-t pt-4 flex gap-3 text-xs">
      <button 
        onClick={() => {
          const dat = JSON.stringify(state?.members.find(m => m.id === 'mem_2') || {}, null, 2);
          const blob = new Blob([dat], { type: 'application/json' });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "diving_ecology_education_frosta_privacy_export.json";
          link.click();
        }}
        className="bg-[#0A2E36] hover:bg-[#124b56] text-white py-2 px-4 rounded font-extrabold cursor-pointer"
      >
        Export Profile Data (JSON)
      </button>
      <button 
        onClick={async () => {
          if (confirm("Permanently deactivate profile? GDPR mandate triggers immediate removal of 'Marek Kowalski'.")) {
            const ok = await executePost('/api/members/delete', { id: 'mem_2' });
            if (ok) {
              alert("Profile deleted.");
              fetchState();
            }
          }
        }}
        className="border border-red-300 hover:bg-red-50 text-red-600 py-2 px-4 rounded font-extrabold cursor-pointer"
      >
        Delete Profile
      </button>
    </div>
  </div>

</div>
  );
}
