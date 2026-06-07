import React from 'react';
import {
  Lock, FileText
} from 'lucide-react';
import { Lang } from '../types';
import { translations } from '../translations';
import { SupabaseDocument } from '../services/documentsService';

export interface DocumentsViewProps {
  state: any;
  documents?: SupabaseDocument[];
  documentsSupabaseStatus?: 'demo' | 'connected' | 'error';
  lang: Lang;
  role: string;
  activePersona: string;
  setActiveTab: (tab: string) => void;
  showDocModal: boolean;
  setShowDocModal: (v: boolean) => void;
  docForm: any;
  setDocForm: (f: any) => void;
  handleCreateDoc: (e: any) => void;
}

export default function DocumentsView(props: DocumentsViewProps) {
  const { state, documents = [], documentsSupabaseStatus = 'demo', lang, role, activePersona, setActiveTab, showDocModal, setShowDocModal, docForm, setDocForm, handleCreateDoc } = props;
  const t = translations[lang] || translations.no;
  
  // Filter logic
  let visibleDocuments: any[] = [];
  if (documentsSupabaseStatus === 'connected') {
    visibleDocuments = documents.filter(d => {
      if (role === 'admin' || role === 'board') return true;
      if (role === 'member') return d.visibility === 'public' || d.visibility === 'members';
      // guest
      return d.visibility === 'public';
    }).map(d => ({
      id: d.id,
      title: d.title,
      category: d.category,
      fileName: d.fileUrl || 'unknown',
      lang: d.language,
      isPrivate: d.visibility === 'board' || d.visibility === 'members' ? true : false,
      visibilityMeta: d.visibility,
      description: d.description
    }));
  } else {
    visibleDocuments = state?.documents?.filter((d: any) => !d.isPrivate || (role === 'admin' || role === 'board')) || [];
    visibleDocuments = visibleDocuments.map(d => ({
      ...d,
      visibilityMeta: d.isPrivate ? 'board' : 'public'
    }));
  }

  return (
<div className="space-y-6 pb-24">
  
  <div className="flex justify-between items-center gap-3">
    <div>
      <h3 className="text-xl font-bold text-[#0A2E36] flex items-center gap-2">
        {t.documentLibrary} Certificate Catalog
      </h3>
      <p className="text-xs text-slate-500 mt-1">Official bylaws, grant requests, GDPR consents, educational articles.</p>
    </div>
    <div className="flex flex-col items-end gap-2">
      {(role === 'admin' || role === 'board') && documentsSupabaseStatus === 'connected' && (
        <span className="bg-emerald-500/20 text-emerald-800 text-[10px] uppercase font-bold tracking-wider py-1 px-3 rounded-full border border-emerald-500/30 whitespace-nowrap">
          SUPABASE DOCUMENTS CONNECTED
        </span>
      )}
      {(role === 'admin' || role === 'board') && documentsSupabaseStatus !== 'connected' && (
        <span className="bg-amber-500/20 text-amber-800 text-[10px] uppercase font-bold tracking-wider py-1 px-3 rounded-full border border-amber-500/30 whitespace-nowrap">
          DEMO DOCUMENTS IN USE
        </span>
      )}
      {(role === 'board' || role === 'admin') && (
        <button onClick={() => setShowDocModal(true)} className="bg-[#278EA5] hover:bg-[#1E7387] transition-colors text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1 shadow-sm">
          + Upload File
        </button>
      )}
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-normal">
    {visibleDocuments.map(doc => (
      <div key={doc.id} className="bg-white p-5 rounded-xl border border-slate-205 shadow-sm space-y-3 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="bg-[#278EA5]/10 text-[#278EA5] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
              {doc.category.replace('_', ' ')}
            </span>
            {doc.visibilityMeta === 'board' && (
              <span className="bg-red-50 text-red-700 border border-red-200 text-[9px] font-black uppercase px-2 py-0.5 rounded flex items-center space-x-0.5">
                <Lock className="w-2.5 h-2.5 inline" />
                <span>Secured</span>
              </span>
            )}
            {doc.visibilityMeta === 'members' && (
              <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[9px] font-black uppercase px-2 py-0.5 rounded flex items-center space-x-0.5">
                <Lock className="w-2.5 h-2.5 inline" />
                <span>Members Only</span>
              </span>
            )}
          </div>

          <h4 className="font-extrabold text-[#0A2E36] text-sm leading-snug">{doc.title}</h4>
          <p className="text-slate-400 font-mono text-[10px] truncate">📄 {doc.fileName}</p>
          {doc.description && <p className="text-slate-600 font-medium leading-relaxed mt-1">{doc.description}</p>}
        </div>

        <div className="border-t pt-3 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest font-mono">
          <div>
            <span>LANG: </span>
            <span className="font-black text-slate-800 uppercase">{doc.lang}</span>
          </div>
          <button 
            onClick={() => alert(`Simulated Open PDF file: ${doc.fileName}`)}
            className="text-[#278EA5] hover:underline font-bold text-[11px] cursor-pointer tracking-normal flex items-center gap-1"
          >
            View Doc pdf <FileText className="w-3 h-3"/>
          </button>
        </div>
      </div>
    ))}
    {visibleDocuments.length === 0 && (
      <div className="col-span-full py-12 text-center text-slate-500">
        No documents found.
      </div>
    )}
  </div>

</div>
  );
}
