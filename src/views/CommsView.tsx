import {
  Users, Calendar, DollarSign, FileText, Layers, Volume2, Mail,
  Shield, Search, Plus, Activity, TrendingUp, BarChart2, Clock,
  RefreshCw, CheckCircle2, X, Trash2, Lock, FileSpreadsheet,
  MessageSquare, Bell, Settings, CreditCard, Tag, ShieldAlert
} from 'lucide-react';
import { Lang, MessageModule, MessageType } from '../types';
import { translations } from '../translations';
import { DivingLogo } from '../components/DivingLogo';


export interface CommsViewProps {
  state: any;
  lang: Lang;
  role: string;
  activePersona: string;
  setActiveTab: (tab: string) => void;
  msgText: string;
  setMsgText: (v: string) => void;
  selectedModule: string;
  setSelectedModule: (v: any) => void;
  msgType: string;
  setMsgType: (v: any) => void;
  relatedId: string;
  setRelatedId: (v: string) => void;
  chatFilter: string;
  setChatFilter: (v: string) => void;
  showOriginalMsg: Record<string, boolean>;
  setShowOriginalMsg: (v: any) => void;
  dmRecipientId: string;
  setDmRecipientId: (v: string) => void;
  sendingMsg: boolean;
  setSendingMsg: (v: boolean) => void;
  handleSendMessage: (e: any) => void;
  handleMarkMessageAsRead: (id: string) => void;
  selectedTemplate: string;
  setSelectedTemplate: (v: string) => void;
  customMailBody: string;
  setCustomMailBody: (v: string) => void;
  annForm: any;
  setAnnForm: (f: any) => void;
  showAnnModal: boolean;
  setShowAnnModal: (v: boolean) => void;
  handleCreateAnnMessage: (e: any) => void;
  loggedUser: any;
}

