import {
  Users, Calendar, DollarSign, FileText, Layers, Volume2, Mail,
  Shield, Search, Plus, Activity, TrendingUp, BarChart2, Clock,
  RefreshCw, CheckCircle2, X, Trash2, Lock, FileSpreadsheet,
  MessageSquare, Bell, Settings, CreditCard, Tag
} from 'lucide-react';
import { Lang } from '../types';
import { translations } from '../translations';
import { ASSOC_SETTINGS } from '../App';


export interface PrivacyPolicyViewProps {
  state: any;
  lang: Lang;
  role: string;
  activePersona: string;
  setActiveTab: (tab: string) => void;

}

export default function PrivacyPolicyView(props: PrivacyPolicyViewProps) {
  const { state, lang, role, activePersona, setActiveTab } = props;
  const t = translations[lang] || translations.no;
  
  return (
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
  );
}