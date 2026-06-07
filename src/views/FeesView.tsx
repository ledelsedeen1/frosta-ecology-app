import React from 'react';
import {
  Users, Calendar, DollarSign, FileText, Layers, Volume2, Mail,
  Shield, Search, Plus, Activity, TrendingUp, BarChart2, Clock,
  RefreshCw, CheckCircle2, X, Trash2, Lock, FileSpreadsheet,
  MessageSquare, Bell, Settings, CreditCard, Tag
} from 'lucide-react';
import { Lang } from '../types';
import { translations } from '../translations';
import { ASSOC_SETTINGS, DONATION_PURPOSES, BankTransferInstructionCard, NorwegianBankSelector, PaymentAdminPanel } from '../App';

export interface FeesViewProps {
  state: any;
  fees?: any[];
  feesSupabaseStatus?: 'demo' | 'connected' | 'error';
  handleUpdateSupabaseFee?: (id: string, status: any, note: string) => void;
  lang: Lang;
  role: string;
  activePersona: string;
  setActiveTab: (tab: string) => void;
  payments: any[];
  setPayments: (p: any[]) => void;
  auditLog: any[];
  paymentIntent: any;
  setPaymentIntent: (v: any) => void;
  paymentTab: string;
  setPaymentTab: (t: string) => void;
  donationAmount: number;
  setDonationAmount: (v: number) => void;
  donationCustomAmount: string;
  setDonationCustomAmount: (v: string) => void;
  donationPurpose: string;
  setDonationPurpose: (v: string) => void;
  donorName: string;
  setDonorName: (v: string) => void;
  donorEmail: string;
  setDonorEmail: (v: string) => void;
  donorPhone: string;
  setDonorPhone: (v: string) => void;
  donorAnonymous: boolean;
  setDonorAnonymous: (v: boolean) => void;
  donorWantsReceipt: boolean;
  setDonorWantsReceipt: (v: boolean) => void;
  memberPaidClicked: boolean;
  setMemberPaidClicked: (v: boolean) => void;
  handlePaymentStatusChange: (id: string, status: any, note: string, reason: string) => void;
}

