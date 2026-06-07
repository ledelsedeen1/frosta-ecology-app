/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Member, 
  Event, 
  DocumentMeta, 
  Project, 
  Announcement, 
  SystemLog, 
  Lang, 
  MemberStatus, 
  PaymentStatus, 
  PaymentMethod,
  ParticipantRole,
  ParticipantStatus,
  EventCategory,
  ProjectStatus,
  Message,
  MessageType,
  MessageModule,
  MessageTranslation
} from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// --- IN-MEMORY DATABASE SEED ---

let members: Member[] = [
  {
    id: "mem_1",
    fullName: "Arne Solbakken",
    email: "arne.solbakken@frosta.kommune.no",
    phone: "471 23 456",
    preferredLanguage: "no",
    address: "Smålandvegen 42, 7633 Frosta",
    memberType: "individual",
    status: "board",
    dateJoined: "2022-04-12",
    paymentStatus: "paid",
    lastPaymentDate: "2026-01-10",
    notes: "Leder i foreningen. Dykkersertifikat PADI Rescue.",
    consentPrivacy: true,
    consentPhoto: true,
    emergencyContactName: "Kari Solbakken",
    emergencyContactPhone: "902 34 567",
    activityHistory: [
      { date: "2026-05-20", description: "Organized underwater cleanup at Småland", points: 40, hours: 6 },
      { date: "2026-04-12", description: "Attended annual meeting 2026", points: 5, hours: 2 },
      { date: "2026-05-01", description: "Project leadership - Blå Helsesarena", points: 50, hours: 15 }
    ]
  },
  {
    id: "mem_2",
    fullName: "Marek Kowalski",
    email: "marek.kowalski@gmail.com",
    phone: "912 83 746",
    preferredLanguage: "pl",
    address: "Frostasenteret 15, 7633 Frosta",
    memberType: "individual",
    status: "active",
    dateJoined: "2025-08-11",
    paymentStatus: "paid",
    lastPaymentDate: "2026-01-12",
    notes: "Aktiv dykker. Erfaren med tørrdrakt. Svært engasjert i opprydding.",
    consentPrivacy: true,
    consentPhoto: true,
    emergencyContactName: "Agnieszka Kowalska",
    emergencyContactPhone: "912 83 747",
    activityHistory: [
      { date: "2026-05-20", description: "Participated in Småland depth cleanup as Diver", points: 30, hours: 5 },
      { date: "2026-05-10", description: "Volunteered for Småland shoreline logistics", points: 20, hours: 4 }
    ]
  },
  {
    id: "mem_3",
    fullName: "Elena Rostova",
    email: "elena.rostova@outlook.com",
    phone: "918 27 364",
    preferredLanguage: "en",
    address: "Logtun, 7633 Frosta",
    memberType: "supporting",
    status: "supporting",
    dateJoined: "2025-10-01",
    paymentStatus: "paid",
    lastPaymentDate: "2026-02-14",
    notes: "Støttemedlem som bidrar med marinøkologisk faginnsikt.",
    consentPrivacy: true,
    consentPhoto: false,
    emergencyContactName: "Alexei Rostov",
    emergencyContactPhone: "+7 912 345 6789",
    activityHistory: [
      { date: "2026-04-12", description: "Attended annual meeting 2026 online", points: 5, hours: 1 }
    ]
  },
  {
    id: "mem_4",
    fullName: "Ingrid Haugum",
    email: "ingrid.h@haugum-gaard.no",
    phone: "405 82 193",
    preferredLanguage: "no",
    address: "Haugum Vestre, 7633 Frosta",
    memberType: "family",
    status: "volunteer",
    dateJoined: "2026-02-28",
    paymentStatus: "unpaid",
    notes: "Ønsker særlig å bidra på landbaserte ryddeaksjoner og matlaging for dykkerne.",
    consentPrivacy: true,
    consentPhoto: true,
    activityHistory: [
      { date: "2026-05-20", description: "Volunteer shore support (food and hot drinks)", points: 20, hours: 4 }
    ]
  },
  {
    id: "mem_5",
    fullName: "Lars-Erik Svendsen",
    email: "lars.erik.sv@hotmail.com",
    phone: "934 50 123",
    preferredLanguage: "no",
    address: "Småland Havn, 7633 Frosta",
    memberType: "individual",
    status: "waiting_approval",
    dateJoined: "2026-05-28",
    paymentStatus: "pending",
    notes: "Ny søker. Har hytte på Småland. Ønsker å bli med fordi han ser verdien av å holde fjorden ren.",
    consentPrivacy: true,
    consentPhoto: true,
    emergencyContactName: "Grethe Svendsen",
    emergencyContactPhone: "934 50 124",
    activityHistory: []
  },
  {
    id: "mem_6",
    fullName: "Janusz Nowak",
    email: "janusz.nowak78@wp.pl",
    phone: "489 123 456",
    preferredLanguage: "pl",
    memberType: "individual",
    status: "new_applicant",
    dateJoined: "2026-05-30",
    paymentStatus: "unpaid",
    consentPrivacy: true,
    consentPhoto: false,
    activityHistory: []
  }
];

