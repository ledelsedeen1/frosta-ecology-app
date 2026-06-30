import React, { useState } from 'react';
import { 
  Search, SlidersHorizontal, Shield, Users, CreditCard, CheckCircle2, 
  Plus, Sparkles, Filter, Check, Eye, HelpCircle, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MembershipCardComponent } from './MembershipCardComponent';
import { MembershipCard, UserRole, MemberStatus, MembershipFeeStatus } from './types';
import { translations } from './translations';
import { isBoardOrAdminRole, isGuestRole, normalizeRole } from './roleUtils';

interface MembershipCardsPageProps {
  viewerRole: UserRole;
  viewerMemberId: string;
  lang: 'no' | 'pl' | 'en';
}

const INITIAL_DEMO_CARDS: MembershipCard[] = [
  {
    memberId: "mem_1",
    fullName: "Arne Solbakken",
    role: "board",
    memberStatus: "board",
    membershipYear: 2026,
    feeStatus: "paid",
    feeAmount: 350,
    currency: "NOK",
    issueDate: "2026-01-01",
    validUntil: "2026-12-31",
    organisationName: "Diving Ecology Education Frosta",
    organisationNumber: "926 177 621",
    memberIdFormatted: "2026-001",
    photoConsent: {
      consentGiven: true,
      consentDate: "2026-01-01",
      useOnMembershipCardOnly: true,
      useInPublicMaterial: false,
      useInEventDocumentation: true
    }
  },
  {
    memberId: "mem_2",
    fullName: "Marek Kowalski",
    role: "volunteer",
    memberStatus: "active",
    membershipYear: 2026,
    feeStatus: "paid",
    feeAmount: 350,
    currency: "NOK",
    issueDate: "2026-01-01",
    validUntil: "2026-12-31",
    organisationName: "Diving Ecology Education Frosta",
    organisationNumber: "926 177 621",
    memberIdFormatted: "2026-002",
    photoConsent: {
      consentGiven: true,
      consentDate: "2026-01-02",
      useOnMembershipCardOnly: true,
      useInPublicMaterial: true,
      useInEventDocumentation: true
    }
  },
  {
    memberId: "mem_3",
    fullName: "Elena Rostova",
    role: "member",
    memberStatus: "supporting",
    membershipYear: 2026,
    feeStatus: "pending",
    feeAmount: 350,
    currency: "NOK",
    issueDate: "2026-01-01",
    validUntil: "2026-12-31",
    organisationName: "Diving Ecology Education Frosta",
    organisationNumber: "926 177 621",
    memberIdFormatted: "2026-003",
    photoConsent: {
      consentGiven: false,
      useOnMembershipCardOnly: false,
      useInPublicMaterial: false,
      useInEventDocumentation: false
    }
  },
  {
    memberId: "mem_4",
    fullName: "Ingrid Haugum",
    role: "volunteer",
    memberStatus: "volunteer",
    membershipYear: 2026,
    feeStatus: "unpaid",
    feeAmount: 350,
    currency: "NOK",
    issueDate: "2026-01-01",
    validUntil: "2026-12-31",
    organisationName: "Diving Ecology Education Frosta",
    organisationNumber: "926 177 621",
    memberIdFormatted: "2026-004",
    photoConsent: {
      consentGiven: true,
      consentDate: "2026-01-15",
      useOnMembershipCardOnly: true,
      useInPublicMaterial: false,
      useInEventDocumentation: false
    }
  },
  {
    memberId: "mem_5",
    fullName: "Lars-Erik Svendsen",
    role: "member",
    memberStatus: "waiting_approval",
    membershipYear: 2026,
    feeStatus: "paid",
    feeAmount: 350,
    currency: "NOK",
    issueDate: "2026-01-01",
    validUntil: "2026-12-31",
    organisationName: "Diving Ecology Education Frosta",
    organisationNumber: "926 177 621",
    memberIdFormatted: "2026-005",
    photoConsent: {
      consentGiven: true,
      consentDate: "2026-01-20",
      useOnMembershipCardOnly: true,
      useInPublicMaterial: false,
      useInEventDocumentation: false
    }
  },
  {
    memberId: "mem_6",
    fullName: "Janusz Nowak",
    role: "volunteer",
    memberStatus: "new_applicant",
    membershipYear: 2026,
    feeStatus: "exempt",
    feeAmount: 0,
    currency: "NOK",
    issueDate: "2026-01-10",
    validUntil: "2026-12-31",
    organisationName: "Diving Ecology Education Frosta",
    organisationNumber: "926 177 621",
    memberIdFormatted: "2026-006",
    photoConsent: {
      consentGiven: false,
      useOnMembershipCardOnly: false,
      useInPublicMaterial: false,
      useInEventDocumentation: false
    }
  }
];

