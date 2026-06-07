import { Calendar, Plus, Users, MapPin, Clock, Tag } from 'lucide-react';
import { Lang, ParticipantRole } from '../types';
import { translations } from '../translations';
import { SupabaseEvent } from '../services/eventsService';

export interface EventsViewProps {
  state: any;
  events?: SupabaseEvent[];
  eventsSupabaseStatus?: 'demo' | 'connected' | 'error';
  lang: Lang;
  role: string;
  activePersona: string;
  setActiveTab: (tab: string) => void;
  showEventModal: boolean;
  setShowEventModal: (v: boolean) => void;
  eventForm: any;
  setEventForm: (f: any) => void;
  handleCreateEvent: (e: any) => void;
  handleDeleteEvent?: (id: string) => void;
  executePost: (url: string, body: any) => void;
}

export default function EventsView(props: EventsViewProps) {
  const { state, events = [], eventsSupabaseStatus = 'demo', lang, role, activePersona, setActiveTab, showEventModal, setShowEventModal,
    eventForm, setEventForm, handleCreateEvent, handleDeleteEvent, executePost } = props;
  const t = translations[lang] || translations.no;
  
  // Filter logic
  let visibleEvents: any[] = [];
  if (eventsSupabaseStatus === 'connected' && events.length > 0) {
    visibleEvents = events.filter(e => {
      if (role === 'admin' || role === 'board') return true;
      if (role === 'member') return e.visibility === 'public' || e.visibility === 'members';
      // guest
      return e.visibility === 'public';
    }).map(e => ({
      id: e.id,
      title: e.title,
      category: e.eventType,
      date: e.eventDate,
      startTime: e.startTime,
      endTime: e.endTime,
      location: e.location,
      description: e.description,
      maxParticipants: e.maxParticipants,
      pointsValue: 0, // Not matching fully, default
      visibilityMeta: e.visibility,
      safetyNotes: '',
      requiredEquipment: '',
      registrations: []
    }));
  } else {
    visibleEvents = state?.events || [];
  }

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center gap-3 border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-xl font-bold text-[#0A2E36]">{t.manageEvents}</h3>
          <p className="text-xs text-slate-500 mt-1">Dive eco tasks, school ecological days, cleanups, board forums.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {(role === 'admin' || role === 'board') && eventsSupabaseStatus === 'connected' && (
            <span className="bg-emerald-500/20 text-emerald-800 text-[10px] uppercase font-bold tracking-wider py-1 px-3 rounded-full border border-emerald-500/30 whitespace-nowrap">
              SUPABASE EVENTS CONNECTED
            </span>
          )}
          {(role === 'admin' || role === 'board') && eventsSupabaseStatus !== 'connected' && (
            <span className="bg-amber-500/20 text-amber-800 text-[10px] uppercase font-bold tracking-wider py-1 px-3 rounded-full border border-amber-500/30 whitespace-nowrap">
              DEMO EVENTS IN USE
            </span>
          )}
          {(role === 'board' || role === 'admin') && (
            <button onClick={() => setShowEventModal(true)} className="bg-[#278EA5] hover:bg-[#1f7387] text-white font-bold text-xs px-4 py-2 rounded-lg shadow cursor-pointer">
              + New Event
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleEvents.map((e) => {
          return (
            <div key={e.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] uppercase font-black bg-blue-100 text-[#0A2E36] px-2.5 py-1 rounded">
                    {e.category.replace('_', ' ')}
                  </span>
                  <h4 className="font-extrabold text-[#0A2E36] mt-2 text-base leading-tight">{e.title}</h4>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                    🏆 {e.pointsValue} pts
                  </span>
                  {e.visibilityMeta && (
                    <span className="text-[9px] font-bold uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {e.visibilityMeta}
                    </span>
                  )}
                  {(role === 'admin' || role === 'board') && eventsSupabaseStatus === 'connected' && (
                    <button onClick={() => handleDeleteEvent?.(e.id)} className="text-[10px] text-red-500 hover:text-red-700 mt-1 cursor-pointer">
                      Delete
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border text-slate-700">
                <div>
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase font-mono">Date & Time</p>
                  <p className="font-bold">
                    {e.startTime ? `${e.date} ${e.startTime.slice(0, 5)} - ${e.endTime ? e.endTime.slice(0, 5) : ''}` : new Date(e.date).toLocaleString(lang === 'pl' ? 'pl-PL' : 'no-NO')}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase font-mono">Fjord Spot</p>
                  <p className="font-bold truncate">{e.location}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-normal">{e.description}</p>
              
              {e.safetyNotes && (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs text-amber-900 leading-normal">
                  <p className="font-extrabold">⚠️ Safety Directives:</p>
                  <p className="mt-1 font-normal text-slate-600">{e.safetyNotes}</p>
                </div>
              )}

              {e.requiredEquipment && (
                <p className="text-xs text-slate-700 font-semibold">
                  🛠️ Required Gear: <span className="font-normal text-slate-600">{e.requiredEquipment}</span>
                </p>
              )}

              {/* Sign up controls for members */}
              {role !== 'guest' && (
                <div className="border-t pt-4">
                  <p className="text-xs font-extrabold text-slate-700 mb-2">My Outing Slot placement:</p>
                  {e.registrations.some(r => r.memberId === 'mem_2') ? (
                    <div className="flex items-center justify-between bg-emerald-50 p-2.5 rounded border border-emerald-200">
                      <span className="text-xs text-emerald-800 font-bold">✓ Registered as {e.registrations.find(r => r.memberId === 'mem_2')?.role.toUpperCase()}</span>
                      <button
                        onClick={() => executePost('/api/events/unregister', { eventId: e.id, memberId: 'mem_2' })}
                        className="text-red-650 hover:underline font-bold text-xs cursor-pointer"
                      >
                        Cancel Placement
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-1.5 flex-wrap">
                      {(['diver', 'shore_support', 'volunteer'] as ParticipantRole[]).map(rl => (
                        <button
                          key={rl}
                          onClick={() => executePost('/api/events/register', { eventId: e.id, memberId: 'mem_2', role: rl })}
                          className="bg-slate-100 hover:bg-[#278EA5] hover:text-white transition rounded-lg p-1.5 px-3 text-[10px] font-black text-slate-700 cursor-pointer uppercase font-mono"
                        >
                          + {rl.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Attendance Checker */}
              <div className="border-t pt-4 space-y-2">
                <p className="text-xs font-bold text-slate-700">Registrations & Attendance Logs ({e.registrations.length}):</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {e.registrations.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic font-medium">No members registered yet.</p>
                  ) : (
                    e.registrations.map(reg => (
                      <div key={reg.memberId} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded">
                        <span className="font-semibold text-slate-800">
                          {reg.memberName} <span className="text-[10px] text-[#278EA5] font-bold font-mono">({reg.role.toUpperCase()})</span>
                        </span>

                        <div className="flex items-center">
                          {(role === 'board' || role === 'admin') ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() => executePost('/api/events/attendance', { eventId: e.id, memberId: reg.memberId, status: 'attended' })}
                                className={`px-2 py-0.5 rounded text-[9px] font-black cursor-pointer ${reg.status === 'attended' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                              >
                                Attended
                              </button>
                              <button
                                onClick={() => executePost('/api/events/attendance', { eventId: e.id, memberId: reg.memberId, status: 'absent' })}
                                className={`px-2 py-0.5 rounded text-[9px] font-black cursor-pointer ${reg.status === 'absent' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                              >
                                Absent
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] font-extrabold text-[#278EA5] uppercase">{reg.status}</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