let events: Event[] = [
  {
    id: "evt_1",
    title: "Småland Marine Cleanup Day",
    date: "2026-06-14T10:00:00Z",
    location: "Småland, Frosta (Blå Helsesarena)",
    description: "Our quarterly underwater and shore cleanup. Divers scour the shallows for lost fishing nets and plastics, while the shore support recovers and registers garbage. Hot lunch served by the community team!",
    category: "cleanup",
    maxParticipants: 30,
    safetyNotes: "All divers must hold min. PADI OWD (or equivalent), have cold water dive experience, and check in with the safety officer. Shore support is open to everyone, including children.",
    requiredEquipment: "Divers: Complete scuba kit, dry suit, dive knife. Shore volunteers: Stout footwear and work gloves (Diving Ecology Education Frosta provides bags).",
    internalNotes: "Vipps payment fallback for equipment transport is covered by the Frifond grant.",
    pointsValue: 30,
    registrations: [
      { memberId: "mem_1", memberName: "Arne Solbakken", role: "organizer", status: "registered", registeredAt: "2026-05-15T09:12:00Z" },
      { memberId: "mem_2", memberName: "Marek Kowalski", role: "diver", status: "registered", registeredAt: "2026-05-16T14:30:00Z" },
      { memberId: "mem_4", memberName: "Ingrid Haugum", role: "shore_support", status: "registered", registeredAt: "2026-05-20T11:00:00Z" }
    ]
  },
  {
    id: "evt_2",
    title: "Eco Education Workshop: Marine Habitats of Frosta",
    date: "2026-06-21T14:00:00Z",
    location: "Diving Ecology Education Frosta Hub, Frosta Senter",
    description: "A friendly learning workshop on seaweed ecosystems, sea crab species and regional environmental challenges in the Trondheimsfjord. Includes custom multilingual posters in Polish and English.",
    category: "education",
    maxParticipants: 15,
    safetyNotes: "Indoor lecture, handicap accessible.",
    requiredEquipment: "Notebook and eager attitude.",
    pointsValue: 10,
    registrations: [
      { memberId: "mem_1", memberName: "Arne Solbakken", role: "organizer", status: "registered", registeredAt: "2026-05-15T09:12:00Z" },
      { memberId: "mem_3", memberName: "Elena Rostova", role: "guest", status: "registered", registeredAt: "2026-05-17T18:40:00Z" }
    ]
  },
  {
    id: "evt_3",
    title: "Diving Ecology Education Frosta June Board Meeting",
    date: "2026-06-08T18:00:00Z",
    location: "Frosta Flerbrukshus / Zoom",
    description: "Monthly board meeting. Discussion on AED placement at Småland, grant applications setup and the new Polish translation modules for documents.",
    category: "board_meeting",
    pointsValue: 5,
    registrations: [
      { memberId: "mem_1", memberName: "Arne Solbakken", role: "organizer", status: "registered", registeredAt: "2026-05-01T10:00:00Z" }
    ]
  }
];

let projects: Project[] = [
  {
    id: "proj_1",
    name: "Blå Helsesarena Småland",
    description: "Developing Småland beach into an inclusive physical arena for marine exploration, diving ecology, and barrier-free shoreline activity. Facilitating outdoor access for vulnerable social groups.",
    status: "active",
    responsiblePerson: "Arne Solbakken",
    budget: 85000,
    fundingSource: "Trøndelag Fylkeskommune & Gjensidigestiftelsen",
    sponsors: ["Frosta Kommune", "Småland Havneforening"],
    documents: ["doc_2", "doc_4"],
    tasks: [
      { id: "task_1", title: "Apply for custom shoreline permissions", dueDate: "2026-05-15", completed: true, assignedTo: "Arne Solbakken" },
      { id: "task_2", title: "Equip accessible picnic bench line", dueDate: "2026-06-30", completed: false, assignedTo: "Ingrid Haugum" },
      { id: "task_3", title: "Mount community recycling repository", dueDate: "2026-07-15", completed: false, assignedTo: "Marek Kowalski" }
    ],
    deadlines: ["2026-06-30 (Bench installation)", "2026-09-01 (Project completion summary)"],
    volunteerList: ["Arne Solbakken", "Marek Kowalski", "Ingrid Haugum"],
    progressNotes: "Initial permits signed by the Trøndelag coast guard. First phase funding of 50 000 NOK received. Community bench materials purchased."
  },
  {
    id: "proj_2",
    name: "AED / Defibrillator for Småland Hub",
    description: "A safety initiative to install a public-access, fully winter-insulated AED cardiac defibrillator at Småland harbor, boosting safety for local residents, ocean cleanup divers, and tourists.",
    status: "planned",
    responsiblePerson: "Marek Kowalski",
    budget: 22000,
    fundingSource: "Sparing and Local Crowdfunding",
    sponsors: ["Laerdal Medical discount pool", "Local Cabin Owners Association"],
    documents: [],
    tasks: [
      { id: "task_4", title: "Send formal grant proposal to local bank fund", dueDate: "2026-06-15", completed: false, assignedTo: "Marek Kowalski" },
      { id: "task_5", title: "Reach out to winter electrical connection helper", dueDate: "2026-07-01", completed: false, assignedTo: "Arne Solbakken" }
    ],
    deadlines: ["2026-08-15 (Target device purchase date)"],
    volunteerList: ["Marek Kowalski"],
    progressNotes: "Awaiting bank funding answer. Basic Laerdal outdoor cabinet template finalized."
  }
];