export default function FeesView(props: FeesViewProps) {
  const { state, fees = [], feesSupabaseStatus, handleUpdateSupabaseFee, lang, role, activePersona, setActiveTab, payments, setPayments, auditLog, paymentIntent, setPaymentIntent, paymentTab, setPaymentTab,
    donationAmount, setDonationAmount, donationCustomAmount, setDonationCustomAmount, donationPurpose, setDonationPurpose,
    donorName, setDonorName, donorEmail, setDonorEmail, donorPhone, setDonorPhone,
    donorAnonymous, setDonorAnonymous, donorWantsReceipt, setDonorWantsReceipt,
    memberPaidClicked, setMemberPaidClicked, handlePaymentStatusChange } = props;
  const t = translations[lang] || translations.no;
  
  return (
<div className="space-y-6 pb-24">
  {/* PAYMENT & DONATION SYSTEM - Diving Ecology Education Frosta */}
  <div className="bg-gradient-to-br from-teal-800 to-slate-900 rounded-2xl p-5 text-white">
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-xl font-extrabold flex items-center gap-2">
        {lang==='pl'?'System płatności i darowizn':lang==='en'?'Payment & Donation System':'Betaling og donasjoner'}
      </h2>
      {(role === 'admin' || role === 'board') && feesSupabaseStatus === 'connected' && (
        <span className="bg-emerald-500/20 text-emerald-200 text-[10px] uppercase font-bold tracking-wider py-1 px-3 rounded-full border border-emerald-500/30 whitespace-nowrap">
          SUPABASE FEES CONNECTED
        </span>
      )}
      {(role === 'admin' || role === 'board') && (feesSupabaseStatus === 'demo' || feesSupabaseStatus === 'error') && (
        <span className="bg-amber-500/20 text-amber-200 text-[10px] uppercase font-bold tracking-wider py-1 px-3 rounded-full border border-amber-500/30 whitespace-nowrap">
          DEMO FEES IN USE
        </span>
      )}
    </div>
    <p className="text-teal-200 text-sm mt-1">Diving Ecology Education Frosta</p>
    <div className="flex flex-wrap gap-2 mt-3">
      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">✅ {lang==='pl'?'Przelew bankowy: Dostępny':lang==='en'?'Bank transfer: Available':'Bankoverføring: Tilgjengelig'}</span>
      <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded-full">⚠️ Vipps: {lang==='pl'?'Nie skonfigurowano':lang==='en'?'Not configured':'Ikke konfigurert'}</span>
      <span className="text-xs bg-red-700 text-white px-2 py-1 rounded-full">🚫 {lang==='pl'?'Karta: Nie używana':lang==='en'?'Card: Not used':'Kortbetaling: Ikke i bruk'}</span>
      <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded-full">⚠️ Open Banking: {lang==='pl'?'Nie skonfigurowano':lang==='en'?'Not configured':'Ikke konfigurert'}</span>
    </div>
  </div>

  {/* TAX DEDUCTION NOTICE */}
  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
    <p className="font-semibold mb-1">🇳🇴 {lang==='pl'?'Informacja o odliczeniu podatkowym':lang==='en'?'Tax deduction information':'Skattefradragsinformasjon'}</p>
    <p>{lang==='pl'?'Odliczenie podatkowe darowizn jest dostępne tylko jeśli Diving Ecology Education Frosta jest zatwierdzone przez Skatteetaten do raportowania odliczeń od darowizn i raportowanie jest aktywne.':lang==='en'?'Tax deduction for donations is only available if Diving Ecology Education Frosta is approved by Skatteetaten for gift deduction reporting and reporting is active.':'Skattefradrag for donasjoner er kun tilgjengelig hvis Diving Ecology Education Frosta er godkjent av Skatteetaten for gavefradragsrapportering og rapportering er aktiv.'}</p>
  </div>

  {/* INTENT SELECTOR TABS */}
  <div className="flex gap-2 flex-wrap">
    <button onClick={()=>setPaymentTab('fee')}
      className={'flex-1 py-3 rounded-xl font-semibold text-sm transition-all '+(paymentTab==='fee'?'bg-teal-600 text-white shadow-md':'bg-white border border-slate-200 text-slate-600 hover:border-teal-400')}>
      🏦 {lang==='pl'?'Opłata członkowska':lang==='en'?'Membership fee':'Betal kontingent'}
    </button>
    <button onClick={()=>setPaymentTab('donation')}
      className={'flex-1 py-3 rounded-xl font-semibold text-sm transition-all '+(paymentTab==='donation'?'bg-blue-600 text-white shadow-md':'bg-white border border-slate-200 text-slate-600 hover:border-blue-400')}>
      💙 {lang==='pl'?'Złóż darowiznę':lang==='en'?'Make a donation':'Gi en donasjon'}
    </button>
    {(role === "admin" || role === "board") && (
      <button onClick={()=>setPaymentTab('admin')}
        className={'px-4 py-3 rounded-xl font-semibold text-sm transition-all '+(paymentTab==='admin'?'bg-indigo-600 text-white shadow-md':'bg-white border border-slate-200 text-slate-600 hover:border-indigo-400')}>
        🛡️ {lang==='pl'?'Panel zarządu':lang==='en'?'Board panel':'Styrepanel'} ({payments.filter(p=>p.status==='PENDING_CONFIRMATION'||p.status==='NEEDS_CLARIFICATION').length})
      </button>
    )}
  </div>

  {/* === MEMBERSHIP FEE TAB === */}
  {paymentTab === 'fee' && (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-700 text-lg">
        {lang==='pl'?'Płatność składki członkowskiej':lang==='en'?'Membership fee payment':'Betaling av medlemskontingent'}
      </h3>
      {!memberPaidClicked ? (
        <div className="space-y-4">
          <BankTransferInstructionCard
            lang={lang}
            amount={ASSOC_SETTINGS.defaultMembershipFee}
            paymentMessage={lang==='pl'?'Składka członkowska '+ASSOC_SETTINGS.membershipYear+' – [Twoje imię i nazwisko]':lang==='en'?'Membership fee '+ASSOC_SETTINGS.membershipYear+' – [Your name]':('Medlemskontingent '+ASSOC_SETTINGS.membershipYear+' – [Ditt navn]')}
            type="membership_fee"
          />
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
            ⚠️ {lang==='pl'?'Płatność zostanie potwierdzona ręcznie przez zarząd Diving Ecology Education Frosta':lang==='en'?'Payment will be manually confirmed by the board of Diving Ecology Education Frosta':'Betaling bekreftes manuelt av styret i Diving Ecology Education Frosta'}
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={()=>setMemberPaidClicked(true)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
              ✅ {lang==='pl'?'Zapłaciłem/łam':lang==='en'?'I have paid':'Jeg har betalt'}
            </button>
            <button className="flex-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
              🔔 {lang==='pl'?'Powiadom zarząd':lang==='en'?'Notify board':'Varsle styret'}
            </button>
          </div>
          <NorwegianBankSelector lang={lang} />
        </div>
      ) : (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 text-center space-y-4">
          <div className="text-4xl">⏳</div>
          <h3 className="font-extrabold text-yellow-800 text-lg">
            {lang==='pl'?'Status: Oczekuje na potwierdzenie zarządu':lang==='en'?'Status: Pending board confirmation':'Status: Venter på bekreftelse fra styret'}
          </h3>
          <div className="text-sm text-yellow-700 space-y-2 text-left">
            <p>✔ {lang==='pl'?'Twoja płatność została zgłoszona.':lang==='en'?'Your payment has been reported.':'Betalingen din er rapportert.'}</p>
            <p>⏳ {lang==='pl'?'Płatność nie została jeszcze potwierdzona.':lang==='en'?'The payment is not confirmed yet.':'Betalingen er ikke bekreftet ennå.'}</p>
            <p>👥 {lang==='pl'?'Zarząd/administrator musi zweryfikować przelew bankowy.':lang==='en'?'The board/admin must verify the bank transfer.':'Styre/admin må verifisere bankoverføringen.'}</p>
            <p>📋 {lang==='pl'?'Status: Oczekuje na potwierdzenie zarządu/administratora.':lang==='en'?'Status: Pending board/admin confirmation.':'Status: Venter på bekreftelse fra styre/admin.'}</p>
          </div>
          <div className="w-full">
            <label className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer">
              📎 {lang==='pl'?'Załącz kwit':lang==='en'?'Upload receipt':'Last opp kvittering'}
              <input
                type="file"
                accept="image/*,application/pdf"
                capture="environment"
                className="hidden"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    alert((lang==='pl'?'Plik wybrany: ':lang==='en'?'File selected: ':'Fil valgt: ') + file.name + '\n\n' + (lang==='pl'?'Status: Oczekiwanie na potwierdzenie zarządu/administratora. Plik nie jest trwale przechowywany do czasu skonfigurowania backendu.':lang==='en'?'Status: Pending board/admin confirmation. File is not permanently stored until storage backend is configured.':'Status: Venter på bekreftelse fra styre/admin. Filen lagres ikke permanent før lagringsbackend er konfigurert.'));
                  }
                }}
              />
            </label>
            <p className="text-xs text-slate-400 mt-1 text-center">
              {lang==='pl'?'Obraz lub PDF. Status pozostaje: Oczekujące.':lang==='en'?'Image or PDF. Status remains: Pending.':'Bilde eller PDF. Status forblir: Venter.'}
            </p>
          </div>
          <button onClick={()=>setMemberPaidClicked(false)} className="text-sm text-slate-500 hover:text-slate-700 underline">
            {lang==='pl'?'Powrót':lang==='en'?'Back':'Tilbake'}
          </button>
        </div>
      )}

      {/* MEMBER PAYMENT HISTORY */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mt-4">
        <h4 className="font-bold text-slate-700 mb-3">📋 {lang==='pl'?'Historia płatności':lang==='en'?'Payment history':'Betalingshistorikk'}</h4>
        
        {feesSupabaseStatus === 'connected' ? (
          fees.map(function(f: any) {
            const memberObj = state?.members?.find((m:any) => m.id === f.memberId);
            const mName = memberObj ? memberObj.fullName : ('Unknown (' + f.memberId.slice(0,6) + ')');
            let badgeStyle = 'bg-slate-100 text-slate-500';
            if (f.status === 'paid') badgeStyle = 'bg-green-100 text-green-700';
            if (f.status === 'unpaid') badgeStyle = 'bg-red-100 text-red-700';
            if (f.status === 'partially_paid') badgeStyle = 'bg-amber-100 text-amber-700';
            if (f.status === 'exempt') badgeStyle = 'bg-blue-100 text-blue-700';
            
            // Only show to admin/board or to the owner (in a real app we'd filter by logged in user ID, but mock logic shows all here or assume activePersona check)
            
            return (
              <div key={f.id} className="border-b border-slate-100 py-2 last:border-0 text-sm">
                <div className="flex justify-between items-start flex-wrap gap-1">
                  <div>
                    <span className="font-semibold">{mName}</span>
                    <span className="ml-2 text-slate-400">{f.year}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-teal-700">{f.amount} NOK</span>
                    <span className={'text-xs px-2 py-0.5 rounded-full uppercase ' + badgeStyle}>
                      {f.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                {f.paidAt && <p className="text-xs text-slate-400">Betalt: {f.paidAt}</p>}
                {f.paymentMethod && <p className="text-xs text-slate-500">💳 {f.paymentMethod}</p>}
                {(role==='admin'||role==='board') && f.adminComment && (
                  <p className="text-xs text-indigo-700 bg-indigo-50 rounded px-2 py-1 mt-1">Internnotat: {f.adminComment}</p>
                )}
              </div>
            );
          })
        ) : (
          payments.filter(p=>p.type==='membership_fee').map(function(p){
            return (
              <div key={p.id} className="border-b border-slate-100 py-2 last:border-0 text-sm">
                <div className="flex justify-between items-start flex-wrap gap-1">
                  <div>
                    <span className="font-semibold">{p.memberName}</span>
                    <span className="ml-2 text-slate-400">{p.year}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-teal-700">{p.amount} NOK</span>
                    <span className={'text-xs px-2 py-0.5 rounded-full '+(p.status==='CONFIRMED'?'bg-green-100 text-green-700':p.status==='PENDING_CONFIRMATION'?'bg-yellow-100 text-yellow-700':p.status==='REJECTED'?'bg-red-100 text-red-700':'bg-slate-100 text-slate-500')}>{p.status.replace('_',' ')}</span>
                  </div>
                </div>
                {p.dateClaimed && <p className="text-xs text-slate-400">Rapportert: {p.dateClaimed}</p>}
                {p.confirmedBy && <p className="text-xs text-green-600">✅ Bekreftet av {p.confirmedBy} ({p.confirmedDate})</p>}
                {p.receiptUploaded && <p className="text-xs text-blue-600">📎 {p.receiptFileName||'Kvittering lastet opp'}</p>}
                {(role==='admin'||role==='board') && p.adminNote && (
                  <p className="text-xs text-indigo-700 bg-indigo-50 rounded px-2 py-1 mt-1">Internnotat: {p.adminNote}</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  )}

  {/* === DONATION TAB === */}
  {paymentTab === 'donation' && (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-700 text-lg">
        {lang==='pl'?'Darowizna dla Diving Ecology Education Frosta':lang==='en'?'Donation to Diving Ecology Education Frosta':'Donasjon til Diving Ecology Education Frosta'}
      </h3>

      {/* AMOUNT */}
      <div>
        <label className="text-xs text-slate-500 uppercase">{lang==='pl'?'Kwota darowizny':lang==='en'?'Donation amount':'Donasjonsbeløp'}</label>
        <div className="grid grid-cols-3 gap-2 mt-1">
          {[100,250,500,1000].map(function(a){return (
            <button key={a} onClick={()=>{setDonationAmount(a);setDonationCustomAmount('');}}
              className={'py-2 rounded-lg text-sm font-semibold border transition-all '+(donationAmount===a&&!donationCustomAmount?'bg-teal-600 text-white border-teal-600':'bg-white border-slate-200 text-slate-700 hover:border-teal-400')}>
              {a} NOK</button>
          );})}
          <input type="number" placeholder={lang==='pl'?'Inna kwota':lang==='en'?'Custom':'Annet beløp'}
            value={donationCustomAmount} onChange={function(e){setDonationCustomAmount(e.target.value);setDonationAmount(parseInt(e.target.value)||0);}}
            className="col-span-3 mt-1 border border-slate-200 rounded-lg p-2 text-sm"/>
        </div>
      </div>

      {/* PURPOSE */}
      <div>
        <label className="text-xs text-slate-500 uppercase">{lang==='pl'?'Cel darowizny':lang==='en'?'Donation purpose':'Formål'}</label>
        <select value={donationPurpose} onChange={function(e){setDonationPurpose(e.target.value);}}
          className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm">
          {DONATION_PURPOSES.map(function(dp){return (
            <option key={dp.id} value={dp.id}>{lang==='pl'?dp.pl:lang==='en'?dp.en:dp.nb}</option>
          );})}
        </select>
      </div>

      {/* DONOR DETAILS */}
      <div className="space-y-2">
        {!donorAnonymous && (
          <>
            <input placeholder={lang==='pl'?'Imię i nazwisko':lang==='en'?'Full name':'Fullt navn'} value={donorName} onChange={function(e){setDonorName(e.target.value);}}
              className="w-full border border-slate-200 rounded-lg p-2 text-sm"/>
            <input placeholder={lang==='pl'?'Adres e-mail *':lang==='en'?'Email *':'E-postadresse *'} value={donorEmail} onChange={function(e){setDonorEmail(e.target.value);}}
              className="w-full border border-slate-200 rounded-lg p-2 text-sm"/>
            <input placeholder={lang==='pl'?'Telefon (opcjonalnie)':lang==='en'?'Phone (optional)':'Telefon (valgfritt)'} value={donorPhone} onChange={function(e){setDonorPhone(e.target.value);}}
              className="w-full border border-slate-200 rounded-lg p-2 text-sm"/>
          </>
        )}
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={donorAnonymous} onChange={function(e){setDonorAnonymous(e.target.checked);}} className="rounded"/>
          {lang==='pl'?'Anonimowa darowizna':lang==='en'?'Anonymous donation':'Anonym donasjon'}
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={donorWantsReceipt} onChange={function(e){setDonorWantsReceipt(e.target.checked);}} className="rounded"/>
          {lang==='pl'?'Chcę kwit/potwierdzenie':lang==='en'?'I want a receipt':'Jeg vil ha kvittering'}
        </label>
      </div>

      {/* BANK TRANSFER INSTRUCTIONS */}
      <BankTransferInstructionCard
        lang={lang}
        amount={donationAmount||250}
        paymentMessage={"Donasjon – " + (DONATION_PURPOSES.find(function(dp){return dp.id===donationPurpose;})||{nb:'generell'}).nb + " – " + (donorAnonymous?"Anonym":donorName||(lang==='pl'?'[Twoje imię i nazwisko]':lang==='en'?'[Your name]':'[Ditt navn]'))}
        type="donation"
      />

      {/* TAX DEDUCTION NOTICE */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
        {lang==='pl'?'Odliczenie podatkowe darowizn jest dostępne tylko jeśli Diving Ecology Education Frosta jest zatwierdzone przez Skatteetaten do raportowania odliczeń od darowizn i raportowanie jest aktywne. Do tego czasu darowizny nie są prezentowane jako podlegające odliczeniu podatkowemu.':lang==='en'?'Tax deduction for donations is only available if Diving Ecology Education Frosta is approved by Skatteetaten for gift deduction reporting and reporting is active. Until then, donations are not presented as tax-deductible.':'Skattefradrag for donasjoner er kun tilgjengelig hvis Diving Ecology Education Frosta er godkjent av Skatteetaten for gavefradragsrapportering og rapportering er aktiv. Inntil da presenteres donasjoner ikke som skattefradragsberettigede.'}
      </div>

      <NorwegianBankSelector lang={lang} />

      {/* RECEIPT PREVIEW for confirmed donations */}
      {payments.filter(p=>p.type==='donation'&&p.status==='CONFIRMED'&&p.wantsReceipt&&!p.receiptSent).length>0 && (role==='admin'||role==='board') && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm">
          <p className="font-bold text-green-700 mb-2">📧 Kvitteringer klare for utsending:</p>
          {payments.filter(p=>p.type==='donation'&&p.status==='CONFIRMED'&&p.wantsReceipt&&!p.receiptSent).map(function(p){
            return (
              <div key={p.id} className="flex items-center justify-between py-1 border-b border-green-100 last:border-0">
                <span>{p.anonymous?'[Anonym]':p.memberName} — {p.amount} NOK</span>
                <button className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">
                  Send kvittering (simulert)
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* DONATION HISTORY */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h4 className="font-bold text-slate-700 mb-3">📋 {lang==='pl'?'Historia darowizn':lang==='en'?'Donation history':'Donasjonshistorikk'}</h4>
        {payments.filter(p=>p.type==='donation').map(function(p){
          var purposeObj = DONATION_PURPOSES.find(function(dp){return dp.id===p.purpose;});
          return (
            <div key={p.id} className="border-b border-slate-100 py-2 last:border-0 text-sm">
              <div className="flex justify-between items-start flex-wrap gap-1">
                <span className="font-semibold">{p.anonymous?'[Anonym]':p.memberName}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-700">{p.amount} NOK</span>
                  <span className={'text-xs px-2 py-0.5 rounded-full '+(p.status==='CONFIRMED'?'bg-green-100 text-green-700':p.status==='PENDING_CONFIRMATION'?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700')}>{p.status.replace('_',' ')}</span>
                </div>
              </div>
              {purposeObj && <p className="text-xs text-teal-600">{lang==='pl'?purposeObj.pl:lang==='en'?purposeObj.en:purposeObj.nb}</p>}
              {p.confirmedBy && <p className="text-xs text-green-600">✅ {p.confirmedBy} ({p.confirmedDate})</p>}
              {p.wantsReceipt && <p className="text-xs text-blue-500">Kvittering: {p.receiptSent?'✅ Sent':'⏳ Venter'}</p>}
            </div>
          );
        })}
      </div>
    </div>
  )}

  {/* === ADMIN PANEL TAB === */}
  {paymentTab === 'admin' && (
    <div className="space-y-6">
      {feesSupabaseStatus === 'connected' && (
        <div className="bg-white border-2 border-teal-200 rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-teal-800 text-lg mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" /> 
            Supabase Membership Fees Administration
          </h3>
          <div className="space-y-3">
            {fees.map((f: any) => {
              const memberObj = state?.members?.find((m:any) => m.id === f.memberId);
              const mName = memberObj ? memberObj.fullName : ('Unknown (' + f.memberId.slice(0,6) + ')');
              return (
                <div key={f.id} className="border border-slate-200 p-3 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50">
                  <div>
                    <p className="font-semibold">{mName} <span className="font-normal text-slate-500">({f.year})</span></p>
                    <p className="text-sm font-bold text-slate-700">{f.amount} NOK</p>
                    {f.adminComment && <p className="text-xs text-indigo-600 mt-1">Note: {f.adminComment}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="border border-slate-300 rounded p-1 text-sm bg-white"
                      value={f.status}
                      onChange={(e) => {
                        if (handleUpdateSupabaseFee) {
                          const note = prompt("Admin comment (optional):", f.adminComment || "");
                          handleUpdateSupabaseFee(f.id, e.target.value, note || "");
                        }
                      }}
                    >
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                      <option value="partially_paid">Partially Paid</option>
                      <option value="exempt">Exempt</option>
                    </select>
                  </div>
                </div>
              );
            })}
            {fees.length === 0 && <p className="text-sm text-slate-500">No membership fees found in Supabase.</p>}
          </div>
        </div>
      )}

      {/* Legacy/Mock Admin Panel for Donations & Mock Fees */}
      <div>
        <h3 className="font-bold text-slate-700 text-lg mb-4 flex items-center gap-2">
          Legacy / Other Payments Administration
        </h3>
        <PaymentAdminPanel
          payments={payments}
          auditLog={auditLog}
          lang={lang}
          userRole={role}
          onStatusChange={handlePaymentStatusChange}
        />
      </div>
    </div>
  )}
</div>
  );
}