export default function CommsView(props: CommsViewProps) {
  const { state, lang, role, activePersona, setActiveTab, msgText, setMsgText, selectedModule, setSelectedModule, msgType, setMsgType, relatedId, setRelatedId, chatFilter, setChatFilter, showOriginalMsg, setShowOriginalMsg, dmRecipientId, setDmRecipientId, sendingMsg, setSendingMsg, handleSendMessage, handleMarkMessageAsRead, selectedTemplate, setSelectedTemplate, customMailBody, setCustomMailBody, annForm, setAnnForm, showAnnModal, setShowAnnModal, handleCreateAnnMessage, loggedUser } = props;
  const t = translations[lang] || translations.no;
  
  return (
<div className="space-y-6">
  
  {/* Communicator Header Banner */}
  <div className="bg-[#0A2E36] text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-md border border-[#14424B]">
    <div className="flex items-center space-x-4">
      <DivingLogo />
      <div>
        <h3 className="text-lg md:text-xl font-black tracking-tight text-[#48C0D8]">
          Diving Ecology Education Frosta — Multilingual Communicator
        </h3>
        <p className="text-xs text-slate-355 max-w-xl mt-1 leading-normal">
          Bridges Norwegian Bokmål, Polish, and English voices. Every announcement, project update, or general message is instantly translated using the Gemini API.
        </p>
      </div>
    </div>
    <div className="flex items-center bg-[#278EA5]/25 border border-[#48C0D8]/40 px-3.5 py-1.5 rounded-xl">
      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-200">
        Active Workspace: <strong className="text-[#48C0D8] font-bold">PORT 3000 Node</strong>
      </span>
    </div>
  </div>

  {/* Main Communicator Layout Grid */}
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

    {/* Channel/Module Sideboard Navigation */}
    <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm h-fit">
      <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 font-mono">
        Communication Channels
      </h4>
      
      <div className="flex flex-col space-y-1">
        {[
          { id: 'general', label: '🌍 General Members Chat', desc: 'Open discussion' },
          { id: 'announcement', label: '📢 Official Announcements', desc: 'Important bulletins' },
          { id: 'volunteer', label: '🎗️ Volunteer Coordination', desc: 'Rostering & shoreline work' },
          { id: 'event', label: '📅 Event Discussions', desc: 'Dive outings & safety' },
          { id: 'project', label: '💡 Project Initiatives', desc: 'Eco-challenges & grants' },
          { id: 'board_only', label: '🔒 Boardroom Portal', desc: 'Restricted governance' },
          { id: 'direct', label: '✉️ Direct Messages', desc: 'One-on-one translators' }
        ].map(ch => {
          const isRestricted = ch.id === 'board_only' && role !== 'admin' && role !== 'board';
          const isSelected = selectedModule === ch.id;

          return (
            <button
              key={ch.id}
              disabled={isRestricted && false} // Let them click to see restricted warning
              onClick={() => {
                setSelectedModule(ch.id as MessageModule);
                setChatFilter('all');
              }}
              className={`w-full text-left p-3 rounded-lg transition-all border ${
                isSelected
                  ? 'bg-[#278EA5]/10 text-[#0A2E36] font-bold border-[#278EA5]/30'
                  : 'bg-transparent text-slate-600 hover:bg-slate-50 border-transparent hover:border-slate-100'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-[12px] font-extrabold">{ch.label}</span>
                {isRestricted && (
                  <span className="bg-red-50 text-red-650 text-[8px] font-mono uppercase px-1.5 py-0.5 rounded border border-red-100 font-black">
                    Restricted
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-450 mt-0.5 font-normal leading-none">{ch.desc}</p>
            </button>
          );
        })}
      </div>

      <div className="bg-slate-50 p-3.5 rounded-lg border text-[11px] text-slate-500 space-y-2">
        <p className="font-bold text-[#0A2E36] text-xxs uppercase tracking-wider">Your Member Profile Context</p>
        <div className="space-y-1 font-mono text-[10px]">
          <p>👤 Name: <b className="text-slate-700">{loggedUser.fullName}</b></p>
          <p>🔑 Role: <b className="text-slate-705 capitalize">{role}</b></p>
          <p>💬 Preferred: <b className="text-[#278EA5] uppercase">{loggedUser.preferredLanguage}</b></p>
        </div>
        <p className="text-[9px] leading-snug font-sans text-slate-400">
          Chat translates dynamically to matches preferred locale. Switch profiles in the left sidebar to simulate other members!
        </p>
      </div>
    </div>

    {/* Message Feed Canvas Column */}
    <div className="lg:col-span-3 space-y-6">

      {/* Restricted Access Warning for Boardroom */}
      {selectedModule === 'board_only' && role !== 'admin' && role !== 'board' ? (
        <div className="bg-amber-50 rounded-xl p-8 border border-amber-300 shadow-sm text-center space-y-3">
          <ShieldAlert className="w-12 h-12 text-amber-600 mx-auto" />
          <h4 className="text-base font-extrabold text-amber-900">Access Restricted: Boardroom Channel</h4>
          <p className="text-xs text-amber-800 max-w-md mx-auto leading-relaxed">
            Your active simulated profile (<b>{loggedUser.fullName}</b> with the role <b>{role}</b>) does not possess permission to read or submit messages in the sovereign Boardroom.
          </p>
          <p className="text-[11px] font-mono text-slate-500">
            To gain access, use the <b>SIMULATION PROFILE</b> selector in the left sidebar to switch to <b>Anders Myrseth (Admin)</b> or <b>Arne Solbakken (Styre)</b>!
          </p>
        </div>
      ) : (
        <>
          {/* Selected Channel Sub-header */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest font-mono">
                Active Channel Discussion
              </span>
              <h4 className="text-md font-extrabold text-[#0A2E36] leading-tight capitalize">
                {selectedModule === 'board_only' ? '🔒 Exclusive Boardroom Portal' : `💬 ${selectedModule} Discussion forum`}
              </h4>
            </div>

            {/* Filters within the active channel */}
            <div className="flex bg-slate-100 rounded-lg p-1 text-[10px] font-bold">
              {[
                { id: 'all', label: 'All Messages' },
                { id: 'unconfirmed', label: 'Action Required / Unread' },
                { id: 'urgent', label: 'Urgent Bulletins' },
              ].map(flt => (
                <button
                  key={flt.id}
                  onClick={() => setChatFilter(flt.id)}
                  className={`px-3 py-1 rounded cursor-pointer ${
                    chatFilter === flt.id 
                      ? 'bg-[#278EA5] text-white shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {flt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Direct Messenger Chat Companion Selection */}
          {selectedModule === 'direct' && (
            <div className="bg-slate-50 border p-3 rounded-xl flex items-center justify-between gap-3 text-xs">
              <span className="font-bold text-slate-650">Select Direct Message Companion:</span>
              <select 
                value={dmRecipientId} 
                onChange={e => setDmRecipientId(e.target.value)}
                className="border p-1.5 rounded-lg bg-white font-semibold text-[#0A2E36]"
              >
                {state?.members.filter((m: any) => m.id !== loggedUser.id).map((m: any) => (
                  <option key={m.id} value={m.id}>👤 {m.fullName} ({m.preferredLanguage.toUpperCase()})</option>
                ))}
                {loggedUser.id !== 'mem_admin' && <option value="mem_admin">👤 Anders Myrseth (Admin, NO)</option>}
              </select>
            </div>
          )}

          {/* Events Discussion Outing Selection */}
          {selectedModule === 'event' && state?.events && (
            <div className="bg-slate-50 border p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <span className="font-bold text-slate-650">Discussing Outing Event:</span>
              <select 
                value={relatedId} 
                onChange={e => setRelatedId(e.target.value)}
                className="border p-1.5 rounded-lg bg-white font-semibold text-[#0A2E36] max-w-xs"
              >
                <option value="">-- Auto-select Active Event --</option>
                {state.events.map(e => (
                  <option key={e.id} value={e.id}>📅 {e.title} ({e.date})</option>
                ))}
              </select>
            </div>
          )}

          {/* Projects Discussion Selection */}
          {selectedModule === 'project' && state?.projects && (
            <div className="bg-slate-50 border p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <span className="font-bold text-slate-650">Discussing Environmental Project:</span>
              <select 
                value={relatedId} 
                onChange={e => setRelatedId(e.target.value)}
                className="border p-1.5 rounded-lg bg-white font-semibold text-[#0A2E36] max-w-xs"
              >
                <option value="">-- Auto-select Active Initiative --</option>
                {state.projects.map(p => (
                  <option key={p.id} value={p.id}>💡 {p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Chat Feed Messages Listing Container */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {(() => {
              // Filter state messages
              let list = state?.messages || [];
              
              // Fit within channel
              list = list.filter(m => {
                if (selectedModule === 'direct') {
                  return m.module === 'direct' && (
                    (m.senderId === loggedUser.id && m.relatedId === dmRecipientId) ||
                    (m.senderId === dmRecipientId && m.relatedId === loggedUser.id)
                  );
                }
                return m.module === selectedModule;
              });

              // Apply filters
              if (chatFilter === 'urgent') {
                list = list.filter(m => m.type === 'normal' || m.type === 'announcement' || m.type === 'volunteer_request'); // anything urgent
              } else if (chatFilter === 'unconfirmed') {
                list = list.filter(m => !m.readBy.includes(loggedUser.id));
              }

              if (list.length === 0) {
                return (
                  <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-400 text-xs">
                    No conversational logs registered in this module sector yet.
                    <br />
                    <span className="font-semibold text-[#278EA5] mt-1 inline-block">Be the first to post a translated dispatch!</span>
                  </div>
                );
              }

              return list.map(msg => {
                const readingLang = lang; // current selected UI language
                const rawTranslation = msg.translations[readingLang] || msg.originalText;
                const showOriginal = !!showOriginalMsg[msg.id];
                const wasTranslated = msg.originalLang !== readingLang;
                const isImportant = msg.type === 'board_decision' || msg.type === 'announcement';

                return (
                  <div 
                    key={msg.id} 
                    className={`p-4 rounded-xl border transition-all duration-150 ${
                      isImportant 
                        ? 'bg-[#0A2E36]/3 border-[#278EA5]/40 shadow-xs' 
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xxs'
                    }`}
                  >
                    {/* Message Meta Bar */}
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-[#0A2E36]">{msg.senderName}</span>
                        
                        {/* Role Badge representation */}
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                          {msg.senderId === 'mem_admin' ? 'SYSTEM ADM' : msg.senderId === 'mem_1' ? 'BOARD' : 'MEMBER'}
                        </span>

                        {/* Message Category representation */}
                        {msg.type !== 'normal' && (
                          <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded font-black ${
                            msg.type === 'board_decision' 
                              ? 'bg-amber-100 text-[#B8860B] border border-amber-200' 
                              : msg.type === 'announcement'
                              ? 'bg-rose-100 text-rose-700'
                              : msg.type === 'volunteer_request'
                              ? 'bg-[#278EA5]/20 text-[#0a2e36]'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {msg.type.replace('_', ' ')}
                          </span>
                        )}
                      </div>

                      {/* Date and Language flag details */}
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                        <span>{new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(msg.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        <span className="bg-slate-100 px-1 rounded uppercase tracking-wider font-extrabold text-[9px]">
                          orig: {msg.originalLang}
                        </span>
                      </div>
                    </div>

                    {/* Message Body Content Canvas */}
                    <div className="py-1">
                      {msg.type === 'board_decision' ? (
                        // Side-by-side formal board decision displaying original AND translation
                        <div className="bg-[#B8860B]/5 border-l-4 border-[#B8860B] rounded p-3 space-y-2 mt-1">
                          <p className="text-[10px] font-bold text-[#B8860B] uppercase tracking-wider">
                            ⚖️ Fellesvedtak / Official Board Record (Norwegian Source & Translation)
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                            <div className="p-2 bg-white/60 rounded">
                              <p className="font-bold text-[9px] uppercase font-mono text-slate-400 mb-1">Original Text ({msg.originalLang.toUpperCase()})</p>
                              <p className="italic text-slate-800">{msg.originalText}</p>
                            </div>
                            <div className="p-2 bg-[#278EA5]/5 rounded">
                              <p className="font-bold text-[9px] uppercase font-mono text-[#278EA5] mb-1">Your Language Translation ({readingLang.toUpperCase()})</p>
                              <p className="font-medium text-[#0A2E36]">
                                {msg.translations[readingLang] || msg.originalText}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Render normal translations with Toggleable Original Switcher
                        <div className="text-xs text-slate-705 leading-relaxed">
                          {showOriginal ? (
                            <div className="relative bg-slate-50 p-2.5 rounded border border-dashed text-slate-600 font-normal">
                              <span className="absolute top-1 right-1 text-[8px] bg-slate-200 text-slate-500 font-mono tracking-wider px-1 rounded">{msg.originalLang.toUpperCase()}</span>
                              {msg.originalText}
                            </div>
                          ) : (
                            <p className="font-medium text-[#0A2E36]">
                              {rawTranslation}
                            </p>
                          )}

                          {/* Translated Badge Alert */}
                          {wasTranslated && (
                            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-450 border-t pt-1.5">
                              <span className="italic flex items-center">
                                🤖 Automatic translation — original available
                              </span>
                              <button 
                                onClick={() => setShowOriginalMsg(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                                className="text-[#278EA5] hover:underline font-bold bg-[#278EA5]/5 px-2 py-0.5 rounded cursor-pointer"
                              >
                                {showOriginal ? 'Hide original' : 'Show original'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Read receipts details rows */}
                    <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400">
                      <div className="flex items-center space-x-1 hover:text-slate-600 cursor-help" title={`Confirmed read by: ${msg.readBy.map(rid => {
                        if (rid === 'mem_admin') return 'Anders Myrseth';
                        const m = state?.members.find(x => x.id === rid);
                        return m ? m.fullName : 'Anonymous Member';
                      }).join(', ')}`}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#278EA5]" />
                        <span>Read by {msg.readBy.length} member{msg.readBy.length !== 1 ? 's' : ''}</span>
                      </div>

                      {/* Action Button to mark read */}
                      {loggedUser.id !== 'mem_guest' && (
                        <div className="flex items-center space-x-2">
                          {msg.readBy.includes(loggedUser.id) ? (
                            <span className="text-emerald-600 font-bold flex items-center space-x-1 bg-emerald-50 px-2 py-0.5 rounded">
                              <span>✓ You confirmed reading</span>
                            </span>
                          ) : (
                            <button 
                              onClick={() => handleMarkMessageAsRead(msg.id)}
                              className="text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded font-bold transition-all border border-amber-200 cursor-pointer"
                            >
                              ● Click to confirm reading
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                );
              });
            })()}
          </div>

          {/* Interactive Message Dispatch Box Form */}
          {loggedUser.id === 'mem_guest' ? (
            <div className="bg-slate-100 border p-4 rounded-xl text-center text-xs text-slate-500 font-medium">
              🔒 Guest accounts cannot post messages. Simulate an active member profile from the left sideboard panel to write.
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="bg-white rounded-xl border border-slate-200/80 shadow-md p-5 space-y-4">
              <div className="flex justify-between items-center pb-2.5 border-b">
                <h5 className="text-xs font-black text-[#0A2E36] uppercase tracking-wider">
                  Compose translated dispatch to channel:
                </h5>
                <span className="text-[10px] text-slate-500 font-mono">
                  Sending as: <strong className="text-[#278EA5]">{loggedUser.fullName}</strong>
                </span>
              </div>

              {/* Options modifiers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block mb-1 text-slate-500 font-bold">Category Weight:</label>
                  <select 
                    value={msgType} 
                    onChange={e => setMsgType(e.target.value as MessageType)}
                    className="w-full border p-2 rounded bg-white text-[#0A2E36] font-semibold"
                  >
                    <option value="normal">💬 Normal Group Message</option>
                    <option value="announcement">📢 Important Announcement</option>
                    <option value="volunteer_request">🎗️ Shoreline Volunteer Request</option>
                    <option value="event_reminder">📅 Dive Safety Outing Reminder</option>
                    <option value="board_decision">⚖️ Formal Board Record / Decision</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <span className="block text-slate-500 font-black">Translation Pipeline:</span>
                  <div className="text-[11px] leading-relaxed text-slate-500 bg-slate-50 p-2 rounded border font-normal">
                    Dynamic Gemini lookup writes native equivalents in <b>English</b>, <b>Polski</b>, and <b>Norsk Bokmål</b> automatically. No manual typing required.
                  </div>
                </div>
              </div>

              {/* Quick template helpers */}
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-widest">
                  Quick community templates:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '👋 Welcome newcomers', text: 'Kjære venner! Velkommen til Diving Ecology Education Frosta. Cieszymy się, że jesteście z nami! We hope to meet you on the fjord soon.' },
                    { label: '🤿 Drysuit safety reminder', text: 'Important notice: Always inspect your latex Seals and check your secondary regulator pressure before entering the cold Trøndelag waters.' },
                    { label: '⚓ Småland shoreline logistics', text: 'Dugnad Småland lørdag kl 09:00: Vi trenger folk til søppelinnsamling på svabergene, og dykkere i havna.' }
                  ].map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMsgText(t.text)}
                      className="text-[10px] bg-slate-50 hover:bg-slate-100 border text-slate-600 px-2 py-1 rounded font-medium transition-all text-left cursor-pointer"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <textarea
                  required
                  rows={3}
                  value={msgText}
                  onChange={e => setMsgText(e.target.value)}
                  placeholder="Type your message in Norsk, Polski, or English... (e.g. 'Vi trenger ti frivillige til Småland på lørdag')"
                  className="w-full text-xs p-3.5 bg-slate-50 border rounded-xl font-normal leading-relaxed focus:ring-1 focus:ring-[#278EA5]"
                />
              </div>

              <button
                type="submit"
                disabled={sendingMsg}
                className="w-full bg-[#0A2E36] hover:bg-[#124b56] text-white text-xs font-bold py-2.5 rounded-xl shadow cursor-pointer transition-all flex items-center justify-center gap-2 disabled:bg-slate-400"
              >
                {sendingMsg ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#48C0D8]" />
                    <span>Gemini AI Translating & Dispatching...</span>
                  </>
                ) : (
                  <>
                    <span>✉ Send with Automated Gemini Translator</span>
                  </>
                )}
              </button>
            </form>
          )}
        </>
      )}

    </div>

  </div>

</div>
  );
}