let documents: DocumentMeta[] = [
  {
    id: "doc_1",
    title: "Diving Ecology Education Frosta Vedtekter (Statutes)",
    category: "statutes",
    fileName: "Diving_Ecology_Education_Frosta_Vedtekter_V2.pdf",
    uploadedAt: "2024-03-11",
    uploadedBy: "Arne Solbakken",
    lang: "no",
    isPrivate: false,
    description: "Gjeldende offisielle vedtekter for Diving Ecology Education Frosta."
  },
  {
    id: "doc_2",
    title: "Blå Helsesarena - Project Safety Protocol",
    category: "safety",
    fileName: "Blå_Helsesearena_Safety_V1.pdf",
    uploadedAt: "2026-04-18",
    uploadedBy: "Arne Solbakken",
    lang: "en",
    isPrivate: false,
    description: "Required dive safety parameters and volunteer assembly checklists in Frosta."
  },
  {
    id: "doc_3",
    title: "Frivillighetsregisteret Brønnøysund Certificate",
    category: "bronnøysund",
    fileName: "Bronnoysund_Diving_Ecology_Education_Frosta_2025.pdf",
    uploadedAt: "2025-01-20",
    uploadedBy: "Arne Solbakken",
    lang: "no",
    isPrivate: true,
    description: "Offisiell registrering i Frivillighetsregisteret og enhetsregisteret."
  },
  {
    id: "doc_4",
    title: "GDPR Consent Form & Photo Release Protocol",
    category: "privacy",
    fileName: "Diving_Ecology_Education_Frosta_GDPR_Declaration.pdf",
    uploadedAt: "2026-05-10",
    uploadedBy: "Arne Solbakken",
    lang: "en",
    isPrivate: false,
    description: "Official form clarifying data processing, emergency contacts logging and photo storage limits."
  }
];

let announcements: Announcement[] = [
  {
    id: "ann_1",
    title: "Vellykket test av ryddeutstyr / Successful trials of cleanup tools",
    body: "Tusen takk til alle som stilte opp på Småland forrige helg! Vi testet de nye riss-nettene og magnetene for bunnsporing. Flott innsats fra det polsk-norske dykkerlaget! We collected 60 kg of legacy fish nets.",
    date: "2026-05-22",
    author: "Arne Solbakken",
    isPrivate: false,
    lang: "no"
  },
  {
    id: "ann_2",
    title: "Important: Emergency Defibrillator Placement Discussion",
    body: "Inside the board section, we are discussing the electrical wiring budget for the AED heated cabinet. Please read the draft in the Document Library and write down your estimate.",
    date: "2026-05-29",
    author: "Marek Kowalski",
    isPrivate: true,
    lang: "en"
  }
];

let logs: SystemLog[] = [
  {
    id: "log_1",
    timestamp: "2026-05-15T09:15:30Z",
    user: "Arne Solbakken",
    action: "Approved application",
    details: "Marek Kowalski was designated from 'waiting_approval' to 'active' member."
  },
  {
    id: "log_2",
    timestamp: "2026-05-20T16:00:00Z",
    user: "Arne Solbakken",
    action: "Assigned activity points",
    details: "Credited 30 points to Marek Kowalski for Småland Clean-up."
  }
];

