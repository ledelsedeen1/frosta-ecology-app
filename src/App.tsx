/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * SECURITY NOTICE:
 * Aplikacja przechowuje dane członków wyłącznie do celów administracyjnych stowarzyszenia. 
 * Dostęp do danych osobowych i statusu płatności powinni mieć wyłącznie członkowie zarządu lub osoby upoważnione. 
 * Aplikacja nie zastępuje systemu księgowego, prawnika ani oficjalnych systemów publicznych.
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { 
  Users, Calendar, DollarSign, FileText, Layers, Volume2, 
  Shield, Activity, TrendingUp, Plus, Search, 
  X, Mail, FileSpreadsheet, Lock, Trash2, CreditCard, BarChart2,
  RefreshCw, CheckCircle2, UserCheck, ShieldAlert, Settings
} from 'lucide-react';
import { translations } from './translations';
import { MembershipCardsPage } from './MembershipCardsPage';
import { Member, Event, Project, DocumentMeta, Announcement, SystemLog, Lang, UserRole, MemberStatus, MemberType, PaymentStatus, ParticipantRole, Message, MessageType, MessageModule } from './types';
import { DemoBanner } from './DemoBanner';
import { getMonthAbbr } from './dateUtils';

import DashboardView from './views/DashboardView';
import MembersView from './views/MembersView';
import EventsView from './views/EventsView';
import FeesView from './views/FeesView';
import VolunteersView from './views/VolunteersView';
import ProjectsView from './views/ProjectsView';
import DocumentsView from './views/DocumentsView';
import CommsView from './views/CommsView';
import ReportsView from './views/ReportsView';
import PrivacyView from './views/PrivacyView';
import NotificationsView from './views/NotificationsView';
import PrivacyPolicyView from './views/PrivacyPolicyView';
import LoginView from './views/LoginView';
import UpdatePasswordView from './views/UpdatePasswordView';
import { authService, UserSession } from './services/authService';
import { membersService } from './services/membersService';
import { feesService, MembershipFee } from './services/feesService';
import { documentsService, SupabaseDocument } from './services/documentsService';
import { eventsService, SupabaseEvent } from './services/eventsService';
import { isDemoMode } from './lib/supabase';
import { DivingLogo } from './components/DivingLogo';
import { isBoardOrAdminRole, isGuestRole, normalizeRole } from './roleUtils';

// ============================================================
// BANK TRANSFER PAYMENTS & DONATIONS MODULE
// Diving Ecology Education Frosta
// ============================================================

// ============================================================
// DIVING ECOLOGY EDUCATION FROSTA — PAYMENT & DONATION MODULE
// Central Configuration — do not hardcode bank account elsewhere
// ============================================================

interface AssociationPaymentSettings {
  associationName: string;
  bankAccountNumber: string;
  bankAccountOwner: string;
  addressLine1: string;
  postalCode: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  organisationNumber: string;
  brregUrl: string;
  defaultMembershipFee: number;
  membershipYear: number;
  confirmationEmail: string;
  taxDeductionStatus: "not_enabled" | "preparing" | "approved" | "reporting_active";
  bankInstructions: { nb: string; pl: string; en: string; };
  donationInstructions: { nb: string; pl: string; en: string; };
}

export const ASSOC_SETTINGS: AssociationPaymentSettings = {
  associationName: "Diving Ecology Education Frosta",
  bankAccountNumber: "4213 18 57351",
  bankAccountOwner: "Diving Ecology Education Frosta",
  addressLine1: "Gammelbakkan 45",
  postalCode: "7633",
  city: "Frosta",
  country: "Norway",
  email: "ledelsedeen@gmail.com",
  phone: "+47 465 66 406",
  organisationNumber: "926 177 621",
  brregUrl: "https://virksomhet.brreg.no/nb/oppslag/enheter/926177621",
  defaultMembershipFee: 350,
  membershipYear: 2026,
  confirmationEmail: "ledelsedeen@gmail.com",
  taxDeductionStatus: "not_enabled",
  bankInstructions: {
    nb: "Betal til Diving Ecology Education Frosta. Kontonummer: 4213 18 57351. Merk betalingen med fullt navn og år.",
    pl: "Przelej do Diving Ecology Education Frosta. Numer konta: 4213 18 57351. W tytule przelewu podaj imię, nazwisko i rok.",
    en: "Transfer to Diving Ecology Education Frosta. Bank account: 4213 18 57351. Include your full name and year in the payment message."
  },
  donationInstructions: {
    nb: "Betal til Diving Ecology Education Frosta. Kontonummer: 4213 18 57351. Merk med 'Donasjon' og formål.",
    pl: "Przelej do Diving Ecology Education Frosta. Numer konta: 4213 18 57351. W tytule wpisz 'Donacja' i cel.",
    en: "Transfer to Diving Ecology Education Frosta. Bank account: 4213 18 57351. Write 'Donation' and the purpose in the message."
  }
};

export const DONATION_PURPOSES = [
  { id: "general", nb: "Generell støtte", pl: "Wsparcie ogólne", en: "General support" },
  { id: "cleanup", nb: "Undervannsopprydding", pl: "Sprzątanie podwodne", en: "Underwater cleanup" },
  { id: "smaland_arena", nb: "Blå Helsesarena Småland", pl: "Blå Helsesarena Småland", en: "Blå Helsesarena Småland" },
  { id: "aed", nb: "AED/hjertestarteri for Småland", pl: "AED/defibrylator dla Småland", en: "AED/defibrillator for Småland" },
  { id: "education", nb: "Marin utdanning for barn og unge", pl: "Edukacja morska dla dzieci i młodzieży", en: "Marine education for children and youth" },
  { id: "ecology", nb: "Lokale fjordøkologiaktiviteter", pl: "Lokalne aktywności ekologiczne fiordu", en: "Local fjord ecology activities" },
  { id: "equipment", nb: "Utstyr til frivillighetsaktiviteter", pl: "Sprzęt do działań wolontariackich", en: "Equipment for volunteer activities" }
];

interface PaymentRecord {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  type: "membership_fee" | "donation";
  purpose?: string;
  paymentMessage: string;
  dateClaimed: string;
  status: "UNPAID" | "PENDING_CONFIRMATION" | "CONFIRMED" | "REJECTED" | "NEEDS_CLARIFICATION" | "OVERDUE";
  receiptUploaded: boolean;
  receiptFileName?: string;
  confirmedBy?: string;
  confirmedDate?: string;
  anonymous?: boolean;
  wantsReceipt?: boolean;
  donorEmail?: string;
  donorPhone?: string;
  receiptSent?: boolean;
  adminNote?: string;
  rejectionReason?: string;
  clarificationMessage?: string;
  year: number;
}

interface PaymentAuditEntry {
  id: string;
  paymentId: string;
  memberName: string;
  amount: number;
  type: "membership_fee" | "donation";
  previousStatus: string;
  newStatus: string;
  changedBy: string;
  changedAt: string;
  adminNote?: string;
  receiptFileName?: string;
}

const PAYMENT_DEMO_DATA: PaymentRecord[] = [
  { id: "p1", memberId: "m1", memberName: "Marek Kowalski", amount: 350, type: "membership_fee", paymentMessage: "Medlemskontingent 2026 – Marek Kowalski", dateClaimed: "2026-01-10", status: "CONFIRMED", receiptUploaded: true, receiptFileName: "kvittering_marek_2026.pdf", confirmedBy: "Arne Solbakken", confirmedDate: "2026-01-15", year: 2026 },
  { id: "p2", memberId: "m2", memberName: "Ingrid Haugum", amount: 350, type: "membership_fee", paymentMessage: "Medlemskontingent 2026 – Ingrid Haugum", dateClaimed: "2026-05-20", status: "PENDING_CONFIRMATION", receiptUploaded: true, receiptFileName: "kvittering_ingrid_2026.jpg", year: 2026 },
  { id: "p3", memberId: "m3", memberName: "Lars-Erik Svendsen", amount: 350, type: "membership_fee", paymentMessage: "Medlemskontingent 2026 – Lars-Erik Svendsen", dateClaimed: "", status: "UNPAID", receiptUploaded: false, year: 2026 },
  { id: "p4", memberId: "m4", memberName: "Janusz Nowak", amount: 250, type: "donation", purpose: "cleanup", paymentMessage: "Donasjon – undervannsopprydding – Janusz Nowak", dateClaimed: "2026-05-25", status: "PENDING_CONFIRMATION", receiptUploaded: false, wantsReceipt: true, donorEmail: "janusz.nowak78@wp.pl", year: 2026 },
  { id: "p5", memberId: "m5", memberName: "Elena Rostova", amount: 500, type: "donation", purpose: "smaland_arena", paymentMessage: "Donasjon – Blå Helsesarena Småland – Elena Rostova", dateClaimed: "2026-04-10", status: "CONFIRMED", receiptUploaded: false, wantsReceipt: true, donorEmail: "elena.rostova@mail.ru", confirmedBy: "Arne Solbakken", confirmedDate: "2026-04-12", receiptSent: false, year: 2026 },
  { id: "p6", memberId: "m6", memberName: "Anonym giver", amount: 100, type: "donation", purpose: "general", paymentMessage: "Donasjon – generell støtte", dateClaimed: "2026-05-01", status: "REJECTED", receiptUploaded: false, anonymous: true, wantsReceipt: false, rejectionReason: "Betalingsmelding uklar, klarte ikke identifisere betaler.", year: 2026 }
];

const AUDIT_DEMO_DATA: PaymentAuditEntry[] = [
  { id: "a1", paymentId: "p1", memberName: "Marek Kowalski", amount: 350, type: "membership_fee", previousStatus: "PENDING_CONFIRMATION", newStatus: "CONFIRMED", changedBy: "Arne Solbakken", changedAt: "2026-01-15 10:22", adminNote: "Sjekket bankutskrift, betaling mottatt.", receiptFileName: "kvittering_marek_2026.pdf" },
  { id: "a2", paymentId: "p1", memberName: "Marek Kowalski", amount: 350, type: "membership_fee", previousStatus: "UNPAID", newStatus: "PENDING_CONFIRMATION", changedBy: "Marek Kowalski", changedAt: "2026-01-10 14:05" },
  { id: "a3", paymentId: "p6", memberName: "Anonym giver", amount: 100, type: "donation", previousStatus: "PENDING_CONFIRMATION", newStatus: "REJECTED", changedBy: "Arne Solbakken", changedAt: "2026-05-03 09:11", adminNote: "Betalingsmelding uklar." }
];;


// ============================================================
// BANK TRANSFER INSTRUCTION CARD
// ============================================================
export function BankTransferInstructionCard({
  lang, paymentMessage, amount, type
}: {
  lang: string; paymentMessage: string; amount: number; type: "membership_fee" | "donation";
}) {
  const [copiedField, setCopiedField] = React.useState<string|null>(null);
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).catch(()=>{});
    setCopiedField(field);
    setTimeout(()=>setCopiedField(null), 2000);
  };
  const t = {
    recipient: lang==='pl'?'Odbiorca':lang==='en'?'Recipient':'Mottaker',
    account: lang==='pl'?'Numer konta':lang==='en'?'Account number':'Kontonummer',
    amount: lang==='pl'?'Kwota':lang==='en'?'Amount':'Beløp',
    message: lang==='pl'?'Tytuł przelewu':lang==='en'?'Payment message':'Betalingsmelding',
    kid: lang==='pl'?'KID/Referencja':lang==='en'?'KID/Reference':'KID/Referanse',
    notConfigured: lang==='pl'?'Nie skonfigurowano':lang==='en'?'Not configured':'Ikke konfigurert',
    copy: lang==='pl'?'Kopiuj':lang==='en'?'Copy':'Kopier',
    copied: lang==='pl'?'Skopiowano!':lang==='en'?'Copied!':'Kopiert!',
    warning: lang==='pl'?'Płatność musi być potwierdzona ręcznie przez zarząd Diving Ecology Education Frosta.':
             lang==='en'?'Payment must be manually confirmed by the board of Diving Ecology Education Frosta.':
             'Betaling må bekreftes manuelt av styret i Diving Ecology Education Frosta.',
    title: lang==='pl'?'Instrukcja przelewu bankowego':lang==='en'?'Bank Transfer Instructions':'Betalingsinstruksjon'
  };
  const accountNum = ASSOC_SETTINGS.bankAccountNumber;
  return (
    <div className="border border-teal-200 rounded-xl p-4 bg-white space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">🏦</span>
        <span className="font-bold text-slate-700">{t.title}</span>
      </div>
      <div>
        <span className="text-xs text-slate-400 uppercase tracking-wide">{t.recipient}</span>
        <p className="font-semibold text-slate-800">{ASSOC_SETTINGS.associationName}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {lang==='pl'?'Numer organizacji':lang==='en'?'Organisation number':'Organisasjonsnummer'}: {ASSOC_SETTINGS.organisationNumber}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <div><span className="text-xs text-slate-400 uppercase tracking-wide">{t.account}</span>
          <p className="font-mono font-bold text-lg text-slate-800">{accountNum}</p></div>
        <button onClick={()=>copyToClipboard(accountNum,'account')} className="text-xs bg-teal-100 hover:bg-teal-200 text-teal-800 px-2 py-1 rounded">
          {copiedField==='account'?t.copied:t.copy}</button>
      </div>
      <div className="flex items-center justify-between">
        <div><span className="text-xs text-slate-400 uppercase tracking-wide">{t.amount}</span>
          <p className="font-bold text-xl text-slate-800">{amount} NOK</p></div>
        <button onClick={()=>copyToClipboard(String(amount),'amount')} className="text-xs bg-teal-100 hover:bg-teal-200 text-teal-800 px-2 py-1 rounded">
          {copiedField==='amount'?t.copied:t.copy}</button>
      </div>
      <div className="flex items-center justify-between">
        <div><span className="text-xs text-slate-400 uppercase tracking-wide">{t.message}</span>
          <p className="text-slate-800">{paymentMessage}</p></div>
        <button onClick={()=>copyToClipboard(paymentMessage,'msg')} className="text-xs bg-teal-100 hover:bg-teal-200 text-teal-800 px-2 py-1 rounded">
          {copiedField==='msg'?t.copied:t.copy}</button>
      </div>
      <div><span className="text-xs text-slate-400 uppercase tracking-wide">{t.kid}</span>
        <p className="text-slate-400 italic">{t.notConfigured}</p></div>
      <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-800">
        ⚠️ {t.warning}
      </div>
    </div>
  );
}