export function MembershipCardsPage({
  viewerRole,
  viewerMemberId,
  lang = 'no'
}: MembershipCardsPageProps) {
  const t = translations[lang] || translations['no'];

  // Session-persistent demo state for local simulation (e.g. upload photo, toggle consent)
  const [cards, setCards] = useState<MembershipCard[]>(() => {
    const saved = sessionStorage.getItem('deef_demo_membership_cards');
    return saved ? JSON.parse(saved) : INITIAL_DEMO_CARDS;
  });

  const saveCards = (newCards: MembershipCard[]) => {
    setCards(newCards);
    sessionStorage.setItem('deef_demo_membership_cards', JSON.stringify(newCards));
  };

  // Searching / filtering state (board/admin only)
  const [searchTerm, setSearchTerm] = useState('');
  const [feeFilter, setFeeFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedCardForModal, setSelectedCardForModal] = useState<MembershipCard | null>(null);

  // Helper check for authorization
  const normalizedViewerRole = normalizeRole(viewerRole);
  const isGuest = isGuestRole(viewerRole);
  const isBoardOrAdmin = isBoardOrAdminRole(viewerRole);

  // Photo Consent Configurator
  const [tempConsent, setTempConsent] = useState({
    consentGiven: true,
    useOnMembershipCardOnly: true,
    useInPublicMaterial: false,
    useInEventDocumentation: false
  });

  // Photo uploaded action handler
  const handlePhotoUpload = (memberId: string, photoUrl: string) => {
    const updated = cards.map(c => {
      if (c.memberId === memberId) {
        return { 
          ...c, 
          photoUrl,
          photoConsent: {
            ...c.photoConsent,
            consentGiven: true,
            consentDate: new Date().toISOString().split('T')[0],
            useOnMembershipCardOnly: true,
            useInPublicMaterial: c.photoConsent?.useInPublicMaterial || false,
            useInEventDocumentation: c.photoConsent?.useInEventDocumentation || false
          }
        };
      }
      return c;
    });
    saveCards(updated);
  };

  const handleUpdateConsent = (memberId: string) => {
    const updated = cards.map(c => {
      if (c.memberId === memberId) {
        return {
          ...c,
          photoConsent: {
            consentGiven: tempConsent.consentGiven,
            consentDate: tempConsent.consentGiven ? new Date().toISOString().split('T')[0] : undefined,
            revokedDate: !tempConsent.consentGiven ? new Date().toISOString().split('T')[0] : undefined,
            useOnMembershipCardOnly: tempConsent.useOnMembershipCardOnly,
            useInPublicMaterial: tempConsent.useInPublicMaterial,
            useInEventDocumentation: tempConsent.useInEventDocumentation
          }
        };
      }
      return c;
    });
    saveCards(updated);
  };

  if (isGuest) {
    return (
      <div className="p-8 max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 shadow-md text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto text-rose-500">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">{t.myMembershipCard}</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          {lang === 'no' 
            ? 'Gjester har ikke tilgang til medlemskort.' 
            : lang === 'pl' 
              ? 'Goście nie mają dostępu do legitymacji.' 
              : 'Guests do not have access to membership cards.'}
        </p>
        <p className="text-xs text-slate-400 bg-slate-50 p-2.5 rounded-lg">
          {lang === 'no'
            ? 'Vennligst register deg som søker eller logg inn med et gyldig medlemsskap for å hente ditt digitale medlemskort.'
            : lang === 'pl'
              ? 'Zarejestruj się jako kandydat lub zaloguj się na aktywne konto członkowskie, aby odebrać legitymację.'
              : 'Please register as an applicant or log in with an active membership to retrieve your digital card.'}
        </p>
      </div>
    );
  }

  // If viewer is a normal member or volunteer, they can only view/manage their OWN card
  if (!isBoardOrAdmin) {
    const myCard = cards.find(c => c.memberId === viewerMemberId);
    if (!myCard) {
      return (
        <div className="p-8 max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 text-center text-slate-500">
          <p className="text-sm font-semibold mb-2">Medlemskort ikke funnet</p>
          <p className="text-xs">
            {lang === 'no'
              ? 'Fant ikke noe medlemskort registrert på din konto. Kontakt portalarbeider eller administratoren.'
              : 'Unable to locate a membership card associated with your account. Please contact administrative staff.'}
          </p>
        </div>
      );
    }

    return (
      <div className="py-6 max-w-4xl mx-auto space-y-8 px-4">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-black text-[#0A2E36] tracking-tight">{t.myMembershipCard}</h1>
          <p className="text-xs text-slate-500 mt-1">Diving Ecology Education Frosta digital ID card</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <MembershipCardComponent 
              card={myCard}
              viewerRole={viewerRole}
              viewerMemberId={viewerMemberId}
              onPhotoUpload={(url) => handlePhotoUpload(myCard.memberId, url)}
              lang={lang}
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Shield className="w-4 h-4 text-[#278EA5]" />
              {t.photoConsent}
            </h3>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              {lang === 'no' 
                ? 'Dykking og havmiljøvern innebærer fotografering under aktiviteter. Du kan velge hvordan bildet ditt lagres og vises.'
                : 'Diving and marine conservation activities involve photography. Choose how your portrait is handled.'}
            </p>

            <div className="space-y-3.5 pt-1 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={tempConsent.consentGiven}
                  onChange={(e) => {
                    setTempConsent(prev => ({ ...prev, consentGiven: e.target.checked }));
                  }}
                  className="rounded border-slate-300 text-[#278EA5] focus:ring-[#278EA5] mt-0.5"
                />
                <div>
                  <span className="font-semibold text-slate-700 block">{t.photoConsent}</span>
                  <span className="text-slate-400 text-[10px]">Gir samtykke til medlemsbilde på profilkortet.</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={tempConsent.useOnMembershipCardOnly}
                  onChange={(e) => {
                    setTempConsent(prev => ({ ...prev, useOnMembershipCardOnly: e.target.checked }));
                  }}
                  className="rounded border-slate-300 text-[#278EA5] focus:ring-[#278EA5] mt-0.5"
                />
                <div>
                  <span className="font-semibold text-slate-700 block">Kun til medlemskort</span>
                  <span className="text-slate-400 text-[10px]">Bildet skal aldri brukes offentlig, kun for sikkerhetsverifisering.</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={tempConsent.useInPublicMaterial}
                  onChange={(e) => {
                    setTempConsent(prev => ({ ...prev, useInPublicMaterial: e.target.checked }));
                  }}
                  className="rounded border-slate-300 text-[#278EA5] focus:ring-[#278EA5] mt-0.5"
                />
                <div>
                  <span className="font-semibold text-slate-700 block">Offentlig materiell</span>
                  <span className="text-slate-400 text-[10px]">Bildet kan inkluderes i prosjektrapporter på nett.</span>
                </div>
              </label>
            </div>

            <button
              onClick={() => handleUpdateConsent(myCard.memberId)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold tracking-wide transition-colors uppercase border border-slate-700 cursor-pointer"
            >
              {t.saveChange}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- BOARD/ADMIN PORTAL VIEW ---
  // Apply Search and Filters
  const filteredCards = cards.filter(card => {
    const matchesSearch = card.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          card.memberIdFormatted.includes(searchTerm);
    const matchesRole = roleFilter === 'all' || card.role === roleFilter;
    const matchesFee = feeFilter === 'all' || card.feeStatus === feeFilter;
    
    return matchesSearch && matchesRole && matchesFee;
  });

  // Calculate metrics for stats row
  const countPaid = cards.filter(c => c.feeStatus === 'paid').length;
  const countPending = cards.filter(c => c.feeStatus === 'pending').length;
  const countUnpaid = cards.filter(c => c.feeStatus === 'unpaid').length;
  const countExempt = cards.filter(c => c.feeStatus === 'exempt').length;

  return (
    <div className="py-6 max-w-7xl mx-auto space-y-6 px-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-[#0A2E36] tracking-tight">{t.membershipCards}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Administrasjon og utstedelse av digitale medlemskort for Diving Ecology Education Frosta
          </p>
        </div>
        <div className="text-xs text-slate-500 font-medium bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 self-start">
          Moderator/Styre visning: <span className="font-bold text-[#278EA5]">{normalizedViewerRole.toUpperCase()}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Oppfylt/Betalt</span>
            <p className="text-xl font-bold text-slate-800 mt-1">{countPaid} {lang === 'no' ? 'medlemmer' : 'members'}</p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Venter</span>
            <p className="text-xl font-bold text-slate-800 mt-1">{countPending} {lang === 'no' ? 'filer' : 'pending'}</p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Ubetalt</span>
            <p className="text-xl font-bold text-slate-800 mt-1">{countUnpaid}</p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Fritatt</span>
            <p className="text-xl font-bold text-slate-800 mt-1">{countExempt}</p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search field */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Søk på medlem eller ID (f.eks 2026-001)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 focus:border-[#278EA5] focus:ring-1 focus:ring-[#278EA5] text-sm bg-slate-50/50 hover:bg-slate-50 rounded-xl"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Fee Status select */}
            <div className="flex items-center gap-1 bg-slate-50 px-2 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Kontingent:</span>
              <select
                value={feeFilter}
                onChange={(e) => setFeeFilter(e.target.value)}
                className="text-xs bg-transparent border-0 text-slate-700 py-1.5 focus:ring-0 font-semibold cursor-pointer"
              >
                <option value="all">Alle</option>
                <option value="paid">{t.feePaid}</option>
                <option value="pending">{t.feePending}</option>
                <option value="unpaid">{t.feeUnpaid}</option>
                <option value="exempt">{t.feeExempt}</option>
              </select>
            </div>

            {/* Role filter select */}
            <div className="flex items-center gap-1 bg-slate-50 px-2 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Rolle:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-xs bg-transparent border-0 text-slate-700 py-1.5 focus:ring-0 font-semibold cursor-pointer"
              >
                <option value="all">Alle</option>
                <option value="board">{t.board}</option>
                <option value="volunteer">{t.volunteer}</option>
                <option value="member">{t.member}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Membership Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredCards.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 border border-slate-200 border-dashed rounded-2xl">
            <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold">Fant ingen aktive medlemskort</p>
            <p className="text-xs mt-1">Prøv å endre søkeord eller filtrene dine.</p>
          </div>
        ) : (
          filteredCards.map(card => (
            <div 
              key={card.memberId} 
              className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-md transition-shadow relative group"
            >
              <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                <button
                  onClick={() => setSelectedCardForModal(card)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-[#278EA5]/15 hover:text-[#1c6a7d] text-slate-600 rounded-lg text-[10px] font-bold tracking-wide transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>FORSTØRR</span>
                </button>
              </div>

              <div className="transform scale-[0.93] origin-top-left -mr-[7.5%] -mb-4">
                <MembershipCardComponent
                  card={card}
                  viewerRole={viewerRole}
                  viewerMemberId={card.memberId} // Simulate acting as card owner for preview
                  onPhotoUpload={(url) => handlePhotoUpload(card.memberId, url)}
                  lang={lang}
                />
              </div>

              {/* Board/Admin Actions Block */}
              <div className="border-t border-slate-150 pt-3.5 mt-4 flex justify-between items-center bg-slate-50/50 -mx-5 -mb-5 p-5 rounded-b-2xl text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="font-bold">Flytt status og bilde:</span>
                  <select
                    value={card.feeStatus}
                    onChange={(e) => {
                      const newStatus = e.target.value as MembershipFeeStatus;
                      const updated = cards.map(c => 
                        c.memberId === card.memberId ? { ...c, feeStatus: newStatus } : c
                      );
                      saveCards(updated);
                    }}
                    className="border border-slate-200 rounded bg-white text-[11px] p-1 font-semibold text-slate-700 focus:ring-0"
                  >
                    <option value="paid">{t.feePaid}</option>
                    <option value="pending">{t.feePending}</option>
                    <option value="unpaid">{t.feeUnpaid}</option>
                    <option value="exempt">{t.feeExempt}</option>
                  </select>
                </div>
                
                {card.photoConsent?.consentGiven ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Bilde samtykket
                  </span>
                ) : (
                  <span className="text-red-500 font-semibold flex items-center gap-1">
                    ⚠️ Intet bilde samtykke
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Large scale View Overlay Modal */}
      <AnimatePresence>
        {selectedCardForModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 print:hidden">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-3xl w-full border border-slate-250 relative space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#278EA5]" />
                  <span className="font-black text-slate-800 text-sm">
                    Medlem detalj: {selectedCardForModal.fullName}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedCardForModal(null)}
                  className="p-1 px-3 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors font-bold text-xs rounded-lg cursor-pointer"
                >
                  LUKK
                </button>
              </div>

              <div id="full-membership-card-modal-view">
                <MembershipCardComponent
                  card={selectedCardForModal}
                  viewerRole={viewerRole}
                  viewerMemberId={selectedCardForModal.memberId}
                  onPhotoUpload={(url) => handlePhotoUpload(selectedCardForModal.memberId, url)}
                  lang={lang}
                />
              </div>

              <div className="text-[10px] text-slate-400 text-center uppercase tracking-wider bg-slate-50 py-2.5 rounded-xl border border-slate-200 leading-tight">
                For å skrive ut dette medlemskortet, klikk på &quot;{t.printCard}&quot; for fullstendig optimalisert PWA-utskrift.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
