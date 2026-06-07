import React from 'react';
import {
  Users, Calendar, DollarSign, FileText, Layers, Volume2, Mail,
  Shield, Search, Plus, Activity, TrendingUp, BarChart2, Clock,
  RefreshCw, CheckCircle2, X, Trash2, Lock, FileSpreadsheet,
  MessageSquare, Bell, Settings, CreditCard, Tag
} from 'lucide-react';
import { Lang } from '../types';
import { translations } from '../translations';


export interface ReportsViewProps {
  state: any;
  lang: Lang;
  role: string;
  activePersona: string;
  setActiveTab: (tab: string) => void;
  activeMembersTotal: number;
  estimatedCleanupTrashKg: number;
  fees?: any[];
  feesSupabaseStatus?: 'demo' | 'connected' | 'error';
  payments?: any[];
}

interface ReportFee {
  id: string;
  memberId: string;
  memberName: string;
  email: string;
  year: number;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'paid' | 'unpaid' | 'partially_paid' | 'exempt';
  adminComment: string;
}

export default function ReportsView(props: ReportsViewProps) {
  const { state, lang, role, activePersona, setActiveTab, activeMembersTotal, estimatedCleanupTrashKg, fees = [], feesSupabaseStatus = 'demo', payments = [] } = props;
  const t = translations[lang] || translations.no;
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());

  const processedFees = React.useMemo(() => {
    const list: ReportFee[] = [];
    if (feesSupabaseStatus === 'connected') {
      for (const f of fees) {
        const mem = state?.members?.find((m: any) => m.id === f.memberId);
        list.push({
          id: f.id,
          memberId: f.memberId,
          memberName: mem ? mem.fullName : `Unknown (${f.memberId.slice(0,6)})`,
          email: mem ? mem.email : '',
          year: f.year || new Date().getFullYear(),
          amount: f.amount || 0,
          paidAmount: f.paidAmount || 0,
          remainingAmount: Math.max(0, (f.amount || 0) - (f.paidAmount || 0)),
          status: f.status as any,
          adminComment: f.adminComment || ''
        });
      }
    } else {
      const pList = payments.filter((p: any) => p.type === 'membership_fee');
      for (const p of pList) {
        const mem = state?.members?.find((m: any) => m.id === p.memberId);
        const isPaid = p.status === 'CONFIRMED';
        const paidAmt = isPaid ? (p.amount || 0) : 0;
        const normalizedStatus = isPaid ? 'paid' : (p.status === 'PENDING_CONFIRMATION' ? 'unpaid' : 'unpaid');
        list.push({
          id: p.id,
          memberId: p.memberId,
          memberName: mem ? mem.fullName : p.memberName,
          email: mem ? mem.email : '',
          year: p.year || new Date().getFullYear(),
          amount: p.amount || 0,
          paidAmount: paidAmt,
          remainingAmount: Math.max(0, (p.amount || 0) - paidAmt),
          status: normalizedStatus as any,
          adminComment: p.adminNote || ''
        });
      }
    }
    return list;
  }, [fees, payments, feesSupabaseStatus, state?.members]);

  const availableYears = Array.from(new Set(processedFees.map(f => f.year))).sort((a,b) => b-a);
  if (!availableYears.includes(selectedYear)) {
    availableYears.push(selectedYear);
    availableYears.sort((a,b) => b-a);
  }

  const feesForYear = processedFees.filter(f => f.year === selectedYear);
  const countTotal = feesForYear.length;
  const countPaid = feesForYear.filter(f => f.status === 'paid').length;
  const countUnpaid = feesForYear.filter(f => f.status === 'unpaid').length;
  const countPartially = feesForYear.filter(f => f.status === 'partially_paid').length;
  const countExempt = feesForYear.filter(f => f.status === 'exempt').length;

  const sumAmount = feesForYear.reduce((acc, f) => acc + f.amount, 0);
  const sumPaidAmount = feesForYear.reduce((acc, f) => acc + f.paidAmount, 0);
  const sumArrears = sumAmount - sumPaidAmount;

  const arrearsList = feesForYear.filter(f => f.status === 'unpaid' || f.status === 'partially_paid');

  const copyReminder = (fee: ReportFee) => {
    let reminderText = "";
    if (lang === 'no') {
      reminderText = `Hei ${fee.memberName},\nVi ønsker å minne om medlemskontingenten for ${fee.year} i Diving Ecology Education Frosta. Ifølge våre registreringer står det fortsatt ${fee.remainingAmount} NOK ubetalt.\nDersom betalingen allerede er sendt, kan du se bort fra denne meldingen.\nTakk for at du støtter foreningens arbeid.\nVennlig hilsen\nDiving Ecology Education Frosta`;
    } else if (lang === 'pl') {
      reminderText = `Cześć ${fee.memberName},\nprzypominamy uprzejmie o składce członkowskiej za rok ${fee.year} w Diving Ecology Education Frosta. Według naszych zapisów pozostało do zapłaty ${fee.remainingAmount} NOK.\nJeśli płatność została już wysłana, prosimy zignorować tę wiadomość.\nDziękujemy za wspieranie pracy stowarzyszenia.\nPozdrawiamy\nDiving Ecology Education Frosta`;
    } else {
      reminderText = `Hi ${fee.memberName},\nThis is a friendly reminder about the membership fee for ${fee.year} in Diving Ecology Education Frosta. According to our records, ${fee.remainingAmount} NOK remains unpaid.\nIf the payment has already been sent, please ignore this message.\nThank you for supporting the association’s work.\nKind regards\nDiving Ecology Education Frosta`;
    }

    navigator.clipboard.writeText(reminderText).then(() => {
      alert(lang === 'pl' ? 'Skopiowano!' : lang === 'no' ? 'Kopiert!' : 'Copied!');
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  };
  
  return (
<div className="bg-white rounded-xl p-8 space-y-6 max-w-4xl mx-auto border border-slate-200 shadow-sm font-normal">
  {role === 'guest' || role === 'member' ? (
    <div className="text-center py-10 bg-slate-50 border border-slate-200 rounded-xl">
      <Lock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
      <h3 className="font-bold text-slate-700">Restricted Access</h3>
      <p className="text-sm text-slate-500 mt-1">
        Reports and financial overviews are only available to board members and administrators.
      </p>
    </div>
  ) : (
    <>
  <div className="flex justify-between items-center border-b pb-4">
    <div className="flex items-center space-x-2">
      <FileSpreadsheet className="w-6 h-6 text-[#278EA5]" />
      <h3 className="text-xl font-bold text-[#0A2E36]">{t.annualReportGenerator || 'Annual Report Generator'} {selectedYear}</h3>
    </div>
    <button onClick={() => window.print()} className="border border-[#278EA5] text-[#278EA5] hover:bg-slate-50 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer">
      🖨️ {t.exportReport || 'Export Report'}
    </button>
  </div>

  <div className="bg-slate-50 p-6 rounded-xl border text-center space-y-1.5">
    <h4 className="font-extrabold text-[#0A2E36] text-lg">ANNUAL INTEGRATION REPORT • ÅRSRAPPORT 2026</h4>
    <p className="text-[#278EA5] uppercase text-[10px] tracking-widest font-black">Diving Ecology Education Frosta</p>
    <p className="text-xs text-slate-650 max-w-2xl mx-auto font-normal leading-relaxed">
      Corporate summary audit verifying beach cleanup weights, ecological milestones met, grants balance sheets, and multilingual member registrations.
    </p>
  </div>

  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
    <div className="bg-slate-50/50 p-4 rounded-lg border">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.activeCount}</span>
      <p className="text-3xl font-black text-[#0A2E36] mt-1">{activeMembersTotal}</p>
    </div>
    <div className="bg-slate-50/50 p-4 rounded-lg border">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.newCount}</span>
      <p className="text-3xl font-black text-[#0A2E36] mt-1">
        {state?.members.filter(m => m.dateJoined.startsWith('2026')).length}
      </p>
    </div>
    <div className="bg-slate-50/50 p-4 rounded-lg border">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.eventCount}</span>
      <p className="text-3xl font-black text-[#0A2E36] mt-1">{state?.events.length}</p>
    </div>
    <div className="bg-slate-50/50 p-4 rounded-lg border">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.totalCleanupWeight}</span>
      <p className="text-3xl font-black text-[#278EA5] mt-1">{estimatedCleanupTrashKg} kg</p>
    </div>
    <div className="bg-slate-50/50 p-4 rounded-lg border">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ECO Points Handed</span>
      <p className="text-3xl font-black text-[#0A2E36] mt-1">
        {state?.members.reduce((acc, m) => acc + m.activityHistory.reduce((a, h) => a + h.points, 0), 0)} pts
      </p>
    </div>
    <div className="bg-slate-50/50 p-4 rounded-lg border col-span-2 md:col-span-1">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Strategic Grant Funds Received</span>
      <p className="text-2xl font-black text-emerald-700 mt-1.5">
        {state?.projects.reduce((acc: number, p: any) => acc + p.budget, 0).toLocaleString()} NOK
      </p>
    </div>
  </div>

  {/* MEMBERSHIP FEE REPORT */}
  <div className="border-t pt-6 pb-2">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-bold text-[#0A2E36] flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-[#278EA5]" />
        {lang === 'pl' ? 'Raport składek' : lang === 'no' ? 'Kontingentrapport' : 'Membership Fee Report'}
      </h3>
      <select 
        value={selectedYear} 
        onChange={(e) => setSelectedYear(Number(e.target.value))}
        className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white"
      >
        {availableYears.map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white border rounded-lg p-3">
        <p className="text-xs text-slate-500 font-semibold mb-1">TOTAL FEES</p>
        <p className="text-xl font-black text-slate-800">{countTotal}</p>
        <p className="text-xs text-slate-400 mt-1">{sumAmount} NOK expected</p>
      </div>
      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
        <p className="text-xs text-emerald-700 font-semibold mb-1">PAID</p>
        <p className="text-xl font-black text-emerald-900">{countPaid}</p>
        <p className="text-xs text-emerald-600 mt-1">{sumPaidAmount} NOK collected</p>
      </div>
      <div className="bg-red-50 border border-red-100 rounded-lg p-3">
        <p className="text-xs text-red-700 font-semibold mb-1">UNPAID / PARTIAL</p>
        <p className="text-xl font-black text-red-900">{countUnpaid + countPartially}</p>
        <p className="text-xs text-red-600 mt-1">{sumArrears} NOK arrears</p>
      </div>
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
        <p className="text-xs text-blue-700 font-semibold mb-1">EXEMPT</p>
        <p className="text-xl font-black text-blue-900">{countExempt}</p>
      </div>
    </div>

    {arrearsList.length > 0 && (
      <div>
        <h4 className="font-bold text-slate-700 mb-3 text-sm">
          {lang === 'pl' ? 'Lista zaległych składek' : lang === 'no' ? 'Liste over ubetalte kontingenter' : 'Arrears List'}
        </h4>
        <div className="space-y-3">
          {arrearsList.map(fee => (
            <div key={fee.id} className="flex flex-col md:flex-row md:items-center justify-between border border-slate-200 rounded-lg p-3 bg-white">
              <div className="mb-2 md:mb-0">
                <p className="font-semibold text-sm">{fee.memberName}</p>
                {fee.email && <p className="text-xs text-slate-500">{fee.email}</p>}
                <div className="flex gap-2 mt-1 items-center">
                  <span className="text-xs font-bold text-red-600 border border-red-200 bg-red-50 px-2 py-0.5 rounded uppercase">
                    {fee.status.replace('_', ' ')}
                  </span>
                  {fee.adminComment && (
                    <span className="text-xs italic text-slate-500">Note: {fee.adminComment}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col md:items-end gap-2 text-sm">
                <p>
                  <span className="text-slate-500">Remainder:</span> <span className="font-bold">{fee.remainingAmount} NOK</span>
                </p>
                <button 
                  onClick={() => copyReminder(fee)}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-3 py-1.5 rounded transition-colors text-xs flex items-center gap-1 font-semibold"
                >
                  <MessageSquare className="w-3 h-3" />
                  {lang === 'pl' ? 'Kopiuj przypomnienie' : lang === 'no' ? 'Kopier påminnelse' : 'Copy reminder'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>

  <div className="border-t pt-4 space-y-3 leading-relaxed text-xs text-slate-600 font-normal">
    <p>
      🇳🇴 <strong>Norsk Årsberetning:</strong> Selskapet har i 2026 styrket posisjonen som bæreelement i Frosta. Med over 210 kg hentet avfall fra bunnen av Småland havn har vi sikret marint økosystem i fylket.
    </p>
    <p>
      🇬🇧 <strong>English Abstract:</strong> Through intensive outreach, Diving Ecology Education Frosta integrated Polish and multilingual local divers into active Trondheimsfjord protection tasks. Local bank sponsors verified funding.
    </p>
    <p>
      🇵🇱 <strong>Polski Skrót:</strong> W 2026 r. stowarzyszenie Diving Ecology Education Frosta odniosło znaczący sukces we wdrażaniu ekologicznych aktywacji we Frosta przy wsparciu partnerów. ZainstalowanoPUBLICZNY AED dla Småland.
    </p>
  </div>
    </>
  )}

</div>
  );
}