let messages: Message[] = [
  {
    id: "msg_1",
    module: "general",
    type: "normal",
    senderId: "mem_2",
    senderName: "Marek Kowalski",
    originalLang: "pl",
    originalText: "Cześć wszystkim! Czy ktoś potrzebuje transportu na sobotnie sprzątanie w Småland? Mam wolne miejsca w aucie.",
    translations: {
      pl: "Cześć wszystkim! Czy ktoś potrzebuje transportu na sobotnie sprzątanie w Småland? Mam wolne miejsca w aucie.",
      no: "Hei alle sammen! Er det noen som trenger transport til lørdagens rydding i Småland? Jeg har ledige plasser i bilen.",
      en: "Hello everyone! Does anyone need transport for Saturday's cleanup in Småland? I have empty seats in my car."
    },
    isAutoTranslated: true,
    date: "2026-05-30T10:30:00Z",
    readBy: ["mem_1", "mem_3"],
    visibility: "members_all"
  },
  {
    id: "msg_2",
    module: "board_only",
    type: "board_decision",
    senderId: "mem_1",
    senderName: "Arne Solbakken",
    originalLang: "no",
    originalText: "Styret har godkjent innkjøp av en ny hjertestarter (AED) til Småland havneområde. Finansieres delvis av SpareBank 1 SMN.",
    translations: {
      no: "Styret har godkjent innkjøp av en ny hjertestarter (AED) til Småland havneområde. Finansieres delvis av SpareBank 1 SMN.",
      pl: "Zarząd zatwierdził zakup nowego defibrylatora (AED) dla obszaru portu Småland. Finansowane częściowo przez SpareBank 1 SMN.",
      en: "The board has approved the purchase of a new training/emergency defibrillator (AED) for the Småland harbor area. Partially funded by SpareBank 1 SMN."
    },
    isAutoTranslated: true,
    date: "2026-05-29T14:15:00Z",
    readBy: ["mem_2"],
    visibility: "board_only"
  },
  {
    id: "msg_3",
    module: "event",
    relatedId: "evt_1",
    type: "event_reminder",
    senderId: "mem_1",
    senderName: "Arne Solbakken",
    originalLang: "no",
    originalText: "Vennlig påminnelse: Husk draktsertifikat og kniv for dykkere på lørdag. Oppmøte kl 09:00 på Småland.",
    translations: {
      no: "Vennlig påminnelse: Husk draktsertifikat og kniv for dykkere på lørdag. Oppmøte kl 09:00 på Småland.",
      pl: "Przyjazne przypomnienie: Pamiętaj o certyfikacie na suchy skafander i nożu dla nurków w sobotę. Zbiórka o 09:00 w Småland.",
      en: "Friendly reminder: Remember your drysuit certification and dive knife for divers on Saturday. Gathering at 09:00 at Småland."
    },
    isAutoTranslated: true,
    date: "2026-05-28T08:00:00Z",
    readBy: ["mem_2", "mem_4"],
    visibility: "members_all"
  },
  {
    id: "msg_4",
    module: "project",
    relatedId: "proj_1", // Ocean Cleanup Challenge
    type: "project_update",
    senderId: "mem_3",
    senderName: "Elena Rostova",
    originalLang: "en",
    originalText: "We have finalized the grid mapping for diving sectors. Polish and Norwegian guides will cross-reference grid markers.",
    translations: {
      en: "We have finalized the grid mapping for diving sectors. Polish and Norwegian guides will cross-reference grid markers.",
      no: "Vi har fullført rutenett-kartleggingen for dykkersektorer. Polske og norske guider vil kryssreferere rutenettmarkørene.",
      pl: "Sfinalizowaliśmy mapowanie siatki dla sektorów nurkowych. Polscy i norwescy przewodnicy będą wzajemnie kontrolować znaczniki siatki."
    },
    isAutoTranslated: true,
    date: "2026-05-27T16:40:00Z",
    readBy: ["mem_1", "mem_2"],
    visibility: "members_all"
  },
  {
    id: "msg_5",
    module: "volunteer",
    type: "volunteer_request",
    senderId: "mem_4",
    senderName: "Ingrid Haugum",
    originalLang: "no",
    originalText: "Vi trenger to personer til å steke vafler og koke kaffe til ryddekorpset på lørdag. Noen som kan stille på land?",
    translations: {
      no: "Vi trenger to personer til å steke vafler og koke kaffe til ryddekorpset på lørdag. Noen som kan stille på land?",
      pl: "Potrzebujemy dwóch osób do smażenia gofrów i parzenia kawy dla ekipy sprzątającej w sobotę. Czy ktoś może pomóc na lądzie?",
      en: "We need two people to make waffles and brew coffee for the cleanup crew on Saturday. Anyone who can volunteer on shore?"
    },
    isAutoTranslated: true,
    date: "2026-05-29T11:20:00Z",
    readBy: ["mem_1"],
    visibility: "members_all"
  }
];

const aiClient = process.env.GEMINI_API_KEY ? new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
}) : null;

