import React, { useState } from 'react';
import { 
  User, CheckCircle2, Shield, Calendar, CreditCard, 
  Download, Printer, Upload, AlertCircle, HelpCircle, EyeOff
} from 'lucide-react';
import { motion } from 'motion/react';
import { MembershipCard, UserRole } from './types';
import { translations } from './translations';

interface MembershipCardComponentProps {
  card: MembershipCard;
  viewerRole: UserRole;
  viewerMemberId: string;
  onPhotoUpload?: (photoUrl: string) => void;
  lang: 'no' | 'pl' | 'en';
}

export function MembershipCardComponent({
  card,
  viewerRole,
  viewerMemberId,
  onPhotoUpload,
  lang = 'no'
}: MembershipCardComponentProps) {
  const t = translations[lang] || translations['no'];
  
  const [photoMessage, setPhotoMessage] = useState<string | null>(null);
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);

  // Access Control Checks
  const isGuest = viewerRole === 'guest';
  const isOwnCard = viewerMemberId === card.memberId;
  const isBoardOrAdmin = viewerRole === 'board' || viewerRole === 'admin';
  const canViewCard = !isGuest && (isOwnCard || isBoardOrAdmin);

  // Photo Visibility Check
  const canViewPhoto = isOwnCard || isBoardOrAdmin;

  // Compute membership validity status
  const isMembershipValid = card.feeStatus === 'paid' || card.feeStatus === 'exempt';

  if (!canViewCard) {
    return (
      <div id="no-access" className="p-6 bg-slate-50/50 border border-slate-200 rounded-xl text-center">
        <p className="text-sm text-slate-500 font-medium">
          {lang === 'no' 
            ? 'Du har ikke tilgang til å se dette medlemskortet.' 
            : lang === 'pl' 
              ? 'Nie masz uprawnień do przeglądania tej legitymacji.' 
              : 'You do not have permission to view this membership card.'}
        </p>
      </div>
    );
  }

  // Handle Photo Upload Simulation
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          if (onPhotoUpload) {
            onPhotoUpload(reader.result);
          }
          setPhotoMessage(t.photoUploadDemoNotice);
          setTimeout(() => setPhotoMessage(null), 6000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    setDownloadMessage(t.pdfNotConfigured);
    setTimeout(() => setDownloadMessage(null), 4000);
  };

  // Fee badge styling & translation
  const getFeeBadgeStyles = (status: string) => {
    switch (status) {
      case 'paid':
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-400',
          label: t.feePaid
        };
      case 'pending':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-400',
          label: t.feePending
        };
      case 'unpaid':
        return {
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          dot: 'bg-rose-400',
          label: t.feeUnpaid
        };
      case 'exempt':
      default:
        return {
          bg: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
          dot: 'bg-slate-400',
          label: t.feeExempt
        };
    }
  };

  const badge = getFeeBadgeStyles(card.feeStatus);

  // Initials for placeholder
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 3);
  };

  return (
    <div id={`member-card-container-${card.memberId}`} className="w-full max-w-2xl mx-auto space-y-6">
      {/* Photo notice at the top if visible to user */}
      {photoMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-[#0A2E36]/10 border border-[#278EA5]/30 rounded-xl flex items-start gap-2.5 text-xs text-[#278EA5] leading-relaxed"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{photoMessage}</span>
        </motion.div>
      )}

      {downloadMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-700 leading-relaxed"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{downloadMessage}</span>
        </motion.div>
      )}

      {/* Main Card Element */}
      <motion.div 
        id={`membership-card-print-${card.memberId}`}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative bg-gradient-to-br from-[#0B2E36] via-[#09262C] to-[#041013] text-slate-200 rounded-2xl shadow-xl overflow-hidden border border-[#278EA5]/30 p-6 md:p-8 select-none print:shadow-none print:border-slate-300 print:text-slate-900 print:bg-none print:bg-white flex flex-col md:flex-row gap-6 justify-between"
      >
        {/* Ocean waves watermark effect background */}
        <div className="absolute inset-0 pointer-events-none opacity-5 overflow-hidden print:hidden" style={{ zIndex: 0 }}>
          <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-1/2">
            <path fill="#278EA5" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,117C672,117,768,171,864,181.3C960,192,1056,160,1152,144C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>

        {/* Left Side: Member Profile & Card Info */}
        <div className="flex-1 space-y-6 relative" style={{ zIndex: 1 }}>
          {/* Logo container strictly loading logo.png */}
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-lg border border-slate-200/80 shadow-xs flex items-center justify-center w-12 h-12 shrink-0">
              <img 
                src="/logo.png" 
                alt="Diving Ecology Education Frosta logo" 
                className="w-full h-full object-contain block max-h-[36px]"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-[#48C0D8] leading-tight uppercase print:text-slate-900">
                {card.organisationName}
              </h2>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight uppercase print:text-slate-500">
                {t.organisationNumber}: {card.organisationNumber}
              </p>
            </div>
          </div>

          <div className="flex gap-5 items-start mt-4">
            {/* Portrait / Photo Slot */}
            <div className="relative group shrink-0">
              <div className="w-24 h-28 md:w-28 md:h-32 bg-[#020e11]/60 border border-[#278EA5]/40 rounded-xl overflow-hidden flex flex-col items-center justify-center relative print:border-slate-300">
                {canViewPhoto && card.photoUrl ? (
                  <img 
                    src={card.photoUrl} 
                    alt={card.fullName} 
                    className="w-full h-full object-cover block"
                  />
                ) : (
                  <div className="text-center font-mono p-2">
                    {!canViewPhoto ? (
                      <div className="flex flex-col items-center text-slate-500">
                        <EyeOff className="w-5 h-5 mb-1" />
                        <span className="text-[8px] leading-tight font-sans text-center px-1">
                          {lang === 'no' ? 'Skjult' : lang === 'pl' ? 'Ukryte' : 'Hidden'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold tracking-tight text-[#48C0D8]/80 print:text-slate-500">
                          {getInitials(card.fullName)}
                        </span>
                        <span className="text-[8px] text-slate-500 mt-1 font-sans font-normal leading-tight">No Photo</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Photo consent & upload trigger (Visible to owner/admin/board and only in browser) */}
              {canViewPhoto && isOwnCard && (
                <label className="absolute -bottom-2 -right-2 bg-[#278EA5] hover:bg-[#1f7386] text-white p-1.5 rounded-full cursor-pointer shadow-md transition-colors print:hidden flex items-center justify-center">
                  <Upload className="w-3.5 h-3.5" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoUpload} 
                    className="hidden" 
                  />
                </label>
              )}
            </div>

            {/* Core Member Attributes */}
            <div className="space-y-3.5 flex-1 min-w-0">
              <div>
                <span className="text-[10px] text-slate-400 capitalize block tracking-wide font-medium print:text-slate-500">{t.memberName}</span>
                <span className="text-base md:text-lg font-bold tracking-tight text-white block truncate print:text-slate-900 leading-tight">
                  {card.fullName}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block tracking-wide font-medium print:text-slate-500">{t.memberId}</span>
                  <span className="text-xs md:text-sm font-semibold text-slate-100 font-mono tracking-wider print:text-slate-800">
                    {card.memberIdFormatted}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block tracking-wide font-medium print:text-slate-500">{t.memberRole}</span>
                  <span className="text-xs md:text-sm font-semibold capitalize text-slate-100 print:text-slate-800">
                    {t[card.role] || card.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block tracking-wide font-medium print:text-slate-500">{t.membershipYear}</span>
                  <span className="text-xs md:text-sm font-semibold text-slate-100 print:text-slate-800">
                    {card.membershipYear}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block tracking-wide font-medium print:text-slate-500">{t.feeStatus}</span>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${badge.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                    {badge.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Validity Notice Section */}
          <div className="pt-3.5 border-t border-[#278EA5]/25 mt-4">
            <div className="flex items-center gap-1.5 mb-1 bg-[#0A2E36]/30 px-2.5 py-1 rounded-lg w-fit border border-[#278EA5]/15 print:border-slate-200">
              {isMembershipValid ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className={`text-[11px] font-bold tracking-tight ${isMembershipValid ? 'text-emerald-300' : 'text-amber-300'} print:text-slate-800`}>
                {isMembershipValid ? t.membershipValid : t.membershipNotConfirmed}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 italic leading-snug font-medium print:text-slate-600">
              {t.validityNotice}
            </p>
          </div>
        </div>

        {/* Right Side: QR Verification Block */}
        <div className="w-full md:w-36 shrink-0 flex flex-col items-center justify-between border-t md:border-t-0 md:border-l border-[#278EA5]/20 pt-4 md:pt-0 md:pl-6 relative z-10 print:border-slate-300 print:border-l print:border-t-0 print:pl-6">
          <div className="text-center w-full grow flex flex-col items-center justify-center">
            {/* Demo QR Block */}
            <div className="w-24 h-24 bg-white/10 rounded-lg p-1.5 flex flex-col items-center justify-center border border-white/10 mb-2 select-none print:border-slate-300">
              <span className="text-xs font-bold text-[#48C0D8] font-mono tracking-widest">{t.demoQR}</span>
              <span className="text-[8px] text-slate-400 max-w-[80px] mt-1 uppercase tracking-tight leading-tight">
                {t.digitalVerificationNotConfigured}
              </span>
            </div>

            <span className="text-[10px] font-semibold text-slate-300 flex items-center gap-1 mt-1 print:text-slate-700">
              <Shield className="w-3 h-3 text-[#48C0D8] print:text-slate-800" />
              {t.verified}: Demo
            </span>
          </div>

          <div className="w-full mt-4 md:mt-0 text-center md:text-right border-t border-[#278EA5]/10 pt-3 md:border-t-0 md:pt-0">
            <span className="text-[9px] text-slate-400 block tracking-wide print:text-slate-500">{t.validUntil}</span>
            <span className="text-[11px] font-semibold font-mono text-[#48C0D8] print:text-slate-800">
              {card.validUntil}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Dynamic Actions for Interactive Screens - HIDE in print */}
      <div className="flex flex-wrap gap-3 items-center justify-end print:hidden">
        {/* Photo consent summary shown for the member themselves to support compliance */}
        {isOwnCard && card.photoConsent && (
          <div className="mr-auto text-xs text-slate-500 flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{t.photoConsent}: {card.photoConsent.consentGiven ? t.success : 'N/A'}</span>
          </div>
        )}

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 hover:text-white rounded-xl text-sm font-semibold transition-colors duration-150 border border-slate-700 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>{t.printCard}</span>
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 hover:text-white rounded-xl text-sm font-semibold transition-colors duration-150 border border-slate-700 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{t.downloadCard}</span>
        </button>
      </div>
    </div>
  );
}