// ============================================================
// NORWEGIAN BANK SELECTOR (placeholder - not configured)
// ============================================================
export function NorwegianBankSelector({ lang }: { lang: string }) {
  const [showNotice, setShowNotice] = React.useState(false);
  const [selectedBank, setSelectedBank] = React.useState('');
  const banks = ['DNB','SpareBank 1','Nordea','Handelsbanken','Danske Bank','Sbanken','Sparebanken Møre','Sparebanken Vest','Annen bank'];
  const t = {
    title: lang==='pl'?'Płać bezpośrednio ze swojego norweskiego banku (przyszła funkcja)':lang==='en'?'Pay directly from your Norwegian bank (future feature)':'Betal direkte fra din norske nettbank (fremtidig funksjon)',
    noticeTitle: lang==='pl'?'Nie skonfigurowano':lang==='en'?'Not configured':'Ikke konfigurert',
    noticeBody: lang==='pl'?'Bezpośrednie logowanie do banku nie jest jeszcze skonfigurowane. Proszę użyć zwykłego przelewu bankowego.':lang==='en'?'Direct bank login is not configured yet. Please use ordinary bank transfer.':'Direkte bankinnlogging er ikke konfigurert ennå. Vennligst bruk vanlig bankoverføring.',
    close: lang==='pl'?'Zamknij':lang==='en'?'Close':'Lukk'
  };
  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded">NO</span>
        <span className="text-sm text-slate-600">{t.title}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {banks.map(function(bank){return (
          <button key={bank} onClick={function(){setSelectedBank(bank);setShowNotice(true);}}
            className="flex flex-col items-center p-2 bg-white border border-slate-200 rounded-lg hover:border-teal-400 hover:bg-teal-50 transition-all text-xs text-slate-600">
            <span className="text-xl mb-1">🏦</span>{bank}
          </button>
        );})}
      </div>
      {showNotice && (
        <div className="mt-3 bg-amber-50 border border-amber-300 rounded-lg p-3">
          <p className="font-bold text-amber-800 text-sm">{t.noticeTitle}: {selectedBank}</p>
          <p className="text-xs text-amber-700 mt-1">{t.noticeBody}</p>
          <button onClick={function(){setShowNotice(false);}} className="mt-2 text-xs bg-amber-200 hover:bg-amber-300 text-amber-900 px-3 py-1 rounded">{t.close}</button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PAYMENT ADMIN PANEL (board/admin only)
// ============================================================
export function PaymentAdminPanel({
  payments, auditLog, lang, userRole, onStatusChange
}: {
  payments: PaymentRecord[];
  auditLog: PaymentAuditEntry[];
  lang: string;
  userRole: string;
  onStatusChange: (id: string, newStatus: PaymentRecord['status'], note: string, reason?: string) => void;
}) {
  const [tab, setTab] = React.useState<'pending'|'confirmed'|'all'|'audit'|'settings'>('pending');
  const [noteMap, setNoteMap] = React.useState<Record<string,string>>({});
  const [reasonMap, setReasonMap] = React.useState<Record<string,string>>({});
  const [settingsEdit, setSettingsEdit] = React.useState(false);
  const [localSettings, setLocalSettings] = React.useState({...ASSOC_SETTINGS});

  if(!isBoardOrAdminRole(userRole)) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <span className="text-3xl">🔒</span>
        <p className="font-bold text-red-700 mt-2">
          {lang==='pl'?'Brak dostępu. Tylko członkowie zarządu i administratorzy.':lang==='en'?'Access denied. Board members and administrators only.':'Ingen tilgang. Kun styremedlemmer og administratorer.'}
        </p>
      </div>
    );
  }

  const t = {
    pending: lang==='pl'?'Oczekujące':lang==='en'?'Pending':'Ventende',
    confirmed: lang==='pl'?'Potwierdzone':lang==='en'?'Confirmed':'Bekreftede',
    all: lang==='pl'?'Wszystkie':lang==='en'?'All':'Alle',
    audit: lang==='pl'?'Dziennik audytu':lang==='en'?'Audit log':'Revisjonslogg',
    settings: lang==='pl'?'Ustawienia':lang==='en'?'Settings':'Innstillinger',
    confirm: lang==='pl'?'Potwierdź płatność':lang==='en'?'Confirm payment':'Bekreft betaling',
    reject: lang==='pl'?'Odrzuć':lang==='en'?'Reject':'Avvis',
    clarify: lang==='pl'?'Proś o wyjaśnienie':lang==='en'?'Request clarification':'Be om klaråring',
    duplicate: lang==='pl'?'Oznacz jako duplikat':lang==='en'?'Mark as duplicate':'Merk som duplikat',
    internalNote: lang==='pl'?'Notatka wewnętrzna (widoczna tylko dla zarządu)':lang==='en'?'Internal note (board/admin only)':'Internnotat (kun synlig for styre/admin)',
    rejectionReason: lang==='pl'?'Powód odrzucenia':lang==='en'?'Reason for rejection':'Avslagsgrunn',
    receiptUploaded: lang==='pl'?'Kwit załączony':lang==='en'?'Receipt uploaded':'Kvittering lastet opp',
    noReceipt: lang==='pl'?'Brak kwitu':lang==='en'?'No receipt':'Ingen kvittering',
    claimedOn: lang==='pl'?'Zgłoszono':lang==='en'?'Claimed on':'Oppgitt betalt',
    confirmedBy: lang==='pl'?'Potwierdzone przez':lang==='en'?'Confirmed by':'Bekreftet av',
    save: lang==='pl'?'Zapisz':lang==='en'?'Save':'Lagre',
    cancel: lang==='pl'?'Anuluj':lang==='en'?'Cancel':'Avbryt',
    editSettings: lang==='pl'?'Edytuj ustawienia':lang==='en'?'Edit settings':'Rediger innstillinger'
  };

  const statusColor = (s: string) => {
    if(s==='CONFIRMED') return 'bg-green-100 text-green-800';
    if(s==='PENDING_CONFIRMATION') return 'bg-yellow-100 text-yellow-800';
    if(s==='REJECTED') return 'bg-red-100 text-red-800';
    if(s==='NEEDS_CLARIFICATION') return 'bg-orange-100 text-orange-800';
    if(s==='UNPAID' || s==='OVERDUE') return 'bg-slate-100 text-slate-600';
    return 'bg-gray-100 text-gray-600';
  };

  const pendingList = payments.filter(function(p){return p.status==='PENDING_CONFIRMATION'||p.status==='NEEDS_CLARIFICATION';});
  const confirmedList = payments.filter(function(p){return p.status==='CONFIRMED';});

  const displayList = tab==='pending'?pendingList:tab==='confirmed'?confirmedList:payments;

  const purposeLabel = (id?: string) => {
    if(!id) return '';
    var found = DONATION_PURPOSES.find(function(p){return p.id===id;});
    if(!found) return id;
    return lang==='pl'?found.pl:lang==='en'?found.en:found.nb;
  };

  const renderPaymentCard = (p: PaymentRecord) => (
    <div key={p.id} className="border border-slate-200 rounded-xl p-4 bg-white space-y-2 mb-3">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <p className="font-bold text-slate-800">{p.anonymous?'[Anonym]':p.memberName}</p>
          <p className="text-lg font-bold text-teal-700">{p.amount} NOK</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={'text-xs px-2 py-0.5 rounded-full font-medium '+statusColor(p.status)}>{p.status.replace('_',' ')}</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{p.type==='donation'?'Donasjon':'Medlemskontingent'}</span>
        </div>
      </div>
      <p className="text-xs text-slate-500">{p.paymentMessage}</p>
      {p.purpose && <p className="text-xs text-teal-600">Formål: {purposeLabel(p.purpose)}</p>}
      {p.dateClaimed && <p className="text-xs text-slate-400">{t.claimedOn}: {p.dateClaimed}</p>}
      {p.receiptUploaded && <p className="text-xs text-green-600">📎 {t.receiptUploaded}: {p.receiptFileName||'kvittering'}</p>}
      {!p.receiptUploaded && p.status==='PENDING_CONFIRMATION' && <p className="text-xs text-amber-600">⚠️ {t.noReceipt}</p>}
      {p.confirmedBy && <p className="text-xs text-green-700">✅ {t.confirmedBy}: {p.confirmedBy} ({p.confirmedDate})</p>}
      {p.adminNote && <p className="text-xs text-indigo-700 bg-indigo-50 rounded px-2 py-1">Notat: {p.adminNote}</p>}
      {p.rejectionReason && <p className="text-xs text-red-700 bg-red-50 rounded px-2 py-1">Avslagsgrunn: {p.rejectionReason}</p>}
      {p.wantsReceipt && <p className="text-xs text-blue-600">Kvittering ønsket: {p.receiptSent?'✅ Sent':'⏳ Ikke sendt'}</p>}
      {p.donorEmail && <p className="text-xs text-slate-400">E-post: {p.donorEmail}</p>}
      {(p.status==='PENDING_CONFIRMATION'||p.status==='NEEDS_CLARIFICATION') && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <textarea
            placeholder={t.internalNote}
            value={noteMap[p.id]||''}
            onChange={function(e){setNoteMap(function(prev){var n={...prev};n[p.id]=e.target.value;return n;});}}
            className="w-full text-xs border border-slate-200 rounded p-2 resize-none h-16"
          />
          <input
            placeholder={t.rejectionReason}
            value={reasonMap[p.id]||''}
            onChange={function(e){setReasonMap(function(prev){var n={...prev};n[p.id]=e.target.value;return n;});}}
            className="w-full text-xs border border-slate-200 rounded p-2"
          />
          <div className="flex flex-wrap gap-2">
            <button onClick={function(){onStatusChange(p.id,'CONFIRMED',noteMap[p.id]||'');}}
              className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1">
              ✅ {t.confirm}</button>
            <button onClick={function(){onStatusChange(p.id,'REJECTED',noteMap[p.id]||'',reasonMap[p.id]||'');}}
              className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1">
              ❌ {t.reject}</button>
            <button onClick={function(){onStatusChange(p.id,'NEEDS_CLARIFICATION',noteMap[p.id]||'',reasonMap[p.id]||'');}}
              className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1">
              ❓ {t.clarify}</button>
          </div>
        </div>
      )}
    </div>
  );

  const donationTotals = DONATION_PURPOSES.map(function(dp){
    var total = payments.filter(function(p){return p.type==='donation'&&p.purpose===dp.id&&p.status==='CONFIRMED';}).reduce(function(sum,p){return sum+p.amount;},0);
    return {purpose: dp, total};
  }).filter(function(x){return x.total>0;});

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {(['pending','confirmed','all','audit','settings'] as const).map(function(tabKey){
          const labels: Record<string,string> = {pending:t.pending+' ('+pendingList.length+')',confirmed:t.confirmed+' ('+confirmedList.length+')',all:t.all,audit:t.audit,settings:t.settings};
          return (<button key={tabKey} onClick={function(){setTab(tabKey);}}
            className={'text-xs px-3 py-1.5 rounded-full font-medium transition-colors '+(tab===tabKey?'bg-teal-600 text-white':'bg-slate-100 hover:bg-teal-100 text-slate-600')}>
            {labels[tabKey]}
          </button>);
        })}
      </div>

      {(tab==='pending'||tab==='confirmed'||tab==='all') && (
        <div>
          {displayList.length===0 && <p className="text-slate-400 text-sm text-center py-4">{lang==='pl'?'Brak pozycji':lang==='en'?'No entries found':'Ingen oppføringer'}</p>}
          {displayList.map(renderPaymentCard)}
        </div>
      )}

      {tab==='audit' && (
        <div className="space-y-2">
          <h4 className="font-bold text-slate-700 text-sm">📋 {t.audit}</h4>
          {auditLog.length===0 && <p className="text-slate-400 text-sm">Ingen logg ennå.</p>}
          {auditLog.map(function(a){return (
            <div key={a.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50 text-xs space-y-1">
              <div className="flex justify-between flex-wrap">
                <span className="font-semibold">{a.memberName}</span>
                <span className="text-slate-400">{a.changedAt}</span>
              </div>
              <p>{a.amount} NOK • {a.type==='donation'?'Donasjon':'Kontingent'}</p>
              <p>
                <span className="bg-slate-200 px-1 rounded">{a.previousStatus}</span>
                {' → '}
                <span className={'px-1 rounded '+(a.newStatus==='CONFIRMED'?'bg-green-200':a.newStatus==='REJECTED'?'bg-red-200':'bg-yellow-200')}>{a.newStatus}</span>
              </p>
              <p className="text-slate-500">Endret av: {a.changedBy}</p>
              {a.adminNote && <p className="text-indigo-700 bg-indigo-50 px-2 py-1 rounded">Notat: {a.adminNote}</p>}
              {a.receiptFileName && <p className="text-green-600">📎 {a.receiptFileName}</p>}
            </div>
          );})}
        </div>
      )}

      {tab==='settings' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-700">⚙️ {t.settings} — Diving Ecology Education Frosta</h4>
            {!settingsEdit && <button onClick={function(){setSettingsEdit(true);}} className="text-xs bg-teal-600 text-white px-3 py-1 rounded">{t.editSettings}</button>}
          </div>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <label className="text-xs text-slate-400 uppercase">Kontonummer</label>
              {settingsEdit?<input value={localSettings.bankAccountNumber} onChange={function(e){setLocalSettings(function(s){return {...s,bankAccountNumber:e.target.value};});}} className="w-full border rounded p-1 mt-1 text-sm"/>:<p className="font-mono font-bold mt-1">{localSettings.bankAccountNumber}</p>}
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <label className="text-xs text-slate-400 uppercase">Kontingent {localSettings.membershipYear} (NOK)</label>
              {settingsEdit?<input type="number" value={localSettings.defaultMembershipFee} onChange={function(e){setLocalSettings(function(s){return {...s,defaultMembershipFee:parseInt(e.target.value)||350};});}} className="w-full border rounded p-1 mt-1 text-sm"/>:<p className="font-bold mt-1">{localSettings.defaultMembershipFee} NOK</p>}
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <label className="text-xs text-slate-400 uppercase">Skattefradragsstatus</label>
              {settingsEdit?(
                <select value={localSettings.taxDeductionStatus} onChange={function(e){setLocalSettings(function(s){return {...s,taxDeductionStatus:e.target.value as any};});}} className="w-full border rounded p-1 mt-1 text-sm">
                  <option value="not_enabled">Ikke aktivert</option>
                  <option value="preparing">Forbereder søknad</option>
                  <option value="approved">Godkjent av Skatteetaten</option>
                  <option value="reporting_active">Rapportering aktiv</option>
                </select>
              ):(
                <p className="mt-1 font-medium text-amber-700">{
                  localSettings.taxDeductionStatus==='not_enabled'?'Ikke aktivert':
                  localSettings.taxDeductionStatus==='preparing'?'Forbereder søknad':
                  localSettings.taxDeductionStatus==='approved'?'Godkjent av Skatteetaten':
                  'Rapportering aktiv'
                }</p>
              )}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              Skattefradrag for donasjoner er kun tilgjengelig hvis Diving Ecology Education Frosta er godkjent av Skatteetaten for gavefradragsrapportering og rapportering er aktiv.
            </div>
            {donationTotals.length>0 && (
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <p className="text-xs text-slate-400 uppercase mb-2">Donasjonstotaler per formål (bekreftede)</p>
                {donationTotals.map(function(dt){return (
                  <div key={dt.purpose.id} className="flex justify-between text-sm py-1 border-b border-slate-100 last:border-0">
                    <span>{lang==='pl'?dt.purpose.pl:lang==='en'?dt.purpose.en:dt.purpose.nb}</span>
                    <span className="font-bold text-teal-700">{dt.total} NOK</span>
                  </div>
                );})}

            {/* Official Registration Card */}
            <div className="bg-white border border-slate-200 rounded-lg p-3 mt-2">
              <p className="text-xs text-slate-400 uppercase mb-2 font-bold">
                {lang==='pl'?'Oficjalna rejestracja':lang==='en'?'Official registration':'Offisiell registrering'}
              </p>
              <div className="space-y-1 text-sm">
                <p className="font-bold text-[#0A2E36]">Diving Ecology Education Frosta</p>
                <p className="text-slate-500">{ASSOC_SETTINGS.addressLine1}, {ASSOC_SETTINGS.postalCode} {ASSOC_SETTINGS.city}, {ASSOC_SETTINGS.country}</p>
                <p className="text-slate-500">
                  {lang==='pl'?'Numer organizacji':lang==='en'?'Organisation number':'Organisasjonsnummer'}: <span className="font-bold">{ASSOC_SETTINGS.organisationNumber}</span>
                </p>
                <p className="text-slate-500">
                  {lang==='pl'?'Numer konta':lang==='en'?'Bank account':'Kontonummer'}: <span className="font-bold">{ASSOC_SETTINGS.bankAccountNumber}</span>
                </p>
                <p className="text-slate-500">
                  {lang==='pl'?'E-mail':lang==='en'?'Email':'E-post'}: <a href={`mailto:${ASSOC_SETTINGS.email}`} className="text-[#278EA5] hover:underline">{ASSOC_SETTINGS.email}</a>
                </p>
                <p className="text-slate-500">
                  {lang==='pl'?'Telefon':lang==='en'?'Phone':'Telefon'}: <a href={`tel:${ASSOC_SETTINGS.phone}`} className="text-[#278EA5] hover:underline">{ASSOC_SETTINGS.phone}</a>
                </p>
                <a
                  href={ASSOC_SETTINGS.brregUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 mt-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded px-2 py-1 hover:bg-blue-100 font-bold"
                >
                  🔗 {lang==='pl'?'Zarejestrowane w Brønnøysundregistrene':lang==='en'?'Registered in the Brønnøysund Register':'Registrert i Brønnøysundregistrene'} ↗
                </a>
              </div>
            </div>

              </div>
            )}
          </div>
          {settingsEdit && (
            <div className="flex gap-2">
              <button onClick={function(){setSettingsEdit(false);}} className="text-xs bg-teal-600 text-white px-4 py-2 rounded">{t.save}</button>
              <button onClick={function(){setLocalSettings({...ASSOC_SETTINGS});setSettingsEdit(false);}} className="text-xs bg-slate-200 text-slate-700 px-4 py-2 rounded">{t.cancel}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState<Lang>('no');
  const [role, setRole] = useState<UserRole>('admin');
  const [activePersona, setActivePersona] = useState<string>('admin_default');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  // Payment & Donation State - Diving Ecology Education Frosta
  const [payments, setPayments] = React.useState<PaymentRecord[]>(PAYMENT_DEMO_DATA || []);
  const [auditLog, setAuditLog] = React.useState<PaymentAuditEntry[]>(AUDIT_DEMO_DATA || []);
  const [paymentIntent, setPaymentIntent] = React.useState<"fee" | "donation" | null>(null);
  const [donationAmount, setDonationAmount] = React.useState<number>(250);
  const [donationCustomAmount, setDonationCustomAmount] = React.useState<string>('');
  const [donationPurpose, setDonationPurpose] = React.useState<string>("general");
  const [donorName, setDonorName] = React.useState<string>('');
  const [donorEmail, setDonorEmail] = React.useState<string>('');
  const [donorPhone, setDonorPhone] = React.useState<string>('');
  const [donorAnonymous, setDonorAnonymous] = React.useState<boolean>(false);
  const [donorWantsReceipt, setDonorWantsReceipt] = React.useState<boolean>(true);
  const [paymentTab, setPaymentTab] = React.useState<"fee" | "donation" | "admin">("fee");
  const [memberPaidClicked, setMemberPaidClicked] = React.useState<boolean>(false);
  const [showReceiptPreview, setShowReceiptPreview] = React.useState<string|null>(null);


  const handlePaymentStatusChange = (id: string, newStatus: PaymentRecord['status'], adminNote: string, reason?: string) => {
    const now = new Date().toISOString().slice(0,16).replace('T',' ');
    setPayments(function(prev) {
      return prev.map(function(p) {
        if(p.id === id) {
          return { ...p, status: newStatus, adminNote: adminNote||p.adminNote, rejectionReason: reason||p.rejectionReason,
            confirmedBy: newStatus==='CONFIRMED'?'[Admin/Styre]':p.confirmedBy,
            confirmedDate: newStatus==='CONFIRMED'?now.slice(0,10):p.confirmedDate };
        }
        return p;
      });
    });
    setAuditLog(function(prev) {
      var oldP = payments.find(function(p){return p.id===id;});
      var entry: PaymentAuditEntry = {
        id: 'a'+Date.now(), paymentId: id,
        memberName: oldP?oldP.memberName:'?', amount: oldP?oldP.amount:0,
        type: oldP?oldP.type:'membership_fee', previousStatus: oldP?oldP.status:'?',
        newStatus: newStatus, changedBy: '[Admin/Styre]', changedAt: now,
        adminNote: adminNote||undefined, receiptFileName: oldP?oldP.receiptFileName:undefined
      };
      return [entry, ...prev];
    });
  };


  const selectPersona = (pId: string) => {
    setActivePersona(pId);
    let r: UserRole = 'guest';
    let l: Lang = 'en';

    if (pId === 'admin_default') { r = 'admin'; l = 'no'; }
    else if (pId === 'board_default') { r = 'board'; l = 'no'; }
    else if (pId === 'volunteer_default' || pId === 'marek_kowalski') { r = 'volunteer'; l = 'pl'; }
    else if (pId === 'member_default' || pId === 'elena_rostova') { r = 'member'; l = 'en'; }
    else if (pId === 'ingrid_haugum') { r = 'volunteer'; l = 'no'; }
    else if (pId === 'guest_default') { r = 'guest'; l = 'en'; }

    setRole(r);
    setLang(l);
  };
  const [user, setUser] = useState<UserSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [passwordRecoveryMode, setPasswordRecoveryMode] = useState(() => (
    typeof window !== 'undefined'
      ? authService.isPasswordRecoveryUrl(window.location.href)
      : false
  ));
  const [passwordRecoveryError, setPasswordRecoveryError] = useState(false);

  const [state, setState] = useState<{
    members: Member[];
    events: Event[];
    projects: Project[];
    documents: DocumentMeta[];
    announcements: Announcement[];
    logs: SystemLog[];
    messages: Message[];
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modal toggle states
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [showProjModal, setShowProjModal] = useState(false);

  // Sub-detail states
  const [selectedMemberForDetail, setSelectedMemberForDetail] = useState<Member | null>(null);
  const [isEditingMember, setIsEditingMember] = useState(false);
  const [memberEditForm, setMemberEditForm] = useState<any>(null);
  const [showTaskInsert, setShowTaskInsert] = useState(false);
  const [taskInsertProjectId, setTaskInsertProjectId] = useState<string>('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');

  // Forms
  const [memberForm, setMemberForm] = useState({
    fullName: '', email: '', phone: '', address: '',
    preferredLanguage: 'no' as Lang, memberType: 'individual' as MemberType,
    status: 'new_applicant' as MemberStatus, consentPrivacy: true, consentPhoto: true,
    emergencyContactName: '', emergencyContactPhone: '', notes: ''
  });

  const [eventForm, setEventForm] = useState({
    title: '', date: '', startTime: '10:00', endTime: '14:00', location: '', description: '',
    category: 'cleanup', maxParticipants: 30, visibility: 'public' as 'public' | 'members' | 'board',
    safetyNotes: '', requiredEquipment: '', internalNotes: '', pointsValue: 30
  });

  const [docForm, setDocForm] = useState({
    title: '', category: 'other', fileName: '', isPrivate: false, visibility: 'public' as 'public' | 'members' | 'board',
    lang: 'no' as Lang, description: ''
  });

  const [annForm, setAnnForm] = useState({
    title: '', body: '', isPrivate: false, lang: 'no' as Lang
  });

  const [projForm, setProjForm] = useState({
    name: '', description: '', responsiblePerson: '', budget: 20000,
    fundingSource: '', sponsorsCsv: ''
  });

  // Communications Template active selection
  const [selectedTemplate, setSelectedTemplate] = useState<string>('welcome');
  const [customMailBody, setCustomMailBody] = useState<string>('');

  // Multilingual Communicator state
  const [msgText, setMsgText] = useState('');
  const [selectedModule, setSelectedModule] = useState<MessageModule>('general');
  const [msgType, setMsgType] = useState<MessageType>('normal');
  const [relatedId, setRelatedId] = useState('');
  const [chatFilter, setChatFilter] = useState<string>('all');
  const [showOriginalMsg, setShowOriginalMsg] = useState<Record<string, boolean>>({});
  const [dmRecipientId, setDmRecipientId] = useState<string>('mem_2'); 
  const [sendingMsg, setSendingMsg] = useState(false);

  const getLoggedInUser = () => {
    if (user) {
      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        preferredLanguage: lang,
        role: normalizeRole(user.role)
      };
    }
    
    switch(activePersona) {
      case 'admin_default':
        return { id: 'mem_admin', fullName: 'Anders Myrseth', email: 'anders.myrseth@frosta.no', preferredLanguage: 'no' as Lang, role: 'admin' as UserRole };
      case 'board_default':
        return { id: 'mem_1', fullName: 'Arne Solbakken', email: 'arne.solbakken@frosta.kommune.no', preferredLanguage: 'no' as Lang, role: 'board' as UserRole };
      case 'volunteer_default':
      case 'marek_kowalski':
        return { id: 'mem_2', fullName: 'Marek Kowalski', email: 'marek.kowalski@gmail.com', preferredLanguage: 'pl' as Lang, role: 'volunteer' as UserRole };
      case 'member_default':
      case 'elena_rostova':
        return { id: 'mem_3', fullName: 'Elena Rostova', email: 'elena.rostova@outlook.com', preferredLanguage: 'en' as Lang, role: 'member' as UserRole };
      case 'ingrid_haugum':
        return { id: 'mem_4', fullName: 'Ingrid Haugum', email: 'ingrid.h@haugum-gaard.no', preferredLanguage: 'no' as Lang, role: 'volunteer' as UserRole };
      case 'guest_default':
      default:
        // Try to match standard role fallback
        switch(role) {
          case 'admin':
            return { id: 'mem_admin', fullName: 'Anders Myrseth', email: 'anders.myrseth@frosta.no', preferredLanguage: 'no' as Lang, role: 'admin' as UserRole };
          case 'board':
            return { id: 'mem_1', fullName: 'Arne Solbakken', email: 'arne.solbakken@frosta.kommune.no', preferredLanguage: 'no' as Lang, role: 'board' as UserRole };
          case 'volunteer':
            return { id: 'mem_2', fullName: 'Marek Kowalski', email: 'marek.kowalski@gmail.com', preferredLanguage: 'pl' as Lang, role: 'volunteer' as UserRole };
          case 'member':
            return { id: 'mem_3', fullName: 'Elena Rostova', email: 'elena.rostova@outlook.com', preferredLanguage: 'en' as Lang, role: 'member' as UserRole };
          case 'guest':
          default:
            return { id: 'mem_guest', fullName: 'Anonymous Guest', email: 'guest@frosta-ecology.no', preferredLanguage: 'en' as Lang, role: 'guest' as UserRole };
        }
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!msgText.trim()) return;

    setSendingMsg(true);
    const user = getLoggedInUser();
    
    let resolvedType = msgType;
    if (selectedModule === 'board_only') resolvedType = 'board_decision';
    else if (selectedModule === 'volunteer') resolvedType = 'volunteer_request';
    else if (selectedModule === 'announcement') resolvedType = 'announcement';

    let resolvedRelatedId = undefined;
    if (selectedModule === 'event' || selectedModule === 'project') {
      resolvedRelatedId = relatedId || (selectedModule === 'event' ? state?.events[0]?.id : state?.projects[0]?.id);
    } else if (selectedModule === 'direct') {
      resolvedRelatedId = dmRecipientId;
    }

    const payload = {
      module: selectedModule,
      relatedId: resolvedRelatedId,
      type: resolvedType,
      senderId: user.id,
      senderName: user.fullName,
      originalText: msgText,
      actor: user.fullName
    };

    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setState(data.state);
        setMsgText('');
        if (data.state.messages?.length) {
          const newestId = data.state.messages[data.state.messages.length - 1].id;
          setShowOriginalMsg(prev => ({ ...prev, [newestId]: false }));
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleMarkMessageAsRead = async (messageId: string) => {
    const user = getLoggedInUser();
    if (user.id === 'mem_guest') return; 
    
    const msg = state?.messages?.find(m => m.id === messageId);
    if (msg && !msg.readBy.includes(user.id)) {
      try {
        const res = await fetch('/api/messages/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId, memberId: user.id })
        });
        if (res.ok) {
          const data = await res.json();
          setState(data.state);
        }
      } catch (err) {
        console.error("Error marking message as read:", err);
      }
    }
  };

  useEffect(() => {
    authService.getCurrentUser().then(u => {
      setUser(u);
      if (u) {
        setRole(normalizeRole(u.role));
      }
      setAuthLoading(false);
    });
    fetchState();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!authService.isPasswordRecoveryUrl(window.location.href)) return;

    let cancelled = false;
    setPasswordRecoveryMode(true);
    setPasswordRecoveryError(false);
    setAuthLoading(false);

    authService.consumePasswordRecoveryUrl(window.location.href).then(result => {
      if (cancelled) return;
      setPasswordRecoveryError(Boolean(result.error || !result.recovered));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = async (email: string, pass: string) => {
    const res = await authService.login(email, pass);
    if (res.user) {
      setUser(res.user);
      setRole(normalizeRole(res.user.role));
      await fetchState();
    }
    return res;
  };

  const handleRequestPasswordReset = async (email: string) => {
    return authService.requestPasswordReset(email);
  };

  const handleUpdatePassword = async (password: string) => {
    if (passwordRecoveryError) return { error: 'PASSWORD_RECOVERY_LINK_INVALID' };
    return authService.updatePassword(password);
  };

  const handleReturnToLogin = () => {
    setPasswordRecoveryMode(false);
    setPasswordRecoveryError(false);
    setUser(null);
    setRole('guest');
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, '/');
    }
  };
  
  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };
  
    useEffect(() => {
          const langMap: Record<string, string> = { no: 'no', pl: 'pl', en: 'en' };
              document.documentElement.lang = langMap[lang as string] || 'no';
                }, [lang]);
    

  useEffect(() => {
    if (selectedMemberForDetail) {
      setMemberEditForm({ ...selectedMemberForDetail });
    } else {
      setIsEditingMember(false);
      setMemberEditForm(null);
    }
  }, [selectedMemberForDetail]);

  const [membersSupabaseStatus, setMembersSupabaseStatus] = useState<'demo' | 'connected' | 'error'>('demo');
  const [feesSupabaseStatus, setFeesSupabaseStatus] = useState<'demo' | 'connected' | 'error'>('demo');
  const [documentsSupabaseStatus, setDocumentsSupabaseStatus] = useState<'demo' | 'connected' | 'error'>('demo');
  const [eventsSupabaseStatus, setEventsSupabaseStatus] = useState<'demo' | 'connected' | 'error'>('demo');
  const [fees, setFees] = useState<MembershipFee[]>([]);
  const [documents, setDocuments] = useState<SupabaseDocument[]>([]);
  const [events, setEvents] = useState<SupabaseEvent[]>([]);

  async function fetchState() {
    setLoading(true);
    try {
      const data: {
        members: Member[];
        events: Event[];
        projects: Project[];
        documents: DocumentMeta[];
        announcements: Announcement[];
        logs: SystemLog[];
        messages: Message[];
      } = {
        members: [],
        events: [],
        projects: [],
        documents: [],
        announcements: [],
        logs: [],
        messages: [],
      };

      if (!isDemoMode() && authService && (await authService.getCurrentUser())) {
          const supabaseResult = await membersService.getAll();
          if (supabaseResult.data && !supabaseResult.error) {
            data.members = supabaseResult.data;
            setMembersSupabaseStatus('connected');
          } else {
            console.warn("Supabase members fetch failed, falling back to mock data.", supabaseResult.error);
            setMembersSupabaseStatus('error');
          }

          const feesResult = await feesService.getAll();
          if (feesResult.data && !feesResult.error) {
            setFees(feesResult.data);
            setFeesSupabaseStatus('connected');
          } else {
            console.warn("Supabase fees fetch failed, falling back to mock data.", feesResult.error);
            setFeesSupabaseStatus('error');
          }

          const docsResult = await documentsService.getAll();
          if (docsResult.data && !docsResult.error) {
            setDocuments(docsResult.data);
            setDocumentsSupabaseStatus('connected');
          } else {
            console.warn("Supabase documents fetch failed, falling back to mock data.", docsResult.error);
            setDocumentsSupabaseStatus('error');
          }

          const eventsResult = await eventsService.getAll();
          if (eventsResult.data && !eventsResult.error) {
            setEvents(eventsResult.data);
            setEventsSupabaseStatus('connected');
          } else {
            console.warn("Supabase events fetch failed, falling back to mock data.", eventsResult.error);
            setEventsSupabaseStatus('error');
          }
        } else if (isDemoMode()) {
          setMembersSupabaseStatus('demo');
          setFeesSupabaseStatus('demo');
          setDocumentsSupabaseStatus('demo');
          setEventsSupabaseStatus('demo');
        }

        setState(data);
    } catch (e) {
      console.error("Error loading Diving Ecology Education Frosta state", e);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteMember = async (id: string, fullName: string) => {
    if (!confirm(`GDPR Notice: Permanently erase ${fullName}?`)) return;
    
    if (membersSupabaseStatus === 'connected') {
      const res = await membersService.delete(id);
      if (!res.error) {
        await fetchState();
      } else {
        console.error("Error deleting member in Supabase", res.error);
        alert("Failed to delete member in database.");
      }
    } else {
      await executePost('/api/members/delete', { id });
    }
  };

  const handleUpdateSupabaseFee = async (id: string, status: MembershipFee['status'], note: string) => {
    if (feesSupabaseStatus !== 'connected') return;
    const res = await feesService.update(id, { status, adminComment: note });
    if (!res.error) {
      await fetchState();
    } else {
      console.error("Error updating fee in Supabase", res.error);
      alert("Failed to update fee in database.");
    }
  };

  const executePost = async (url: string, bodyJson: any) => {
    if (!isDemoMode()) {
      console.warn(`Blocked demo API mutation in live mode: ${url}`);
      alert('This workflow is not connected to Supabase yet and is disabled in live mode.');
      return false;
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...bodyJson, actor: `Simulated: ${role.toUpperCase()}` })
      });
      if (res.ok) {
        const payloadData = await res.json();
        if (payloadData.state) {
          setState((prevState) => {
            if (!prevState) return payloadData.state;
            return {
              ...payloadData.state,
              members: membersSupabaseStatus === 'connected' ? prevState.members : payloadData.state.members
            };
          });
          
          // If viewing member, refresh the drawer source reference
          if (selectedMemberForDetail) {
            const listToSearch = membersSupabaseStatus === 'connected' ? state?.members : payloadData.state.members;
            const updated = listToSearch?.find?.((m: Member) => m.id === selectedMemberForDetail.id);
            if (updated) setSelectedMemberForDetail(updated);
          }
        }
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const handleCreateMember = async (e: FormEvent) => {
    e.preventDefault();
    if (membersSupabaseStatus === 'connected') {
      const res = await membersService.create(memberForm);
      if (!res.error) {
        await fetchState();
        setShowMemberModal(false);
        setMemberForm({
          fullName: '', email: '', phone: '', address: '',
          preferredLanguage: 'no', memberType: 'individual',
          status: 'new_applicant', consentPrivacy: true, consentPhoto: true,
          emergencyContactName: '', emergencyContactPhone: '', notes: ''
        });
      } else {
        console.error("Error creating member in Supabase", res.error);
        alert("Failed to save member in database.");
      }
    } else {
      const ok = await executePost('/api/members/add', memberForm);
      if (ok) {
        setShowMemberModal(false);
        setMemberForm({
          fullName: '', email: '', phone: '', address: '',
          preferredLanguage: 'no', memberType: 'individual',
          status: 'new_applicant', consentPrivacy: true, consentPhoto: true,
          emergencyContactName: '', emergencyContactPhone: '', notes: ''
        });
      }
    }
  };

  const handleUpdateMember = async (e: FormEvent) => {
    e.preventDefault();
    if (!memberEditForm) return;

    if (membersSupabaseStatus === 'connected') {
      const res = await membersService.update(memberEditForm.id, memberEditForm);
      if (!res.error) {
        await fetchState();
        setIsEditingMember(false);
        // Note: fetchState will trigger a re-mount or re-render, but wait we need to fix detail view
        const updated = state?.members?.find?.((m) => m.id === memberEditForm.id) || null;
        if (updated) setSelectedMemberForDetail(updated); // This may be stale until fetchState is done, but fetchState modifies state asynchronously. Actually fetchState updates state object directly.
        // Let's just fetchState and then clear standard forms
      } else {
        console.error("Error updating member in Supabase", res.error);
        alert("Failed to update member in database.");
      }
    } else {
      const ok = await executePost('/api/members/update', memberEditForm);
      if (ok) {
        setIsEditingMember(false);
        const updated = state?.members.find((m) => m.id === memberEditForm.id);
        if (updated) setSelectedMemberForDetail(updated);
      }
    }
  };

  const handleCreateEvent = async (e: FormEvent) => {
    e.preventDefault();
    if (eventsSupabaseStatus === 'connected') {
      const res = await eventsService.create({
        title: eventForm.title,
        description: eventForm.description,
        eventDate: eventForm.date,
        startTime: eventForm.startTime,
        endTime: eventForm.endTime,
        location: eventForm.location,
        eventType: eventForm.category as any,
        visibility: eventForm.visibility,
        maxParticipants: eventForm.maxParticipants,
      });
      if (!res.error) {
        setShowEventModal(false);
        setEventForm({
          title: '', date: '', startTime: '10:00', endTime: '14:00', location: '', description: '',
          category: 'cleanup', maxParticipants: 30, visibility: 'public',
          safetyNotes: '', requiredEquipment: '', internalNotes: '', pointsValue: 30
        });
        await fetchState();
      } else {
        alert("Failed to create event in Supabase");
        console.error(res.error);
      }
    } else {
      const ok = await executePost('/api/events/create', eventForm);
      if (ok) {
        setShowEventModal(false);
        setEventForm({
          title: '', date: '', startTime: '10:00', endTime: '14:00', location: '', description: '',
          category: 'cleanup', maxParticipants: 30, visibility: 'public',
          safetyNotes: '', requiredEquipment: '', internalNotes: '', pointsValue: 30
        });
      }
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    if (eventsSupabaseStatus === 'connected') {
      const res = await eventsService.delete(id);
      if (!res.error) {
        await fetchState();
      } else {
        alert("Failed to delete event: " + res.error);
      }
    } else {
      alert("Delete is only supported for connected Supabase events in this demo mode.");
    }
  };

  const handleCreateDoc = async (e: FormEvent) => {
    e.preventDefault();
    if (documentsSupabaseStatus === 'connected') {
      const res = await documentsService.create({
        title: docForm.title,
        description: docForm.description,
        category: docForm.category as any, // Category mapping is not exact yet, let's just assert
        language: docForm.lang,
        visibility: docForm.visibility,
        fileUrl: docForm.fileName
      });
      if (!res.error) {
        setShowDocModal(false);
        setDocForm({
          title: '', category: 'other', fileName: '', isPrivate: false, visibility: 'public',
          lang: 'no', description: ''
        });
        await fetchState(); // reload documents
      } else {
        alert("Failed to create document in Supabase");
        console.error(res.error);
      }
    } else {
      const ok = await executePost('/api/documents/upload', docForm);
      if (ok) {
        setShowDocModal(false);
        setDocForm({
          title: '', category: 'other', fileName: '', isPrivate: false, visibility: 'public',
          lang: 'no', description: ''
        });
      }
    }
  };

  const handleCreateAnnMessage = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await executePost('/api/announcements/create', { ...annForm });
    if (ok) {
      setShowAnnModal(false);
      setAnnForm({ title: '', body: '', isPrivate: false, lang: 'no' });
    }
  };

  const handleCreateProject = async (e: FormEvent) => {
    e.preventDefault();
    const sponsors = projForm.sponsorsCsv ? projForm.sponsorsCsv.split(',').map(s => s.trim()) : [];
    const ok = await executePost('/api/projects/create', { ...projForm, sponsors });
    if (ok) {
      setShowProjModal(false);
      setProjForm({ name: '', description: '', responsiblePerson: '', budget: 20000, fundingSource: '', sponsorsCsv: '' });
    }
  };

  const handleAddTaskToProject = async () => {
    if (!newTaskTitle || !taskInsertProjectId) return;
    const ok = await executePost('/api/projects/add-task', {
      projectId: taskInsertProjectId,
      title: newTaskTitle,
      assignedTo: newTaskAssignee
    });
    if (ok) {
      setNewTaskTitle('');
      setNewTaskAssignee('');
      setShowTaskInsert(false);
    }
  };

  // Switch translations
  const t = translations[lang] || translations.no;
  const normalizedCurrentRole = normalizeRole(role);

  // Filters based on Role limits
  const visibleAnnouncements = state?.announcements.filter(a => {
    if (isGuestRole(normalizedCurrentRole)) return !a.isPrivate;
    return true;
  }) || [];

  const visibleDocuments = state?.documents.filter(d => {
    if (!isBoardOrAdminRole(normalizedCurrentRole)) {
      return !d.isPrivate;
    }
    return true;
  }) || [];

  const pendingMembers = state?.members.filter(m => m.status === 'new_applicant' || m.status === 'waiting_approval') || [];
  const activeMembersTotal = state?.members.filter(m => m.status === 'active' || m.status === 'board').length || 0;
  const unpaidMembers = state?.members.filter(m => m.status !== 'former' && m.paymentStatus !== 'paid' && m.paymentStatus !== 'exempt') || [];

  // Estimated Cleanup weight logic from cleanup events points
  const estimatedCleanupTrashKg = 210 + (state?.events.filter(e => e.category === 'cleanup' && e.registrations.some(r => r.status === 'attended')).length || 0) * 85;

  const loggedUser = getLoggedInUser();
  const unreadMsgCount = state?.messages.filter(m => {
    if (m.visibility === 'board_only' && !isBoardOrAdminRole(loggedUser.role)) return false;
    return !m.readBy.includes(loggedUser.id);
  }).length || 0;

  // Search filter
  const filteredMembersList = state?.members.filter(m => {
    const q = searchQuery.toLowerCase();
    return m.fullName.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.phone.includes(q);
  }) || [];

  // Dynamic Communications content prefilling
  useEffect(() => {
    if (selectedTemplate === 'welcome') {
      setCustomMailBody(
        lang === 'no' 
          ? "Hei, og varmt velkommen til Diving Ecology Education Frosta!\n\nVi har godkjent din medlemssøknad. Vi er utrolig glade for at du vil bidra til marint miljøvern, dykkerøkologi og lokalt samfunnsengasjement her i Frosta.\n\nDu kan nå logge inn i portalen for å registrere deg på neste oppryddingsaksjon ved Småland!\n\nVennlig hilsen,\nStyret i Diving Ecology Education Frosta"
          : lang === 'pl'
          ? "Witaj serdecznie w Diving Ecology Education Frosta!\n\nTwój wniosek o członkostwo został pomyślnie zweryfikowany i zaakceptowany. Cieszymy się, że chcesz wspierać ochronę środowiska, ekologię morską i lokalną społeczność we Frosta.\n\nZapisz się na najbliższe sprzątanie fiordu przy Småland!\n\nZ poważaniem,\nZarząd Diving Ecology Education Frosta"
          : "Hello, and a warm welcome to Diving Ecology Education Frosta!\n\nYour membership application has been approved. We are thrilled to have you support marine ecology, underwater cleanups, and local community building in Frosta, Norway.\n\nYou can now log in to register for our upcoming Småland fjord cleaning outing!\n\nBest regards,\nthe board of Diving Ecology Education Frosta"
      );
    } else if (selectedTemplate === 'reminder') {
      setCustomMailBody(
        lang === 'no'
          ? `Kjære medlem,\n\nDette er en vennlig påminnelse om medlemskontingent for i år. Ditt bidrag sikrer innkjøp av ryddeutstyr og drift.\n\nKontingenten betales via bankoverføring til:\nMottaker: Diving Ecology Education Frosta\nKontonummer: ${ASSOC_SETTINGS.bankAccountNumber}\nBeløp: ${ASSOC_SETTINGS.defaultMembershipFee},- NOK\nBetalingsmelding: Medlemskontingent ${ASSOC_SETTINGS.membershipYear} – [Ditt navn]\n\nTusen takk for støtten!`
          : lang === 'pl'
          ? `Drogi Członku,\n\nTo jest przyjazne przypomnienie o rocznej składce członkowskiej. Twój wkład finansuje zakup sprzętu do sprzątania, utrzymanie strefy Blå Helsesarena oraz sprzęt ratunkowy.\n\nPrzelew bankowy na:\nOdbiorca: Diving Ecology Education Frosta\nNumer konta: ${ASSOC_SETTINGS.bankAccountNumber}\nKwota: ${ASSOC_SETTINGS.defaultMembershipFee} NOK\nTytuł: Składka ${ASSOC_SETTINGS.membershipYear} – [Twoje imię i nazwisko]\n\nDziękujemy za wsparcie!`
          : `Dear valued member,\n\nThis is a friendly reminder that your Diving Ecology Education Frosta annual membership fee is pending.\n\nBank transfer to:\nRecipient: Diving Ecology Education Frosta\nBank account: ${ASSOC_SETTINGS.bankAccountNumber}\nAmount: ${ASSOC_SETTINGS.defaultMembershipFee} NOK\nPayment message: Membership fee ${ASSOC_SETTINGS.membershipYear} – [Your full name]\n\nThank you for your support!`
      );
    } else if (selectedTemplate === 'invitation') {
      setCustomMailBody(
        lang === 'no'
          ? "Innkalling til dugnad og marin ryddeaksjon!\n\nVi inviterer herved alle dykkere, landstøtter og miljøvenner til aksjon ved Småland, Frosta. Dato: Søndag 14. juni kl 10:00.\nMeld deg på i portalen så vi vet hvor mye mat vi skal beregne!\n\nVel møtt!"
          : lang === 'pl'
          ? "Zaproszenie na sprzątanie podwodne i plażowe!\n\nZapraszamy płetwonurków, wsparcie brzegowe oraz wszystkich pasjonatów przyrody na akcję ekologiczną przy Småland we Frosta.\n\nData: Niedziela, 14 czerwca, godz 10:00. Zapisz się w naszym portalu!"
          : "Invitation to Marine Cleanup & Ecology Day!\n\nWe invite all volunteer scuba divers, shore support crew, and nature supporters to join us on active cleanup operations at Småland harbor, Frosta.\n\nTime: Sunday, June 14th at 10:00 AM. Hot lunch on the dock provided! Please confirm your registration on the portal."
      );
    } else {
      setCustomMailBody(
        lang === 'no'
          ? "Innkalling til Årsmøte i Diving Ecology Education Frosta!\n\nDet innkalles herved til årsmøte for alle medlemmer. Tid: Torsdag kl 18:00.\nDokumenter og saksliste er lastet opp i portalens dokumentarkiv."
          : lang === 'pl'
          ? "Zawiadomienie o Walnym Zgromadzeniu Diving Ecology Education Frosta!\n\nNiniejszym zapraszamy wszystkich członków na doroczne walne zgromadzenie. Godzina: Czwartek, godz 18:00. Dokumenty są dostępne w bibliotece portalu."
          : "Notice of Diving Ecology Education Frosta Annual General Meeting!\n\nAll members are invited to our yearly meeting. Time: Thursday at 6:00 PM. Meeting templates have been deposited in our digital Document Library."
      );
    }
  }, [selectedTemplate, lang]);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F0F4F8]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#278EA5]"></div>
      </div>
    );
  }

  if (passwordRecoveryMode) {
    return (
      <UpdatePasswordView
        lang={lang}
        initialLinkError={passwordRecoveryError}
        onUpdatePassword={handleUpdatePassword}
        onReturnToLogin={handleReturnToLogin}
      />
    );
  }

  if (!user) {
    return (
      <LoginView
        lang={lang}
        onLogin={handleLogin}
        onRequestPasswordReset={handleRequestPasswordReset}
      />
    );
  }

  return (
    <div id="diving-ecology-education-frosta-root" className="flex h-screen w-full bg-[#F8FAFB] text-slate-800 font-sans overflow-hidden relative">
      {isDemoMode() && <DemoBanner />}
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="hidden md:flex w-72 bg-[#0A2E36] text-white flex-col h-screen shadow-xl shrink-0 overflow-hidden">
        {/* Scrollable primary navigation region */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#14424B]">
          {/* Logo Brand Header */}
          <div className="p-5 flex flex-col items-center space-y-3 shrink-0">
            <DivingLogo />
            <div className="text-center">
              <h1 className="text-[13px] font-black tracking-tight text-[#48C0D8] leading-tight font-sans">
                Diving Ecology Education Frosta
              </h1>
              <p className="text-[10px] text-slate-300 italic mt-1">{t.tagline}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {([
              { id: 'dashboard', label: t.dashboard, icon: BarChart2 },
              role !== 'guest' ? { id: 'membership_card', label: t.membershipCard, icon: CreditCard } : null,
              { id: 'members', label: t.members, icon: Users, badge: pendingMembers.length },
              { id: 'fees', label: t.fees, icon: DollarSign, badge: unpaidMembers.length },
              { id: 'events', label: t.events, icon: Calendar },
              { id: 'volunteers', label: t.volunteers, icon: Activity },
              { id: 'projects', label: t.projectsGrants, icon: Layers },
              { id: 'documents', label: t.documentLibrary, icon: FileText },
              { id: 'comms', label: t.communications, icon: Mail },
              { id: 'reports', label: t.annualReport, icon: FileSpreadsheet },
              { id: 'privacy', label: t.privacy, icon: Shield },
              { id: 'test_dashboard', label: t.testDashboard || 'Test Dashboard', icon: ShieldAlert },
              { id: 'notifications', label: lang==='pl'?'Powiadomienia':lang==='en'?'Notifications':'Varsler', icon: Volume2 },
              { id: 'privacy_policy', label: lang==='pl'?'Polityka prywatności':lang==='en'?'Privacy Policy':'Personvernpolicy', icon: Shield },
              { id: 'settings', label: lang==='pl'?'Ustawienia':lang==='en'?'Settings':'Innstillinger', icon: Settings },
            ].filter(Boolean) as { id: string; label: string; icon: any; badge?: number }[]).map((menuItem) => {
              const Icon = menuItem.icon;
              const isActive = activeTab === menuItem.id;
              return (
                <button
                  key={menuItem.id}
                  onClick={() => setActiveTab(menuItem.id)}
                  id={`nav-link-${menuItem.id}`}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-xs transition-all duration-150 cursor-pointer ${
                    isActive 
                      ? 'bg-[#278EA5]/30 text-[#48C0D8] font-bold border-l-4 border-[#48C0D8]' 
                      : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span>{menuItem.label}</span>
                  </div>
                  {menuItem.badge !== undefined && menuItem.badge > 0 && (
                    <span className="text-[10px] h-5 min-w-5 px-1 flex items-center justify-center rounded-full bg-red-505 font-bold text-white bg-red-500">
                      {menuItem.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM AREA */}
        <div className="p-4 bg-[#072127] border-t border-[#14424B] shrink-0">
          
          {/* Active profile simulation */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">{user ? 'ACTIVE PROFILE' : 'SIMULATION PROFILE'}</p>
              {user && (
                <button onClick={handleLogout} className="text-[10px] text-red-400 hover:text-red-300 transition-colors font-medium cursor-pointer">
                  {lang === 'pl' ? 'Wyloguj' : lang === 'en' ? 'Logout' : 'Logg ut'}
                </button>
              )}
            </div>
            <div className="flex items-center space-x-3 p-2 bg-white/5 rounded-lg text-slate-300">
              <div className="w-8 h-8 rounded-full bg-[#48C0D8] text-[#0A2E36] flex items-center justify-center font-black text-xs shrink-0">
                {normalizedCurrentRole === 'admin' ? 'AD' : normalizedCurrentRole === 'board' ? 'BD' : normalizedCurrentRole === 'volunteer' ? 'VO' : normalizedCurrentRole === 'member' ? 'ME' : 'GS'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold truncate leading-none mb-1 text-white">
                  {getLoggedInUser().fullName}
                </p>
                <p className="text-[10px] text-[#48C0D8] capitalize leading-none font-bold">
                  {t[normalizedCurrentRole] || normalizedCurrentRole}
                </p>
              </div>
            </div>
          </div>

          {/* Role selector switches */}
          {!user && (
            <div className="mb-3">
              <p className="text-[9px] uppercase font-bold text-slate-400 mb-1">{t.roleSelector}</p>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                {(['admin', 'board', 'volunteer', 'member', 'guest'] as UserRole[]).map(r => (
                  <button
                    key={r}
                    onClick={() => selectPersona(r + '_default')}
                    className={`py-1 px-1.5 rounded text-left truncate transition-colors font-medium cursor-pointer ${
                      role === r 
                        ? 'bg-[#278EA5] text-white font-bold' 
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    ● {t[r] || r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Language Selector Flags */}
          <div className="border-t border-[#14424B] pt-2.5">
            <p className="text-[9px] uppercase font-bold text-slate-400 mb-1.5">{t.language}</p>
            <div className="flex justify-between text-[11px] font-semibold px-0.5">
              <button onClick={() => setLang('no')} className={`flex items-center space-x-1 py-0.5 px-1.5 rounded transition-all cursor-pointer ${lang === 'no' ? 'text-[#48C0D8] bg-white/10 font-bold border border-[#278EA5]' : 'text-slate-400 hover:text-white'}`}>
                🇳🇴 <span>NO</span>
              </button>
              <button onClick={() => setLang('pl')} className={`flex items-center space-x-1 py-0.5 px-1.5 rounded transition-all cursor-pointer ${lang === 'pl' ? 'text-[#48C0D8] bg-white/10 font-bold border border-[#278EA5]' : 'text-slate-400 hover:text-white'}`}>
                🇵🇱 <span>PL</span>
              </button>
              <button onClick={() => setLang('en')} className={`flex items-center space-x-1 py-0.5 px-1.5 rounded transition-all cursor-pointer ${lang === 'en' ? 'text-[#48C0D8] bg-white/10 font-bold border border-[#278EA5]' : 'text-slate-400 hover:text-white'}`}>
                🇬🇧 <span>EN</span>
              </button>
            </div>
          </div>

        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header navigation bar */}
        <header className="h-16 bg-white border-b px-8 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center space-x-3">
            <div className="text-[#278EA5] font-bold uppercase tracking-wider text-xs bg-[#278EA5]/15 px-2.5 py-1 rounded">
              {t.appName}
            </div>
            <p className="text-sm font-semibold text-slate-500 hidden lg:block">
              Frosta, Trøndelag, Norway • Administration & Member Portal
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Header Language Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-205 shadow-inner">
              <button 
                onClick={() => setLang('no')} 
                title="Norsk Bokmål"
                id="header-lang-no"
                className={`flex items-center space-x-1.5 py-1 px-3 rounded-lg transition-all text-xs font-bold cursor-pointer ${lang === 'no' ? 'bg-[#278EA5] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
              >
                🇳🇴 <span className="hidden sm:inline">NO</span>
              </button>
              <button 
                onClick={() => setLang('pl')} 
                title="Polski"
                id="header-lang-pl"
                className={`flex items-center space-x-1.5 py-1 px-3 rounded-lg transition-all text-xs font-bold cursor-pointer ${lang === 'pl' ? 'bg-[#278EA5] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
              >
                🇵🇱 <span className="hidden sm:inline">PL</span>
              </button>
              <button 
                onClick={() => setLang('en')} 
                title="English"
                id="header-lang-en"
                className={`flex items-center space-x-1.5 py-1 px-3 rounded-lg transition-all text-xs font-bold cursor-pointer ${lang === 'en' ? 'bg-[#278EA5] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
              >
                🇬🇧 <span className="hidden sm:inline">EN</span>
              </button>
            </div>

            {!isGuestRole(normalizedCurrentRole) && (
              <button 
                onClick={() => {
                  setMemberForm(prev => ({ ...prev, status: 'new_applicant' }));
                  setShowMemberModal(true);
                }} 
                className="bg-[#278EA5] hover:bg-[#1f7387] text-white px-4 py-1.5 rounded-lg text-xs font-semibold shadow transition-transform active:scale-95 flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Apply / Register</span>
              </button>
            )}

            {isBoardOrAdminRole(normalizedCurrentRole) && (
              <button 
                onClick={() => setShowEventModal(true)} 
                className="bg-[#0A2E36] hover:bg-[#124b56] text-[#48C0D8] px-4 py-1.5 rounded-lg text-xs font-semibold shadow flex items-center space-x-1 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>+ Event</span>
              </button>
            )}
          </div>
        </header>

        {/* Global Warning Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-8 py-2 text-xs text-amber-800 flex justify-between items-center shrink-0">
          <span className="truncate">
            <strong>{t.success}:</strong> {t.placeholderAlert} • Port 3000 Node Sandbox.
          </span>
          <button 
            onClick={fetchState} 
            className="text-amber-950 border border-amber-300 rounded px-2.5 py-0.5 hover:bg-amber-100 transition flex items-center space-x-1 font-bold cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Sync DB</span>
          </button>
        </div>

        {/* Outer body flex scrollable area */}
        {loading ? (
          <div className="flex-1 flex flex-col justify-center items-center bg-slate-50">
            <RefreshCw className="w-8 h-8 text-[#278EA5] animate-spin mb-2" />
            <span className="text-slate-600 font-medium">{t.loading}</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 pb-20 md:pb-6">
            
            {/* TAB: DASHBOARD */}
            {activeTab === 'dashboard' && <DashboardView
              state={state}
              lang={lang}
              role={normalizedCurrentRole}
              activePersona={activePersona}
              activeMembersTotal={activeMembersTotal}
              pendingMembers={pendingMembers}
              unpaidMembers={unpaidMembers}
              estimatedCleanupTrashKg={estimatedCleanupTrashKg}
              loggedUser={loggedUser}
              unreadMsgCount={unreadMsgCount}
              setActiveTab={setActiveTab}
              setShowMemberModal={setShowMemberModal}
              setShowEventModal={setShowEventModal}
              executePost={executePost}
              setSelectedTemplate={setSelectedTemplate}
              setMemberForm={setMemberForm}
              setShowDocModal={setShowDocModal}
              setShowProjModal={setShowProjModal}
              setShowAnnModal={setShowAnnModal}
            />}

            {/* TAB: MEMBERS */}
            {activeTab === 'members' && <MembersView
              state={state}
              lang={lang}
              role={normalizedCurrentRole}
              activePersona={activePersona}
              setActiveTab={setActiveTab}
              pendingMembers={pendingMembers}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              showMemberModal={showMemberModal}
              setShowMemberModal={setShowMemberModal}
              memberForm={memberForm}
              setMemberForm={setMemberForm}
              selectedMemberForDetail={selectedMemberForDetail}
              setSelectedMemberForDetail={setSelectedMemberForDetail}
              isEditingMember={isEditingMember}
              setIsEditingMember={setIsEditingMember}
              memberEditForm={memberEditForm}
              setMemberEditForm={setMemberEditForm}
              handleCreateMember={handleCreateMember}
              handleUpdateMember={handleUpdateMember}
              handleDeleteMember={handleDeleteMember}
              activeMembersTotal={activeMembersTotal}
              filteredMembersList={filteredMembersList}
              executePost={executePost}
              membersSupabaseStatus={membersSupabaseStatus}
            />}

            {/* TAB: EVENTS */}
            {activeTab === 'events' && <EventsView
              state={state}
              events={events}
              eventsSupabaseStatus={eventsSupabaseStatus}
              lang={lang}
              role={normalizedCurrentRole}
              activePersona={activePersona}
              setActiveTab={setActiveTab}
              showEventModal={showEventModal}
              setShowEventModal={setShowEventModal}
              eventForm={eventForm}
              setEventForm={setEventForm}
              handleCreateEvent={handleCreateEvent}
              handleDeleteEvent={handleDeleteEvent}
              executePost={executePost}
            />}

            {/* TAB: FEES TRACKING */}
            {activeTab === 'fees' && <FeesView
              state={state}
              fees={fees}
              feesSupabaseStatus={feesSupabaseStatus}
              handleUpdateSupabaseFee={handleUpdateSupabaseFee}
              lang={lang}
              role={normalizedCurrentRole}
              activePersona={activePersona}
              setActiveTab={setActiveTab}
              payments={payments}
              setPayments={setPayments}
              auditLog={auditLog}
              paymentIntent={paymentIntent}
              setPaymentIntent={setPaymentIntent}
              paymentTab={paymentTab}
              setPaymentTab={setPaymentTab}
              donationAmount={donationAmount}
              setDonationAmount={setDonationAmount}
              donationCustomAmount={donationCustomAmount}
              setDonationCustomAmount={setDonationCustomAmount}
              donationPurpose={donationPurpose}
              setDonationPurpose={setDonationPurpose}
              donorName={donorName}
              setDonorName={setDonorName}
              donorEmail={donorEmail}
              setDonorEmail={setDonorEmail}
              donorPhone={donorPhone}
              setDonorPhone={setDonorPhone}
              donorAnonymous={donorAnonymous}
              setDonorAnonymous={setDonorAnonymous}
              donorWantsReceipt={donorWantsReceipt}
              setDonorWantsReceipt={setDonorWantsReceipt}
              memberPaidClicked={memberPaidClicked}
              setMemberPaidClicked={setMemberPaidClicked}
              handlePaymentStatusChange={handlePaymentStatusChange}
            />}


            {/* TAB: VOLUNTEERS / FRIVILLIGHET */}
            {activeTab === 'volunteers' && <VolunteersView
              state={state}
              lang={lang}
              role={normalizedCurrentRole}
              activePersona={activePersona}
              setActiveTab={setActiveTab}
              estimatedCleanupTrashKg={estimatedCleanupTrashKg}
            />}

            {/* TAB: PROJECTS */}
            {activeTab === 'projects' && <ProjectsView
              state={state}
              lang={lang}
              role={normalizedCurrentRole}
              activePersona={activePersona}
              setActiveTab={setActiveTab}
              showProjModal={showProjModal}
              setShowProjModal={setShowProjModal}
              projForm={projForm}
              setProjForm={setProjForm}
              showTaskInsert={showTaskInsert}
              setShowTaskInsert={setShowTaskInsert}
              taskInsertProjectId={taskInsertProjectId}
              setTaskInsertProjectId={setTaskInsertProjectId}
              newTaskTitle={newTaskTitle}
              setNewTaskTitle={setNewTaskTitle}
              newTaskAssignee={newTaskAssignee}
              setNewTaskAssignee={setNewTaskAssignee}
              handleCreateProject={handleCreateProject}
              handleAddTaskToProject={handleAddTaskToProject}
              executePost={executePost}
            />}

            {/* TAB: DOCUMENTS */}
            {activeTab === 'documents' && <DocumentsView
              state={state}
              documents={documents}
              documentsSupabaseStatus={documentsSupabaseStatus}
              lang={lang}
              role={normalizedCurrentRole}
              activePersona={activePersona}
              setActiveTab={setActiveTab}
              showDocModal={showDocModal}
              setShowDocModal={setShowDocModal}
              docForm={docForm}
              setDocForm={setDocForm}
              handleCreateDoc={handleCreateDoc}
            />}

            {/* TAB: COMMUNICATION */}
            {activeTab === 'communication' && <CommsView
              state={state}
              lang={lang}
              role={normalizedCurrentRole}
              activePersona={activePersona}
              setActiveTab={setActiveTab}
              msgText={msgText}
              setMsgText={setMsgText}
              selectedModule={selectedModule}
              setSelectedModule={setSelectedModule}
              msgType={msgType}
              setMsgType={setMsgType}
              relatedId={relatedId}
              setRelatedId={setRelatedId}
              chatFilter={chatFilter}
              setChatFilter={setChatFilter}
              showOriginalMsg={showOriginalMsg}
              setShowOriginalMsg={setShowOriginalMsg}
              dmRecipientId={dmRecipientId}
              setDmRecipientId={setDmRecipientId}
              sendingMsg={sendingMsg}
              setSendingMsg={setSendingMsg}
              handleSendMessage={handleSendMessage}
              handleMarkMessageAsRead={handleMarkMessageAsRead}
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
              customMailBody={customMailBody}
              setCustomMailBody={setCustomMailBody}
              annForm={annForm}
              setAnnForm={setAnnForm}
              showAnnModal={showAnnModal}
              setShowAnnModal={setShowAnnModal}
              handleCreateAnnMessage={handleCreateAnnMessage}
              loggedUser={loggedUser}
            />}

            {/* TAB: REPORTS */}
            {activeTab === 'reports' && <ReportsView state={state} lang={lang} role={normalizedCurrentRole} activePersona={activePersona} setActiveTab={setActiveTab} activeMembersTotal={activeMembersTotal} estimatedCleanupTrashKg={estimatedCleanupTrashKg} fees={fees} feesSupabaseStatus={feesSupabaseStatus} payments={payments} />}

            {/* TAB: MEMBERSHIP CARDS */}
            {activeTab === 'membership_card' && (
              <MembershipCardsPage
                viewerRole={normalizedCurrentRole}
                viewerMemberId={getLoggedInUser().id}
                lang={lang}
              />
            )}

            {/* TAB: PRIVACY */}
            {activeTab === 'privacy' && <PrivacyView state={state} lang={lang} role={normalizedCurrentRole} activePersona={activePersona} setActiveTab={setActiveTab} executePost={executePost} fetchState={fetchState} />}

            {/* Footer */}
            <footer className="border-t border-slate-200 pt-6 text-center text-xs text-slate-450 font-medium space-y-3 flex flex-col items-center justify-center shrink-0">
              <DivingLogo />
              <div>
                <p className="font-extrabold text-slate-600 text-sm">Diving Ecology Education Frosta</p>
                <p className="text-slate-400 mt-0.5">{ASSOC_SETTINGS.addressLine1}, {ASSOC_SETTINGS.postalCode} {ASSOC_SETTINGS.city}, {ASSOC_SETTINGS.country}</p>
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 mt-1 text-slate-400">
                  <span>📧 <a href={`mailto:${ASSOC_SETTINGS.email}`} className="hover:text-[#278EA5]">{ASSOC_SETTINGS.email}</a></span>
                  <span>📞 <a href={`tel:${ASSOC_SETTINGS.phone}`} className="hover:text-[#278EA5]">{ASSOC_SETTINGS.phone}</a></span>
                </div>
                <p className="text-slate-400 mt-0.5">
                  {lang==='pl'?'Numer organizacji':lang==='en'?'Organisation number':'Organisasjonsnummer'}: {ASSOC_SETTINGS.organisationNumber}
                  {' · '}
                  <a href={ASSOC_SETTINGS.brregUrl} target="_blank" rel="noreferrer" className="hover:text-[#278EA5]">
                    {lang==='pl'?'Brønnøysundregistrene':lang==='en'?'Brønnøysund Register':'Brønnøysundregistrene'} ↗
                  </a>
                </p>
              </div>
              <div className="flex justify-center space-x-2 font-mono text-[9px] text-slate-400 mt-1">
                <span className="text-emerald-600 font-bold">✓ Vipps Link Verified</span>
                <span>•</span>
                <span className="text-blue-650 font-bold">✓ Google Drive Storage Mocked</span>
                <span>•</span>
                <span className="text-[#278EA5] font-bold">✓ Automated Gemini Translator Active</span>
              </div>
              <p className="text-slate-400 text-[10px]">© 2026 Diving Ecology Education Frosta</p>
            </footer>

          </div>
        )}

      </main>

      {/* ==================== DRAWER DETAILS MODAL ==================== */}
      {selectedMemberForDetail && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex justify-end z-[100] animate-fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            
            <div className="space-y-6 text-xs">
              <div className="flex justify-between items-center border-b pb-4">
                <h4 className="text-sm font-black text-[#0A2E36] uppercase tracking-wider font-mono">
                  {isEditingMember ? "Edit Cabinet File" : "Diving Directory File"}
                </h4>
                <button 
                  onClick={() => { setSelectedMemberForDetail(null); setIsEditingMember(false); }}
                  className="p-1 rounded hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isEditingMember ? (
                // EDIT MODE
                <form onSubmit={handleUpdateMember} className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-0.5">Full Name *</label>
                      <input 
                        required 
                        type="text" 
                        value={memberEditForm?.fullName || ''} 
                        onChange={e => setMemberEditForm((p: any) => ({ ...p, fullName: e.target.value }))} 
                        className="w-full border p-2 rounded text-xs select-text" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-0.5">Email *</label>
                        <input 
                          required 
                          type="email" 
                          value={memberEditForm?.email || ''} 
                          onChange={e => setMemberEditForm((p: any) => ({ ...p, email: e.target.value }))} 
                          className="w-full border p-2 rounded text-xs select-text" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-0.5">Phone</label>
                        <input 
                          type="text" 
                          value={memberEditForm?.phone || ''} 
                          onChange={e => setMemberEditForm((p: any) => ({ ...p, phone: e.target.value }))} 
                          className="w-full border p-2 rounded text-xs select-text" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-0.5">Hytte / Address Spot</label>
                      <input 
                        type="text" 
                        value={memberEditForm?.address || ''} 
                        onChange={e => setMemberEditForm((p: any) => ({ ...p, address: e.target.value }))} 
                        className="w-full border p-2 rounded text-xs select-text" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-0.5">Member Type</label>
                        <select 
                          value={memberEditForm?.memberType || 'individual'} 
                          onChange={e => setMemberEditForm((p: any) => ({ ...p, memberType: e.target.value as MemberType }))} 
                          className="w-full border p-2 rounded text-xs bg-white"
                        >
                          <option value="individual">Individual</option>
                          <option value="youth">Youth (-16 years)</option>
                          <option value="supporting">Supporting</option>
                          <option value="family">Family Package</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-0.5">Status</label>
                        <select 
                          value={memberEditForm?.status || 'new_applicant'} 
                          onChange={e => setMemberEditForm((p: any) => ({ ...p, status: e.target.value as MemberStatus }))} 
                          className="w-full border p-2 rounded text-xs bg-white"
                        >
                          <option value="new_applicant">New Applicant</option>
                          <option value="waiting_approval">Waiting Approval</option>
                          <option value="active">Active Member</option>
                          <option value="inactive">Inactive Member</option>
                          <option value="supporting">Supporting</option>
                          <option value="former">Former Member</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-0.5">Language Prefer</label>
                        <select 
                          value={memberEditForm?.preferredLanguage || 'no'} 
                          onChange={e => setMemberEditForm((p: any) => ({ ...p, preferredLanguage: e.target.value as Lang }))} 
                          className="w-full border p-2 rounded text-xs bg-white"
                        >
                          <option value="no">Norsk Bokmål</option>
                          <option value="pl">Polski</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-0.5">Contingent status</label>
                        <select 
                          value={memberEditForm?.paymentStatus || 'unpaid'} 
                          onChange={e => setMemberEditForm((p: any) => ({ ...p, paymentStatus: e.target.value as PaymentStatus }))} 
                          className="w-full border p-2 rounded text-xs bg-white"
                        >
                          <option value="paid">Paid</option>
                          <option value="unpaid">Unpaid</option>
                          <option value="pending">Pending</option>
                          <option value="exempt">Exempt</option>
                          <option value="overdue">Overdue</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-0.5">Emergency Contact Name</label>
                        <input 
                          type="text" 
                          value={memberEditForm?.emergencyContactName || ''} 
                          onChange={e => setMemberEditForm((p: any) => ({ ...p, emergencyContactName: e.target.value }))} 
                          className="w-full border p-2 rounded text-xs" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-0.5">Emergency Contact Phone</label>
                        <input 
                          type="text" 
                          value={memberEditForm?.emergencyContactPhone || ''} 
                          onChange={e => setMemberEditForm((p: any) => ({ ...p, emergencyContactPhone: e.target.value }))} 
                          className="w-full border p-2 rounded text-xs" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-0.5">Board Notes (Internal Only)</label>
                      <textarea 
                        rows={3}
                        value={memberEditForm?.notes || ''} 
                        onChange={e => setMemberEditForm((p: any) => ({ ...p, notes: e.target.value }))} 
                        className="w-full border p-2 rounded font-mono text-xs" 
                        placeholder="Clinical notes, hytte markers or keys details..."
                      />
                    </div>

                    <div className="space-y-1 pt-1">
                      <label className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          checked={!!memberEditForm?.consentPrivacy} 
                          onChange={e => setMemberEditForm((p: any) => ({ ...p, consentPrivacy: e.target.checked }))} 
                          className="rounded text-[#278EA5]" 
                        />
                        <span className="font-bold text-slate-600 text-[10px]">GDPR Privacy Consent status</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          checked={!!memberEditForm?.consentPhoto} 
                          onChange={e => setMemberEditForm((p: any) => ({ ...p, consentPhoto: e.target.checked }))} 
                          className="rounded text-[#278EA5]" 
                        />
                        <span className="font-bold text-slate-600 text-[10px]">Media & Photo release permission</span>
                      </label>
                    </div>

                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setIsEditingMember(false)} 
                      className="w-1/2 py-2 border rounded-lg font-bold text-slate-700 cursor-pointer hover:bg-slate-50 transition text-center"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="w-1/2 py-2 bg-[#278EA5] hover:bg-[#1d6b7d] text-white font-bold rounded-lg cursor-pointer shadow transition text-center"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                // VIEW MODE
                <>
                  {/* member card badge design */}
                  <div className="bg-gradient-to-r from-[#0a2e36] to-[#278ea5] p-5 rounded-2xl text-white shadow-lg relative overflow-hidden">
                    <p className="text-[9px] uppercase tracking-widest font-extrabold text-[#48c0d8]">DIVING ECOLOGY EDUCATION FROSTA REGISTERED MEMBER</p>
                    <h3 className="text-base font-black tracking-tight mt-2">{selectedMemberForDetail.fullName}</h3>
                    <p className="text-[11px] text-slate-200">{selectedMemberForDetail.email}</p>
                    <div className="flex justify-between items-center text-[10px] text-[#48c0d8] font-bold mt-6 tracking-widest">
                      <span>STATUS: {selectedMemberForDetail.status}</span>
                      <span className="bg-white/10 px-2 py-0.5 rounded text-white text-[9px] lowercase font-mono">id: {selectedMemberForDetail.id}</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Primary Contact Phone</p>
                      <p className="text-sm font-bold text-slate-800">{selectedMemberForDetail.phone || 'N/A'}</p>
                    </div>
                    {selectedMemberForDetail.address && (
                      <div>
                        <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Hytte / Address Spot</p>
                        <p className="text-slate-700 font-medium">{selectedMemberForDetail.address}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] border-t pt-3 text-slate-650">
                    <p><strong>Member Type:</strong> {selectedMemberForDetail.memberType}</p>
                    <p><strong>Language Prefer:</strong> <span className="uppercase font-bold text-[#278EA5]">{selectedMemberForDetail.preferredLanguage}</span></p>
                    <p><strong>Fee Status:</strong> <span className="underline font-bold text-slate-800">{selectedMemberForDetail.paymentStatus.toUpperCase()}</span></p>
                    <p><strong>Date Joined:</strong> {selectedMemberForDetail.dateJoined}</p>
                  </div>

                  <div className="border-t pt-3 text-[11px] text-slate-500 space-y-1.5">
                    <p>🛡️ GDPR Privacy Consent: <span className="font-bold text-emerald-700">{selectedMemberForDetail.consentPrivacy ? 'Agreed' : 'Missing'}</span></p>
                    <p>📷 Photo Media Release: <span className="font-bold text-indigo-700">{selectedMemberForDetail.consentPhoto ? 'Agreed' : 'Refused'}</span></p>
                  </div>

                  {(selectedMemberForDetail.emergencyContactName || selectedMemberForDetail.emergencyContactPhone) && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-[11px] text-slate-800">
                      <p className="font-black text-red-800">🏥 MEDICAL EMERGENCY FIRST APPLICANT CONTACT:</p>
                      <p className="mt-1"><strong>Name:</strong> {selectedMemberForDetail.emergencyContactName || 'N/A'}</p>
                      <p><strong>Emergency Phone:</strong> {selectedMemberForDetail.emergencyContactPhone || 'N/A'}</p>
                    </div>
                  )}

                  {selectedMemberForDetail.notes && (
                    <div className="bg-amber-50 p-2.5 rounded border border-amber-200">
                      <p className="font-extrabold text-amber-900">🔒 Board Notes (Internal):</p>
                      <p className="italic mt-1 text-slate-650 font-mono">"{selectedMemberForDetail.notes}"</p>
                    </div>
                  )}

                  <div className="space-y-2 pt-2 border-t">
                    <p className="font-bold text-slate-700 uppercase font-mono text-[9px] tracking-wider">Points accumulated ({selectedMemberForDetail.activityHistory.reduce((s, h) => s + h.points, 0)} pts):</p>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {selectedMemberForDetail.activityHistory.length === 0 ? (
                        <p className="text-slate-400 italic">No activity cleanup points logged yet.</p>
                      ) : (
                        selectedMemberForDetail.activityHistory.map((h, i) => (
                          <div key={i} className="p-2 bg-slate-50 rounded border flex justify-between items-center text-[10px]">
                            <div>
                              <span className="font-bold text-slate-800 block">{h.description}</span>
                              <span className="text-[9px] text-slate-400">{h.date} {h.hours ? `• ${h.hours} hours` : ''}</span>
                            </div>
                            <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">+{h.points} pts</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}

            </div>

            <div className="mt-6 space-y-2 shrink-0">
              {!isEditingMember && isBoardOrAdminRole(normalizedCurrentRole) && (
                <button 
                  onClick={() => setIsEditingMember(true)}
                  className="w-full bg-[#278EA5] hover:bg-[#1c6a7c] text-white font-bold text-xs py-2 rounded-lg cursor-pointer transition shadow text-center"
                >
                  ✏️ Edit Cabinet File
                </button>
              )}
              <button 
                onClick={() => { setSelectedMemberForDetail(null); setIsEditingMember(false); }}
                className="w-full bg-[#0A2E36] text-white font-bold text-xs py-2 rounded-lg shadow cursor-pointer text-center"
              >
                Close Folder File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DIALOG BOXES FOR NEW CREATES ==================== */}

      {/* 1. MEMBER DIRECT_ADD FORM MODAL */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <form onSubmit={handleCreateMember} className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col items-center border-b pb-4 space-y-2">
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Join Us Today</span>
                <button type="button" onClick={() => setShowMemberModal(false)} className="cursor-pointer"><X className="w-5 h-5 text-slate-400 hover:text-rose-600 transition-colors" /></button>
              </div>
              <DivingLogo />
              <h4 className="font-extrabold text-[#0A2E36] text-[15px] text-center">Diving Ecology Education Frosta</h4>
              <p className="text-[11px] text-slate-500 text-center">Become a voice for marine biodiversity & clean fjords in Trøndelag.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block mb-1 text-slate-500 font-bold">Full Name *</label>
                <input required type="text" value={memberForm.fullName} onChange={e => setMemberForm(prev => ({ ...prev, fullName: e.target.value }))} className="w-full border p-2 rounded" />
              </div>

              <div>
                <label className="block mb-1 text-slate-500 font-bold">Email *</label>
                <input required type="email" value={memberForm.email} onChange={e => setMemberForm(prev => ({ ...prev, email: e.target.value }))} className="w-full border p-2 rounded" />
              </div>

              <div>
                <label className="block mb-1 text-slate-500 font-bold">Phone</label>
                <input type="text" value={memberForm.phone} onChange={e => setMemberForm(prev => ({ ...prev, phone: e.target.value }))} className="w-full border p-2 rounded" />
              </div>

              <div>
                <label className="block mb-1 text-slate-500 font-bold">Language Setting</label>
                <select value={memberForm.preferredLanguage} onChange={e => setMemberForm(prev => ({ ...prev, preferredLanguage: e.target.value as Lang }))} className="w-full border p-2 rounded">
                  <option value="no">Bokmål</option>
                  <option value="pl">Polski</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-slate-500 font-bold">Membership Type</label>
                <select value={memberForm.memberType} onChange={e => setMemberForm(prev => ({ ...prev, memberType: e.target.value as MemberType }))} className="w-full border p-2 rounded">
                  <option value="individual">Individual</option>
                  <option value="youth">Youth (-16 years)</option>
                  <option value="supporting">Supporting</option>
                  <option value="family">Family Package</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block mb-1 text-slate-500 font-bold">Emergency Rescue Contact Name</label>
                <input type="text" value={memberForm.emergencyContactName} onChange={e => setMemberForm(prev => ({ ...prev, emergencyContactName: e.target.value }))} className="w-full border p-2 rounded" />
              </div>

              <div className="col-span-2">
                <label className="block mb-1 text-slate-500 font-bold">Emergency Contact Phone</label>
                <input type="text" value={memberForm.emergencyContactPhone} onChange={e => setMemberForm(prev => ({ ...prev, emergencyContactPhone: e.target.value }))} className="w-full border p-2 rounded" />
              </div>

              <div className="col-span-2 flex flex-col space-y-1.5 pt-2 border-t">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={memberForm.consentPrivacy} onChange={e => setMemberForm(prev => ({ ...prev, consentPrivacy: e.target.checked }))} className="rounded" />
                  <span>Accept GDPR Privacy Policy consent status *</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={memberForm.consentPhoto} onChange={e => setMemberForm(prev => ({ ...prev, consentPhoto: e.target.checked }))} className="rounded" />
                  <span>Accept Photo and Media releasing on public feed</span>
                </label>
              </div>

            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button type="button" onClick={() => setShowMemberModal(false)} className="px-4 py-2 border rounded text-xs cursor-pointer">{t.cancel}</button>
              <button type="submit" className="bg-[#278EA5] hover:bg-[#1f7387] text-white font-bold px-5 py-2 rounded text-xs cursor-pointer">Submit Registration</button>
            </div>
          </form>
        </div>
      )}

      {/* 2. EVENT CREATE DIALOG */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <form onSubmit={handleCreateEvent} className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-bold text-[#0A2E36] text-sm">+ {t.createEvent}</h4>
              <button type="button" onClick={() => setShowEventModal(false)} className="cursor-pointer"><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block mb-1 text-slate-500 font-bold">Event Title *</label>
                <input required type="text" value={eventForm.title} onChange={e => setEventForm(prev => ({ ...prev, title: e.target.value }))} className="w-full border p-2 rounded" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-slate-500 font-bold">Planned Date *</label>
                  <input required type="date" value={eventForm.date} onChange={e => setEventForm(prev => ({ ...prev, date: e.target.value }))} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500 font-bold">Fjord Location *</label>
                  <input required type="text" value={eventForm.location} onChange={e => setEventForm(prev => ({ ...prev, location: e.target.value }))} className="w-full border p-2 rounded animate-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-slate-500 font-bold">Time Range</label>
                  <div className="flex gap-1 items-center">
                    <input type="time" value={eventForm.startTime} onChange={e => setEventForm(prev => ({ ...prev, startTime: e.target.value }))} className="w-full border p-2 rounded" />
                    <span>-</span>
                    <input type="time" value={eventForm.endTime} onChange={e => setEventForm(prev => ({ ...prev, endTime: e.target.value }))} className="w-full border p-2 rounded" />
                  </div>
                </div>
                <div>
                  <label className="block mb-1 text-slate-500 font-bold">Visibility *</label>
                  <select value={eventForm.visibility} onChange={e => setEventForm(prev => ({ ...prev, visibility: e.target.value as any }))} className="w-full border p-2 rounded bg-white">
                    <option value="public">Public</option>
                    <option value="members">Members Only</option>
                    <option value="board">Board Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-slate-500 font-bold">Category</label>
                  <select value={eventForm.category} onChange={e => setEventForm(prev => ({ ...prev, category: e.target.value }))} className="w-full border p-2 rounded">
                    <option value="cleanup">Underwater Cleanup</option>
                    <option value="education">Marine Education</option>
                    <option value="member_meeting">Member Meeting</option>
                    <option value="board_meeting">Board Meeting</option>
                    <option value="training">Safety Training</option>
                    <option value="social">Social</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-slate-500 font-bold">Reward Points</label>
                  <input type="number" value={eventForm.pointsValue} onChange={e => setEventForm(prev => ({ ...prev, pointsValue: Number(e.target.value) }))} className="w-full border p-2 rounded" />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-500 font-bold">Short Description</label>
                <textarea rows={2} value={eventForm.description} onChange={e => setEventForm(prev => ({ ...prev, description: e.target.value }))} className="w-full border p-2 rounded" />
              </div>

              <div>
                <label className="block mb-1 text-slate-500 font-bold">Required Equipment directives</label>
                <input type="text" placeholder="Scuba tanks, gloves, warm socks" value={eventForm.requiredEquipment} onChange={e => setEventForm(prev => ({ ...prev, requiredEquipment: e.target.value }))} className="w-full border p-2 rounded" />
              </div>

              <div>
                <label className="block mb-1 text-slate-500 font-bold">Safety Notes & Deep Dive limits</label>
                <input type="text" placeholder="Max depth 18m, medical statement required" value={eventForm.safetyNotes} onChange={e => setEventForm(prev => ({ ...prev, safetyNotes: e.target.value }))} className="w-full border p-2 rounded" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button type="button" onClick={() => setShowEventModal(false)} className="px-4 py-2 border rounded text-xs cursor-pointer">{t.cancel}</button>
              <button type="submit" className="bg-[#278EA5] hover:bg-[#1f7387] text-white font-bold px-5 py-2 rounded text-xs cursor-pointer">Create Activity</button>
            </div>
          </form>
        </div>
      )}

      {/* 3. DOCUMENT METADATA UPLOAD */}
      {showDocModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <form onSubmit={handleCreateDoc} className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-bold text-[#0A2E36] text-sm">+ Index New Document (PDF / DOC)</h4>
              <button type="button" onClick={() => setShowDocModal(false)} className="cursor-pointer"><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block mb-1 text-slate-500 font-bold">Document Title *</label>
                <input required type="text" value={docForm.title} onChange={e => setDocForm(prev => ({ ...prev, title: e.target.value }))} className="w-full border p-2 rounded" />
              </div>

              <div>
                <label className="block mb-1 text-slate-500 font-bold">Simulated File Name *</label>
                <input required type="text" placeholder="ex: diving_ecology_education_frosta_statutter_2026.pdf" value={docForm.fileName} onChange={e => setDocForm(prev => ({ ...prev, fileName: e.target.value }))} className="w-full border p-2 rounded" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-slate-500 font-bold">Category</label>
                  <select value={docForm.category} onChange={e => setDocForm(prev => ({ ...prev, category: e.target.value as any }))} className="w-full border p-2 rounded bg-white">
                    <option value="vedtekter">Statutes / Vedtekter</option>
                    <option value="safety_documents">Safety Procedures</option>
                    <option value="minutes">Minutes / Referat</option>
                    <option value="board_resolutions">Board Resolutions</option>
                    <option value="annual_reports">Annual Reports</option>
                    <option value="budgets">Budgets</option>
                    <option value="project_documents">Project file</option>
                    <option value="gdpr_personvern">Privacy / Personvern</option>
                    <option value="other">Other / General</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-slate-500 font-bold">Language Meta</label>
                  <select value={docForm.lang} onChange={e => setDocForm(prev => ({ ...prev, lang: e.target.value as Lang }))} className="w-full border p-2 rounded bg-white">
                    <option value="no">Norsk Bokmål</option>
                    <option value="pl">Polski</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-500 font-bold">Brief Abstract</label>
                <input type="text" value={docForm.description} onChange={e => setDocForm(prev => ({ ...prev, description: e.target.value }))} className="w-full border p-2 rounded" />
              </div>

              <div>
                <label className="block mb-1 text-slate-500 font-bold">Visibility Options</label>
                <select value={docForm.visibility} onChange={e => {
                  const val = e.target.value as 'public' | 'members' | 'board';
                  setDocForm(prev => ({ ...prev, visibility: val, isPrivate: val === 'board' }));
                }} className="w-full border p-2 rounded bg-white">
                    <option value="public">Public - visible to everyone</option>
                    <option value="members">Members only</option>
                    <option value="board">Confidential (Board & Admin only)</option>
                </select>
              </div>

            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button type="button" onClick={() => setShowDocModal(false)} className="px-4 py-2 border rounded text-xs cursor-pointer">{t.cancel}</button>
              <button type="submit" className="bg-[#278EA5] hover:bg-[#1f7387] text-white font-bold px-5 py-2 rounded text-xs cursor-pointer">Save to Library</button>
            </div>
          </form>
        </div>
      )}

      {/* 4. ANNOUNCEMENT BROADCAST MODAL */}
      {showAnnModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <form onSubmit={handleCreateAnnMessage} className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-bold text-[#0A2E36] text-sm">Create Board Announcement</h4>
              <button type="button" onClick={() => setShowAnnModal(false)} className="cursor-pointer"><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block mb-1 text-slate-500 font-bold">Title / Subject *</label>
                <input required type="text" value={annForm.title} onChange={e => setAnnForm(prev => ({ ...prev, title: e.target.value }))} className="w-full border p-2 rounded" />
              </div>

              <div>
                <label className="block mb-1 text-slate-500 font-bold">Language Tag</label>
                <select value={annForm.lang} onChange={e => setAnnForm(prev => ({ ...prev, lang: e.target.value as Lang }))} className="w-full border p-2 rounded">
                  <option value="no">Norsk Bokmål</option>
                  <option value="pl">Polski</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-slate-500 font-bold">Message Content *</label>
                <textarea required rows={4} value={annForm.body} onChange={e => setAnnForm(prev => ({ ...prev, body: e.target.value }))} className="w-full border p-2 rounded" />
              </div>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={annForm.isPrivate} onChange={e => setAnnForm(prev => ({ ...prev, isPrivate: e.target.checked }))} className="rounded" />
                <span>Confine strictly to Board channels</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button type="button" onClick={() => setShowAnnModal(false)} className="px-4 py-2 border rounded text-xs cursor-pointer">{t.cancel}</button>
              <button type="submit" className="bg-[#278EA5] text-white font-bold px-5 py-2 rounded text-xs cursor-pointer">Post Announcement</button>
            </div>
          </form>
        </div>
      )}

      {/* 5. PROJECT ARCHETYPES CREATE */}
      {showProjModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <form onSubmit={handleCreateProject} className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-bold text-[#0A2E36] text-sm">+ {t.createProject}</h4>
              <button type="button" onClick={() => setShowProjModal(false)} className="cursor-pointer"><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block mb-1 text-slate-500 font-bold">Project Initiative Name *</label>
                <input required type="text" value={projForm.name} onChange={e => setProjForm(prev => ({ ...prev, name: e.target.value }))} className="w-full border p-2 rounded" />
              </div>

              <div>
                <label className="block mb-1 text-slate-500 font-bold">Initiated Goal (Description)</label>
                <textarea rows={3} value={projForm.description} onChange={e => setProjForm(prev => ({ ...prev, description: e.target.value }))} className="w-full border p-2 rounded" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-slate-500 font-bold">Responsible Person *</label>
                  <input required type="text" value={projForm.responsiblePerson} onChange={e => setProjForm(prev => ({ ...prev, responsiblePerson: e.target.value }))} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500 font-bold">Budget Allocation (NOK)</label>
                  <input type="number" value={projForm.budget} onChange={e => setProjForm(prev => ({ ...prev, budget: Number(e.target.value) }))} className="w-full border p-2 rounded" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-slate-500 font-bold">Funding Source & Grantor</label>
                  <input type="text" placeholder="Fylkeskommune, Frifond" value={projForm.fundingSource} onChange={e => setProjForm(prev => ({ ...prev, fundingSource: e.target.value }))} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500 font-bold">Sponsors (Comma-separated)</label>
                  <input type="text" placeholder="Sparing Bank, Lerdal" value={projForm.sponsorsCsv} onChange={e => setProjForm(prev => ({ ...prev, sponsorsCsv: e.target.value }))} className="w-full border p-2 rounded" />
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button type="button" onClick={() => setShowProjModal(false)} className="px-4 py-2 border rounded text-xs cursor-pointer">{t.cancel}</button>
              <button type="submit" className="bg-[#278EA5] text-white font-bold px-5 py-2 rounded text-xs cursor-pointer">Establish Project</button>
            </div>
          </form>
        </div>
      )}

      {/* 6. TASK ADD MODAL */}
      {showTaskInsert && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex justify-center items-center z-[150] p-4 animate-fade-in">
          <div className="bg-white rounded-xl p-5 max-w-sm w-full space-y-4 text-xs shadow-2xl border">
            <h5 className="font-extrabold text-[#0A2E36] pb-2 border-b uppercase tracking-wider">Schedule Project Task</h5>
            <div className="space-y-3">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Task Deliverable Name *</label>
                <input required type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} className="w-full border p-2 rounded font-sans focus:ring-1 focus:ring-[#278EA5]" />
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Assigned Volunteer Worker</label>
                <input type="text" placeholder="Lars, Arne, Marek..." value={newTaskAssignee} onChange={e => setNewTaskAssignee(e.target.value)} className="w-full border p-2 rounded" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button onClick={() => setShowTaskInsert(false)} className="px-3 py-1.5 border rounded text-xs cursor-pointer">Cancel</button>
              <button onClick={handleAddTaskToProject} className="bg-[#278EA5] text-white px-4 py-1.5 rounded font-bold text-xs shadow cursor-pointer">
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SETTINGS (PWA) ==================== */}
      {activeTab === 'settings' && (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-black text-[#0A2E36]">
                  {lang === 'pl' ? 'Ustawienia' : lang === 'en' ? 'Settings' : 'Innstillinger'}
                </h2>
              </div>
              
              <div className="mb-6">
                <h3 className="font-bold text-slate-700 mb-2">Progressive Web App (PWA)</h3>
                <p className="text-sm text-slate-600 mb-4">
                  {lang === 'pl' ? 'Aplikację można dodać do ekranu głównego telefonu przez przeglądarkę.' : 
                   lang === 'en' ? 'The app can be added to your phone’s home screen via the browser.' : 
                   'Appen kan legges til på mobilens hjemskjerm via nettleseren.'}
                </p>
                
                <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-600">
                  <div>
                    <strong className="text-slate-800 flex items-center gap-2 mb-1">
                      🤖 Android
                    </strong>
                    <p>
                      {lang === 'pl' ? 'Otwórz aplikację w Chrome, kliknij menu i wybierz „Zainstaluj aplikację” albo „Dodaj do ekranu głównego”.' :
                       lang === 'en' ? 'Open the app in Chrome, tap the menu and choose “Install app” or “Add to Home screen”.' :
                       'Åpne appen i Chrome, trykk på menyen og velg “Installer app” eller “Legg til på startskjermen”.'}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <strong className="text-slate-800 flex items-center gap-2 mb-1">
                      🍎 iPhone (iOS)
                    </strong>
                    <p>
                      {lang === 'pl' ? 'Otwórz aplikację w Safari, kliknij ikonę udostępniania i wybierz „Dodaj do ekranu początkowego”.' :
                       lang === 'en' ? 'Open the app in Safari, tap the share icon and choose “Add to Home Screen”.' :
                       'Åpne appen i Safari, trykk på delingsikonet og velg “Legg til på Hjem-skjerm”.'}
                    </p>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      )}

      {/* ==================== NOTIFICATIONS PLACEHOLDER ==================== */}
      {activeTab === 'notifications' && (
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
      )}

      {/* ==================== PRIVACY POLICY PLACEHOLDER ==================== */}
      {activeTab === 'privacy_policy' && (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="text-[#278EA5]" size={22} />
                <h2 className="text-xl font-black text-[#0A2E36]">
                  {lang==='pl'?'Polityka prywatności':lang==='en'?'Privacy Policy':'Personvernpolicy'}
                </h2>
              </div>
              <p className="text-slate-500 text-sm mb-1">Diving Ecology Education Frosta</p>
              <div className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mb-5">
                {lang==='pl'?'Szkic — wymaga weryfikacji prawnej':lang==='en'?'Draft — requires legal review':'Utkast — krever juridisk gjennomgang'}
              </div>

              {[
                {
                  title_no: 'Medlemsdata', title_pl: 'Dane członków', title_en: 'Member data',
                  body_no: 'Vi samler inn navn, e-post, telefon, adresse og annen informasjon du oppgir ved innmelding. Data brukes for å administrere medlemsskapet og kommunisere med deg.',
                  body_pl: 'Gromadzimy imię, nazwisko, e-mail, telefon, adres i inne dane podane przy rejestracji. Dane są używane do zarządzania członkostwem.',
                  body_en: 'We collect your name, email, phone, address and other information you provide when joining. Data is used to manage your membership and communicate with you.'
                },
                {
                  title_no: 'Betalingsstatusdata', title_pl: 'Dane o stanie płatności', title_en: 'Payment status data',
                  body_no: 'Vi registrerer status på innbetalte medlemskontingenter og donasjoner. Vi lagrer ikke kortnummer, kontonummer eller andre betalingsdetaljer.',
                  body_pl: 'Rejestrujemy status wpłaconych składek i darowizn. Nie przechowujemy numerów kart ani kont bankowych.',
                  body_en: 'We record the status of paid membership fees and donations. We do not store card numbers, bank accounts or other payment details.'
                },
                {
                  title_no: 'Donasjonsdata', title_pl: 'Dane dotyczące darowizn', title_en: 'Donation data',
                  body_no: 'Donasjoner registreres med formål, beløp og eventuelt donornavn. Anonyme donasjoner lagres uten personidentifikasjon.',
                  body_pl: 'Darowizny są rejestrowane z celem, kwotą i ewentualnie imieniem darczyńcy. Anonimowe darowizny są przechowywane bez identyfikacji.',
                  body_en: 'Donations are recorded with purpose, amount and optionally donor name. Anonymous donations are stored without personal identification.'
                },
                {
                  title_no: 'Opplastede kvitteringer', title_pl: 'Przesłane potwierdzenia', title_en: 'Uploaded receipts',
                  body_no: 'Kvitteringer lastet opp som bevis på betaling behandles konfidensielt og er kun tilgjengelig for styremedlemmer og administrator.',
                  body_pl: 'Potwierdzenia przesłane jako dowód płatności są traktowane poufnie i dostępne tylko dla zarządu.',
                  body_en: 'Receipts uploaded as proof of payment are treated confidentially and are only accessible to board members and administrator.'
                },
                {
                  title_no: 'Kommunikasjonsmeldinger', title_pl: 'Wiadomości komunikacyjne', title_en: 'Communication messages',
                  body_no: 'Interne meldinger mellom medlemmer og styre lagres for drift av portalen. Private styrenotater er aldri synlige for ordinære medlemmer.',
                  body_pl: 'Wewnętrzne wiadomości są przechowywane na potrzeby portalu. Prywatne notatki zarządu są niedostępne dla zwykłych członków.',
                  body_en: 'Internal messages are stored for portal operation. Private board notes are never visible to ordinary members.'
                },
                {
                  title_no: 'Språkpreferanser', title_pl: 'Preferencje językowe', title_en: 'Language preferences',
                  body_no: 'Din foretrukne visningsspråk (norsk bokmål, polsk, engelsk) lagres lokalt i din nettleser og synkroniseres med din profil.',
                  body_pl: 'Preferowany język (norweski, polski, angielski) jest przechowywany lokalnie w przeglądarce.',
                  body_en: 'Your preferred display language (Norwegian Bokmål, Polish, English) is stored locally in your browser and synced with your profile.'
                },
                {
                  title_no: 'Bilde- og mediesamtykke', title_pl: 'Zgoda na zdjęcia i media', title_en: 'Photo and media consent',
                  body_no: 'Bilder og videoer fra arrangementer publiseres kun med samtykke. Medlemmer kan trekke tilbake samtykke ved å kontakte styret.',
                  body_pl: 'Zdjęcia i filmy z wydarzeń są publikowane wyłącznie za zgodą. Członkowie mogą wycofać zgodę.',
                  body_en: 'Photos and videos from events are published only with consent. Members may withdraw consent by contacting the board.'
                },
                {
                  title_no: 'Digitalt medlemskort og bildebehandling', title_pl: 'Cyfrowa legitymacja i przetwarzanie zdjęć', title_en: 'Digital Membership Card & Photo Processing',
                  body_no: 'Opplastede profilbilder lagres utelukkende for å vises på din personlige digitale legitymasjon for Diving Ecology Education Frosta. Bildene lagres sikkert og er kun synlige for deg selv, styret og systemadministratorer. Bildene vil aldri bli brukt i offentlig informasjonsmateriell, nettsteder eller sosiale medier uten ditt uttrykkelige, særskilte samtykke.',
                  body_pl: 'Przesłane zdjęcia profilowe są przechowywane wyłącznie w celu wyświetlania na cyfrowej legitymacji członkowskiej związku Diving Ecology Education Frosta. Zdjęcia są bezpiecznie przechowywane i widoczne tylko dla Ciebie, zarządu i administratora. Nigdy nie zostaną użyte do celów promocyjnych bez Twojej zgody.',
                  body_en: 'Uploaded profile photos are processed solely for display on your digital Diving Ecology Education Frosta membership card. Photos are stored securely and are only accessible as role-restricted state to the card owner, board members, and system administrators. Photos are never used in public materials, websites, or social channels without explicit separate consent.'
                },
                {
                  title_no: 'Samtykke, sletting og restriksjoner', title_pl: 'Zgoda, usunięcie i ograniczenia', title_en: 'Consent, Deletion & Restrictions',
                  body_no: 'Du har full rett til når som helst å trekke tilbake ditt bildesamtykke og slette bildet ditt permanent fra medlemskortsystemet. Medlemskort og personopplysninger er strengt underlagt rollebaserte synlighetsregler; gjester og andre ordinære medlemmer har ikke tilgang til å se kortene eller bildene til andre medlemmer.',
                  body_pl: 'Masz prawo wycofać zgodę w dowolnym momencie i trwale usunąć zdjęcie profilowe. Dostęp do kart jest ściśle kontrolowany — goście i inni zwykli członkowie nie mają dostępu do cudzych legitymacji ani zdjęć.',
                  body_en: 'You have the absolute right to revoke your photo consent and trigger permanent erasure of your portrait from our databases at any time. Card and owner data queries are strictly role-restricted; guests and standard members have zero permission to view or search other members\' digital cards or photos.'
                },
                {
                  title_no: 'Sletting av konto', title_pl: 'Usunięcie konta', title_en: 'Account deletion',
                  body_no: 'Du kan be om sletting av din profil og alle tilknyttede data ved å kontakte styret. Enkelte opplysninger kan beholdes av regnskapsmessige årsaker.',
                  body_pl: 'Możesz wnioskować o usunięcie swojego profilu kontaktując się z zarządem. Niektóre dane mogą być przechowywane ze względów księgowych.',
                  body_en: 'You can request deletion of your profile and all associated data by contacting the board. Certain information may be retained for accounting purposes.'
                },
                {
                  title_no: 'Dataeksport', title_pl: 'Eksport danych', title_en: 'Data export',
                  body_no: 'Du kan be om eksport av dine personopplysninger i maskinlesbart format (JSON). Kontakt styret for å be om dette.',
                  body_pl: 'Możesz wnioskować o eksport swoich danych osobowych w formacie czytelnym maszynowo (JSON).',
                  body_en: 'You can request an export of your personal data in machine-readable format (JSON). Contact the board to request this.'
                },
              ].map((section, idx) => (
                <div key={idx} className="border-b border-slate-100 pb-4 mb-4 last:border-0">
                  <h3 className="font-bold text-[#0A2E36] text-sm mb-1">
                    {lang==='pl'?section.title_pl:lang==='en'?section.title_en:section.title_no}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {lang==='pl'?section.body_pl:lang==='en'?section.body_en:section.body_no}
                  </p>
                </div>
              ))}

              <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs font-bold text-slate-500 mb-1">
                  {lang==='pl'?'Kontakt':lang==='en'?'Contact':'Kontakt'}
                </p>
                <p className="text-xs text-slate-400">
                  {lang==='pl'?'W sprawach prywatności skontaktuj się ze Związkiem: ':lang==='en'?'For privacy matters contact the association: ':'For personvernspørsmål, kontakt foreningen: '}
                  <a href={`mailto:${ASSOC_SETTINGS.email}`} className="font-bold text-[#278EA5] hover:underline">{ASSOC_SETTINGS.email}</a>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Diving Ecology Education Frosta · {ASSOC_SETTINGS.addressLine1}, {ASSOC_SETTINGS.postalCode} {ASSOC_SETTINGS.city}, {ASSOC_SETTINGS.country}<br />
                  {lang==='pl'?'Numer organizacji':lang==='en'?'Organisation number':'Organisasjonsnummer'}: {ASSOC_SETTINGS.organisationNumber}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TEST DASHBOARD / PWA CHECKLIST ==================== */}
      {activeTab === 'test_dashboard' && (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <div className="max-w-3xl mx-auto space-y-6">

            {/* Header */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-xl font-black text-[#0A2E36] mb-1">Test Dashboard</h2>
              <p className="text-slate-500 text-sm">Diving Ecology Education Frosta — Prototype verification & PWA readiness</p>
              <div className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mt-2">
                Demo / Prototype environment — not production data
              </div>
            </div>

            {/* PWA / Mobile Checklist */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-black text-[#0A2E36] mb-4 flex items-center gap-2">
                <span>📱</span> PWA & Mobile Checklist
              </h3>
              {[
                { label: 'manifest.json present', status: 'ok', note: '/manifest.json — name, icons, display:standalone' },
                { label: 'Icons present (placeholder)', status: 'warn', note: 'Upload real icons to public/icons/ — see Icon Requirements below' },
                { label: 'App installable (Add to Home Screen)', status: 'info', note: 'Requires HTTPS + manifest + icons on real domain' },
                { label: 'Opens in standalone mode', status: 'info', note: 'Test after install: should open without browser UI' },
                { label: 'Mobile navigation (bottom nav)', status: 'ok', note: 'Bottom nav bar visible on screens < 768px' },
                { label: 'Sidebar on desktop', status: 'ok', note: 'Sidebar visible on screens ≥ 768px' },
                { label: 'Payment flow — mobile', status: 'ok', note: 'Bank transfer instructions responsive on mobile' },
                { label: 'Donation flow — mobile', status: 'ok', note: 'Donation form responsive, touch-friendly buttons' },
                { label: 'Event registration — mobile', status: 'ok', note: 'Event cards with register button, touch-friendly' },
                { label: 'Communicator — mobile', status: 'ok', note: 'Message list responsive, Show original works on mobile' },
                { label: 'Receipt upload — mobile', status: 'ok', note: 'File/camera input prepared, filename shown, stays PENDING' },
                { label: 'Offline fallback', status: 'ok', note: 'Service worker + offline.html ready (activate on HTTPS)' },
                { label: 'Push notifications', status: 'warn', note: 'NOT configured — placeholder only, no real push active' },
                { label: 'Service worker registered', status: 'info', note: 'Registers in production (HTTPS) only — not in dev/AI Studio' },
                { label: 'HTTPS required for PWA', status: 'info', note: 'Deploy to HTTPS domain before testing full PWA features' },
                { label: 'Privacy Policy page', status: 'ok', note: 'Draft privacy policy — requires legal review before publishing' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                  <span className="text-base mt-0.5 shrink-0">
                    {item.status === 'ok' ? '✅' : item.status === 'warn' ? '⚠️' : 'ℹ️'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-700 text-sm">{item.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{item.note}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Android PWA Readiness */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-black text-[#0A2E36] mb-4 flex items-center gap-2">
                <span>🤖</span> Android / PWA Deployment Notes
              </h3>
              {[
                { icon: '✅', title: 'Install via Chrome (Add to Home Screen)', desc: 'PWA can be installed on Android directly from Chrome browser — no app store required for basic install.' },
                { icon: '🏪', title: 'Google Play (Trusted Web Activity)', desc: 'A Play Store version can later be created using Trusted Web Activity (TWA) — wraps the PWA as a native-looking Android app.' },
                { icon: '🔒', title: 'HTTPS domain required', desc: 'Service worker, push notifications and PWA install all require a valid HTTPS domain (e.g., portal.divingecologyfrosta.no).' },
                { icon: '📄', title: 'manifest.json required', desc: 'manifest.json is present at /manifest.json. Verify it is served with correct Content-Type: application/manifest+json.' },
                { icon: '🖼️', title: 'Icons required', desc: 'Upload real icons to public/icons/icon-192.png and public/icons/icon-512.png. Use the official Diving Ecology Education Frosta logo — see Icon Requirements below.' },
                { icon: '🔗', title: 'Digital Asset Links (TWA only)', desc: 'For Google Play TWA: create /.well-known/assetlinks.json to link domain to Play app signing key.' },
                { icon: '💳', title: 'Google Play Developer account', desc: 'Requires a Google Play Developer account ($25 one-time fee). For nonprofits, check Google for Nonprofits program.' },
                { icon: '🧪', title: 'Test on real Android device', desc: 'Use Chrome DevTools → Application → Manifest to verify installability. Also test in Chrome on Android phone.' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
                  <span className="text-lg shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <div className="font-semibold text-slate-700 text-sm">{item.title}</div>
                    <div className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* iPhone / Apple Readiness */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-black text-[#0A2E36] mb-4 flex items-center gap-2">
                <span>🍎</span> iPhone / Apple Deployment Notes
              </h3>
              {[
                { icon: '📲', title: 'Safari Add to Home Screen', desc: 'iPhone users can use Safari → Share → Add to Home Screen. The app uses apple-mobile-web-app-capable meta tags for a near-native feel.' },
                { icon: '🍎', title: 'App Store requires Apple Developer Program', desc: 'Publishing to the App Store requires an Apple Developer Program membership ($99/year USD, or free for some nonprofits).' },
                { icon: '🏢', title: 'Organization account may need D-U-N-S number', desc: 'Apple organization accounts require a D-U-N-S number (free from Dun & Bradstreet). Allow 2-3 weeks to obtain.' },
                { icon: '💰', title: 'Nonprofit fee waiver possible', desc: 'Registered nonprofits may qualify for a waiver of the Apple Developer Program fee through Apple nonprofit program.' },
                { icon: '🔔', title: 'Push notifications on iOS require testing', desc: 'Web Push on iOS (Safari 16.4+) requires careful testing. Apple Push Notification Service (APNs) behaves differently than Web Push on Android.' },
                { icon: '📦', title: 'Native wrapper option', desc: 'Capacitor.js can wrap the web app as a native iOS app. This allows App Store distribution and full iOS API access. Consider for future phase.' },
                { icon: '🔒', title: 'HTTPS required', desc: 'All PWA and App Store features require a valid HTTPS domain.' },
                { icon: '🧪', title: 'Test on real iPhone', desc: 'Use Safari on iPhone to test Add to Home Screen, standalone mode, and touch UI. Test in multiple iOS versions.' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
                  <span className="text-lg shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <div className="font-semibold text-slate-700 text-sm">{item.title}</div>
                    <div className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Icon Requirements */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-black text-[#0A2E36] mb-4 flex items-center gap-2">
                <span>🖼️</span> Icon Requirements — Manual Upload Needed
              </h3>
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 mb-4 text-amber-800 text-sm">
                <span className="font-bold">⚠️ Action required:</span> The following icon files must be created manually from the official Diving Ecology Education Frosta logo (<code className="bg-amber-100 px-1 rounded">public/logo.png</code>) and uploaded to the <code className="bg-amber-100 px-1 rounded">public/icons/</code> folder.
              </div>
              {[
                { file: 'public/icons/icon-192.png', size: '192×192 px', purpose: 'Standard PWA icon (Android, Chrome)', note: 'Use the official logo on #F8FAFB or white background' },
                { file: 'public/icons/icon-512.png', size: '512×512 px', purpose: 'Large PWA icon (splash screen, Play Store)', note: 'Same logo, high resolution' },
                { file: 'public/icons/maskable-icon-512.png', size: '512×512 px', purpose: 'Android adaptive icon (maskable)', note: 'Logo centered with 20% safe-zone padding around all edges. Background color: #0A2E36' },
                { file: 'public/apple-touch-icon.png', size: '180×180 px', purpose: 'iOS Add to Home Screen icon', note: 'Logo on white background, rounded corners handled by iOS' },
                { file: 'public/favicon.png', size: '32×32 px (or 64×64 px)', purpose: 'Browser tab favicon', note: 'Small version of logo or just the fish/diver icon from the logo' },
              ].map((item, idx) => (
                <div key={idx} className="border border-slate-100 rounded-lg p-3 mb-3 last:mb-0">
                  <div className="font-bold text-[#0A2E36] text-sm font-mono mb-1">{item.file}</div>
                  <div className="flex gap-2 flex-wrap mb-1">
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded font-bold">{item.size}</span>
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">{item.purpose}</span>
                  </div>
                  <p className="text-xs text-slate-400">{item.note}</p>
                </div>
              ))}
              <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-500">
                <span className="font-bold">Recommended tools:</span> Use Figma, Photoshop, GIMP, or <a href="https://realfavicongenerator.net" className="text-[#278EA5]" target="_blank" rel="noreferrer">realfavicongenerator.net</a> to generate all icon sizes from the source logo. Always use the official Diving Ecology Education Frosta logo — do not generate a new logo.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================== MOBILE BOTTOM NAVIGATION ==================== */}
      {/* Visible only on mobile (md:hidden) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0A2E36] border-t border-[#14424B] z-50 flex items-stretch">
        {[
          { id: 'dashboard', label: lang==='pl'?'Start':lang==='en'?'Home':'Hjem', icon: BarChart2 },
          { id: 'fees', label: lang==='pl'?'Składki':lang==='en'?'Fees':'Gebyr', icon: DollarSign, badge: unpaidMembers.length },
          { id: 'events', label: lang==='pl'?'Events':lang==='en'?'Events':'Aktivitet', icon: Calendar },
          { id: 'comms', label: lang==='pl'?'Wiad.':lang==='en'?'Comms':'Meld.', icon: Mail },
          { id: 'members', label: lang==='pl'?'Czł.':lang==='en'?'Members':'Medl.', icon: Users, badge: pendingMembers.length },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[56px] transition-colors relative ${
              activeTab === item.id ? 'text-[#48C0D8] bg-[#0E3A45]' : 'text-slate-400'
            }`}
            aria-label={item.label}
          >
            {item.badge && item.badge > 0 ? (
              <div className="relative">
                <item.icon size={20} />
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{item.badge}</span>
              </div>
            ) : (
              <item.icon size={20} />
            )}
            <span className="text-[10px] mt-0.5 font-semibold leading-tight">{item.label}</span>
          </button>
        ))}
      </nav>

    </div>
  );
}

// PAYMENT_MODULE_START - Payment & Donation System for Diving Ecology Education Frosta