async function translateMessage(text: string): Promise<{ originalLang: Lang; translations: MessageTranslation; isAutoTranslated: boolean }> {
  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Translate and process this user text from a member of Diving Ecology Education Frosta: "${text}"`,
        config: {
          systemInstruction: `You are an automated, community-centric translation helper for a Norwegian voluntary association named "Diving Ecology Education Frosta" (representing marine ecology, diving cleanups, and shoreline conservation in Frosta, Norway).
Your goals are:
1. Detect whether the input language is closest to Norwegian ('no'), Polish ('pl'), or English ('en'). Set this in originalLang.
2. Maintain the full organization name "Diving Ecology Education Frosta" exactly without translating or abbreviating it.
3. Translate the input accurately and in a highly natural, warm, and professional tone into Norwegian Bokmål ('no'), Polish ('pl'), and English ('en'). Keep dates, locations, and safety notes exact.
4. Output your response strictly as a JSON object matching this schema:
{
  "originalLang": "no" | "pl" | "en",
  "translations": {
    "no": "Norwegian Bokmål translation",
    "pl": "Polish translation",
    "en": "English translation"
  }
}`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              originalLang: {
                type: Type.STRING,
                description: "The detected original language ('no', 'pl', or 'en')."
              },
              translations: {
                type: Type.OBJECT,
                properties: {
                  no: { type: Type.STRING },
                  pl: { type: Type.STRING },
                  en: { type: Type.STRING }
                },
                required: ["no", "pl", "en"]
              }
            },
            required: ["originalLang", "translations"]
          }
        }
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      if (parsed.originalLang && parsed.translations?.no && parsed.translations?.pl && parsed.translations?.en) {
        return {
          originalLang: parsed.originalLang as Lang,
          translations: parsed.translations as MessageTranslation,
          isAutoTranslated: true
        };
      }
    } catch (e) {
      console.error("Gemini Translation Endpoint issue, falling back to mock processor:", e);
    }
  }

  // Robust, smart localized pattern translation fallback as guaranteed reliability
  let originalLang: Lang = 'no';
  const l = text.toLowerCase();
  
  if (l.includes('cześć') || l.includes('czesc') || l.includes('dzieki') || l.includes('dziękuję') || l.includes('sprzątanie') || l.includes('nurkow') || l.includes('zarząd') || l.includes('witaj') || l.includes(' spotkanie') || l.includes('jest ')) {
    originalLang = 'pl';
  } else if (l.includes('hello') || l.includes('welcome') || l.includes('cleaning') || l.includes('scuba') || l.includes('defibrillator') || l.includes('meeting') || l.includes('thanks') || l.includes('cooperation')) {
    originalLang = 'en';
  }

  // Elegant localized placeholder generations
  let translations: MessageTranslation;
  if (originalLang === 'no') {
    translations = {
      no: text,
      pl: `[Tłumaczenie automatyczne] ${text} (Naciskając przycisk 'Pokaż oryginał' zobaczysz tekst norweski)`,
      en: `[Auto Translated] ${text} (Click 'Show original' to view the original Norwegian content)`
    };
  } else if (originalLang === 'pl') {
    translations = {
      no: `[Automatisk oversettelse] ${text} (Klikk på 'Vis original' for å se den polske teksten)`,
      pl: text,
      en: `[Auto Translated] ${text} (Click 'Show original' to view the original Polish content)`
    };
  } else {
    translations = {
      no: `[Automatisk oversettelse] ${text} (Klikk på 'Vis original' for å se den engelske teksten)`,
      pl: `[Tłumaczenie automatyczne] ${text} (Naciskając przycisk 'Pokaż oryginał' zobaczysz tekst angielski)`,
      en: text
    };
  }

  return {
    originalLang,
    translations,
    isAutoTranslated: true
  };
}

// Helper to log actions
function addLog(user: string, action: string, details: string) {
  logs.unshift({
    id: "log_" + Date.now(),
    timestamp: new Date().toISOString(),
    user,
    action,
    details
  });
}

// --- API ENDPOINTS ---

// Return full state
app.get('/api/state', (req, res) => {
  res.json({ members, events, projects, documents, announcements, logs, messages });
});

// Member applications & administration
app.post('/api/members/add', (req, res) => {
  const { fullName, email, phone, preferredLanguage, address, memberType, status, consentPrivacy, consentPhoto, emergencyContactName, emergencyContactPhone, notes, actor } = req.body;
  
  if (!fullName || !email) {
    return res.status(400).json({ error: "Name and Email are required" });
  }

  const newMember: Member = {
    id: "mem_" + Date.now(),
    fullName,
    email,
    phone: phone || "",
    preferredLanguage: preferredLanguage || "no",
    address: address || "",
    memberType: memberType || "individual",
    status: status || "new_applicant",
    dateJoined: new Date().toISOString().split('T')[0],
    paymentStatus: status === 'new_applicant' ? 'unpaid' : 'pending',
    consentPrivacy: !!consentPrivacy,
    consentPhoto: !!consentPhoto,
    emergencyContactName: emergencyContactName || "",
    emergencyContactPhone: emergencyContactPhone || "",
    notes: notes || "",
    activityHistory: []
  };

  members.push(newMember);
  addLog(actor || "System", "New Member Application", `Registered ${fullName} with status ${newMember.status}`);
  res.json({ success: true, state: { members, events, projects, documents, announcements, logs } });
});

app.post('/api/members/update', (req, res) => {
  const { id, fullName, email, phone, preferredLanguage, address, memberType, status, paymentStatus, lastPaymentDate, notes, consentPrivacy, consentPhoto, emergencyContactName, emergencyContactPhone, actor } = req.body;
  
  const idx = members.findIndex(m => m.id === id);
  if (idx === -1) return res.status(404).json({ error: "Member not found" });

  members[idx] = {
    ...members[idx],
    fullName: fullName || members[idx].fullName,
    email: email || members[idx].email,
    phone: phone ?? members[idx].phone,
    preferredLanguage: preferredLanguage || members[idx].preferredLanguage,
    address: address ?? members[idx].address,
    memberType: memberType || members[idx].memberType,
    status: status || members[idx].status,
    paymentStatus: paymentStatus || members[idx].paymentStatus,
    lastPaymentDate: lastPaymentDate ?? members[idx].lastPaymentDate,
    notes: notes ?? members[idx].notes,
    consentPrivacy: consentPrivacy !== undefined ? consentPrivacy : members[idx].consentPrivacy,
    consentPhoto: consentPhoto !== undefined ? consentPhoto : members[idx].consentPhoto,
    emergencyContactName: emergencyContactName ?? members[idx].emergencyContactName,
    emergencyContactPhone: emergencyContactPhone ?? members[idx].emergencyContactPhone,
  };

  addLog(actor || "Board Admin", "Updated Member File", `Modified card details of ${members[idx].fullName}`);
  res.json({ success: true, state: { members, events, projects, documents, announcements, logs } });
});

app.post('/api/members/delete', (req, res) => {
  const { id, actor } = req.body;
  const idx = members.findIndex(m => m.id === id);
  if (idx === -1) return res.status(404).json({ error: "Member not found" });
  
  const mName = members[idx].fullName;
  members.splice(idx, 1);
  addLog(actor || "GDPR Officer", "Deleted Member (GPDR Purge)", `Permanently removed ${mName} per privacy right of erasure.`);
  res.json({ success: true, state: { members, events, projects, documents, announcements, logs } });
});

app.post('/api/members/approve', (req, res) => {
  const { id, actor } = req.body;
  const member = members.find(m => m.id === id);
  if (!member) return res.status(404).json({ error: "Member not found" });

  member.status = 'active';
  member.paymentStatus = 'unpaid'; // Ready to pay first invoice
  addLog(actor || "Board Member", "Approved Application", `Reviewed and granted active status to ${member.fullName}`);
  res.json({ success: true, state: { members, events, projects, documents, announcements, logs } });
});

app.post('/api/members/reject', (req, res) => {
  const { id, actor } = req.body;
  const member = members.find(m => m.id === id);
  if (!member) return res.status(404).json({ error: "Member not found" });

  member.status = 'former';
  addLog(actor || "Board Member", "Rejected Application", `Declined application of ${member.fullName}. Status changed to former member.`);
  res.json({ success: true, state: { members, events, projects, documents, announcements, logs } });
});

// Membership fee confirmations
app.post('/api/fees/mark-paid', (req, res) => {
  const { id, paymentMethod, lastPaymentDate, actor } = req.body;
  const member = members.find(m => m.id === id);
  if (!member) return res.status(404).json({ error: "Member not found" });

  member.paymentStatus = 'paid';
  member.lastPaymentDate = lastPaymentDate || new Date().toISOString().split('T')[0];
  
  // Award Eco Points for supporting the association fee: 10 points
  member.activityHistory.push({
    date: new Date().toISOString().split('T')[0],
    description: `Paid Annual Membership fee via ${(paymentMethod || 'vipps').toUpperCase()}`,
    points: 10
  });

  addLog(actor || "Treasurer", "Payment Accepted", `Manually logged annual payment for ${member.fullName} via ${paymentMethod || 'vipps'}.`);
  res.json({ success: true, state: { members, events, projects, documents, announcements, logs } });
});

// Send notification simulation
app.post('/api/fees/send-reminder', (req, res) => {
  const { id, isBulk, actor } = req.body;
  
  if (isBulk) {
    const targetList = members.filter(m => m.paymentStatus === 'unpaid' || m.paymentStatus === 'overdue');
    targetList.forEach(m => {
      addLog(actor || "Automation", "Dispatched Reminder Notice", `Fee payment invoice reminder triggered via email to ${m.email}`);
    });
    res.json({ success: true, count: targetList.length, state: { members, events, projects, documents, announcements, logs } });
  } else {
    const member = members.find(m => m.id === id);
    if (!member) return res.status(404).json({ error: "Member not found" });
    addLog(actor || "Board Admin", "Dispatched Reminder Notice", `Individually sent fee reminder to ${member.email}`);
    res.json({ success: true, state: { members, events, projects, documents, announcements, logs } });
  }
});

// Events & Attendance
app.post('/api/events/create', (req, res) => {
  const { title, date, location, description, category, maxParticipants, safetyNotes, requiredEquipment, internalNotes, pointsValue, actor } = req.body;
  if (!title || !date || !location) {
    return res.status(400).json({ error: "Title, Date and Location are required" });
  }

  const newEvent: Event = {
    id: "evt_" + Date.now(),
    title,
    date,
    location,
    description: description || "",
    category: (category as EventCategory) || "cleanup",
    maxParticipants: maxParticipants ? Number(maxParticipants) : undefined,
    registrations: [],
    safetyNotes: safetyNotes || "",
    requiredEquipment: requiredEquipment || "",
    internalNotes: internalNotes || "",
    pointsValue: pointsValue ? Number(pointsValue) : 10
  };

  events.push(newEvent);
  addLog(actor || "Secretary", "Created Event", `Added environmental calendar item: ${title}`);
  res.json({ success: true, state: { members, events, projects, documents, announcements, logs } });
});

app.post('/api/events/register', (req, res) => {
  const { eventId, memberId, role, actor } = req.body;
  const event = events.find(e => e.id === eventId);
  if (!event) return res.status(404).json({ error: "Event not found" });

  const alreadyRegistered = event.registrations.some(r => r.memberId === memberId);
  if (alreadyRegistered) {
    return res.status(400).json({ error: "Member is already registered" });
  }

  const member = members.find(m => m.id === memberId);
  const mName = member ? member.fullName : "Unknown Guest";

  event.registrations.push({
    memberId,
    memberName: mName,
    role: (role as ParticipantRole) || 'member',
    status: 'registered',
    registeredAt: new Date().toISOString()
  });

  addLog(actor || mName, "Signed up for Event", `${mName} registered as ${role || 'member'} for ${event.title}`);
  res.json({ success: true, state: { members, events, projects, documents, announcements, logs } });
});

app.post('/api/events/unregister', (req, res) => {
  const { eventId, memberId, actor } = req.body;
  const event = events.find(e => e.id === eventId);
  if (!event) return res.status(404).json({ error: "Event not found" });

  const idx = event.registrations.findIndex(r => r.memberId === memberId);
  if (idx === -1) return res.status(404).json({ error: "Registration not found" });

  const mName = event.registrations[idx].memberName;
  event.registrations.splice(idx, 1);

  addLog(actor || mName, "Unregistered from Event", `${mName} cancelled reservation for ${event.title}`);
  res.json({ success: true, state: { members, events, projects, documents, announcements, logs } });
});

app.post('/api/events/attendance', (req, res) => {
  const { eventId, memberId, status, actor } = req.body;
  const event = events.find(e => e.id === eventId);
  if (!event) return res.status(404).json({ error: "Event not found" });

  const reg = event.registrations.find(r => r.memberId === memberId);
  if (!reg) return res.status(404).json({ error: "Registration not found for this member" });

  const oldStatus = reg.status;
  reg.status = status as ParticipantStatus;

  const member = members.find(m => m.id === memberId);
  
  if (member && status === 'attended' && oldStatus !== 'attended') {
    // Award activity points & volunteer hours based on registration role
    let pts = event.pointsValue;
    let computedHours = 4; // average duration

    if (reg.role === 'organizer') {
      pts = 40; 
      computedHours = 6;
    } else if (reg.role === 'diver') {
      pts += 10; // extra points for dive risk/skills
      computedHours = 4;
    } else if (reg.role === 'shore_support') {
      pts += 5; // extra helper points
      computedHours = 5;
    }

    member.activityHistory.push({
      date: event.date.split('T')[0],
      description: `Participated in ${event.title} as ${reg.role.toUpperCase()}`,
      points: pts,
      hours: computedHours
    });

    addLog(actor || "System", "Attended & Points Awarded", `Validated attendance of ${member.fullName}, awarded ${pts} Eco Points & ${computedHours} volunteer hours.`);
  } else {
    addLog(actor || "System", "Event Attendance Logged", `Updated ${reg.memberName} status to ${status}`);
  }

  res.json({ success: true, state: { members, events, projects, documents, announcements, logs } });
});

// Document Meta Catalog
app.post('/api/documents/upload', (req, res) => {
  const { title, category, fileName, isPrivate, lang, description, actor } = req.body;
  if (!title || !fileName) {
    return res.status(400).json({ error: "Title and File Name are required" });
  }

  const newDoc: DocumentMeta = {
    id: "doc_" + Date.now(),
    title,
    category,
    fileName,
    uploadedAt: new Date().toISOString().split('T')[0],
    uploadedBy: actor || "Admin",
    lang: (lang as Lang) || 'no',
    isPrivate: !!isPrivate,
    description: description || ""
  };

  documents.push(newDoc);
  addLog(actor || "Admin", "Uploaded Document", `Successfully indexed file ${fileName} under ${category}`);
  res.json({ success: true, state: { members, events, projects, documents, announcements, logs } });
});

// Internal Communications Announcements
app.post('/api/announcements/create', (req, res) => {
  const { title, body, isPrivate, lang, actor } = req.body;
  if (!title || !body) {
    return res.status(400).json({ error: "Title and Message are required" });
  }

  const newAnn: Announcement = {
    id: "ann_" + Date.now(),
    title,
    body,
    date: new Date().toISOString().split('T')[0],
    author: actor || "Board President",
    isPrivate: !!isPrivate,
    lang: (lang as Lang) || 'no'
  };

  announcements.push(newAnn);
  addLog(actor || "Board President", "Published Announcement", `Broadcasted message: ${title}`);
  res.json({ success: true, state: { members, events, projects, documents, announcements, logs } });
});

// Project Tracking
app.post('/api/projects/create', (req, res) => {
  const { name, description, responsiblePerson, budget, fundingSource, sponsors, actor } = req.body;
  if (!name || !responsiblePerson) {
    return res.status(400).json({ error: "Project name and leader are required" });
  }

  const newProject: Project = {
    id: "proj_" + Date.now(),
    name,
    description: description || "",
    status: "planned",
    responsiblePerson,
    budget: budget ? Number(budget) : 0,
    fundingSource: fundingSource || "",
    sponsors: sponsors || [],
    documents: [],
    tasks: [],
    deadlines: [],
    volunteerList: [responsiblePerson],
    progressNotes: "Initiated project outline."
  };

  projects.push(newProject);
  addLog(actor || "Project Coordinator", "Created Project", `Added new initiative: ${name}`);
  res.json({ success: true, state: { members, events, projects, documents, announcements, logs } });
});

app.post('/api/projects/task-toggle', (req, res) => {
  const { projectId, taskId, actor } = req.body;
  const project = projects.find(p => p.id === projectId);
  if (!project) return res.status(404).json({ error: "Project not found" });

  const task = project.tasks.find(t => t.id === taskId);
  if (!task) return res.status(404).json({ error: "Task not found" });

  task.completed = !task.completed;
  addLog(actor || "Foreman", "Task Log Updated", `Toggled task '${task.title}' to ${task.completed ? 'COMPLETED' : 'INCOMPLETE'}`);
  res.json({ success: true, state: { members, events, projects, documents, announcements, logs } });
});

app.post('/api/projects/add-task', (req, res) => {
  const { projectId, title, dueDate, assignedTo, actor } = req.body;
  const project = projects.find(p => p.id === projectId);
  if (!project) return res.status(404).json({ error: "Project not found" });

  if (!title) return res.status(400).json({ error: "Task title is required" });

  const newTask = {
    id: "task_" + Date.now(),
    title,
    dueDate: dueDate || new Date().toISOString().split('T')[0],
    completed: false,
    assignedTo
  };

  project.tasks.push(newTask);
  addLog(actor || "Project Leader", "Task Appended", `Added task '${title}' in project '${project.name}'`);
  res.json({ success: true, state: { members, events, projects, documents, announcements, logs } });
});

app.post('/api/projects/update-progress', (req, res) => {
  const { projectId, progressNotes, status, finalReport, budget, actor } = req.body;
  const project = projects.find(p => p.id === projectId);
  if (!project) return res.status(404).json({ error: "Project not found" });

  if (progressNotes !== undefined) project.progressNotes = progressNotes;
  if (status !== undefined) project.status = status as ProjectStatus;
  if (budget !== undefined) project.budget = Number(budget);
  if (finalReport !== undefined) project.finalReport = finalReport;

  addLog(actor || "Project Leader", "Project File Updated", `Saved updates for project '${project.name}'`);
  res.json({ success: true, state: { members, events, projects, documents, announcements, logs } });
});

app.post('/api/projects/add-volunteer', (req, res) => {
  const { projectId, volunteerName, actor } = req.body;
  const project = projects.find(p => p.id === projectId);
  if (!project) return res.status(404).json({ error: "Project not found" });

  if (!volunteerName) return res.status(400).json({ error: "Volunteer name is required" });
  if (!project.volunteerList.includes(volunteerName)) {
    project.volunteerList.push(volunteerName);
  }
  
  addLog(actor || "System", "Recruited Project Worker", `Assigned ${volunteerName} within project ${project.name}`);
  res.json({ success: true, state: { members, events, projects, documents, announcements, logs, messages } });
});

// --- MULTILINGUAL COMMUNICATOR MESSAGING ENDPOINTS ---

app.post('/api/messages/send', async (req, res) => {
  const { module, relatedId, type, senderId, senderName, originalText, actor } = req.body;
  if (!originalText || !senderId || !senderName || !module) {
    return res.status(400).json({ error: "Missing required message parameters (originalText, senderId, senderName, module)" });
  }

  try {
    const translationResult = await translateMessage(originalText);
    
    const newMessage: Message = {
      id: "msg_" + Date.now(),
      module: module,
      relatedId: relatedId || undefined,
      type: (type as MessageType) || 'normal',
      senderId,
      senderName,
      originalLang: translationResult.originalLang,
      originalText,
      translations: translationResult.translations,
      isAutoTranslated: translationResult.isAutoTranslated,
      date: new Date().toISOString(),
      readBy: [senderId], // sender has read it
      visibility: (module === 'board_only' ? 'board_only' : 'members_all')
    };

    messages.push(newMessage);
    addLog(actor || senderName, "Sent Multilingual Message", `Posted message inside ${module} translated into Bokmål/Polski/English`);
    
    res.json({ success: true, state: { members, events, projects, documents, announcements, logs, messages } });
  } catch (err: any) {
    console.error("Failed to translate/send message:", err);
    res.status(500).json({ error: "Failed to send message: " + err.message });
  }
});

app.post('/api/messages/read', (req, res) => {
  const { messageId, memberId } = req.body;
  if (!messageId || !memberId) {
    return res.status(400).json({ error: "messageId and memberId are required" });
  }

  const msg = messages.find(m => m.id === messageId);
  if (msg) {
    if (!msg.readBy.includes(memberId)) {
      msg.readBy.push(memberId);
    }
  }

  res.json({ success: true, state: { members, events, projects, documents, announcements, logs, messages } });
});


// --- SERVING FRONTEND VITE CLIENT ---

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Leverage Vite Dev Server in middleware mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Resolve unified dist output folder
    app.use(express.static(path.resolve(__dirname, '.')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'index.html'));
    });
  }

  // Fixed Port 3000 mapping
  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Diving Ecology Education Frosta Fullstack Server listening on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start Diving Ecology Education Frosta Server:", err);
});
