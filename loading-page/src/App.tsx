import { useState, useEffect } from 'react';
import { DashboardOverview } from './components/DashboardOverview';
import { CriminalDossierView } from './components/CriminalDossierView';
import { CitationRankingView } from './components/CitationRankingView';
import { JudicialReviewView } from './components/JudicialReviewView';
import { PrecedentTaxonomyView } from './components/PrecedentTaxonomyView';
import { IncidentManagementView } from './components/IncidentManagementView';
import { ChargeSheetManagementView } from './components/ChargeSheetManagementView';
import { CitationManagementView } from './components/CitationManagementView';
import {
  IconLayoutDashboard,
  IconFileText,
  IconAward,
  IconScale,
  IconTag,
  IconBriefcase,
  IconMapPin,
  IconCheckCircle,
  IconAlertCircle,
  IconRefresh,
} from './components/Icons';
import { api, HealthResponse } from './api';

const particles = [
  { x: '20%', y: '26%', delay: '0.4s', duration: '4.2s' },
  { x: '27%', y: '67%', delay: '0.8s', duration: '5.1s' },
  { x: '35%', y: '34%', delay: '1.2s', duration: '4.4s' },
  { x: '43%', y: '73%', delay: '0.6s', duration: '4.7s' },
  { x: '54%', y: '20%', delay: '1.0s', duration: '5.0s' },
  { x: '61%', y: '64%', delay: '1.4s', duration: '4.5s' },
  { x: '69%', y: '31%', delay: '0.9s', duration: '5.2s' },
  { x: '77%', y: '59%', delay: '1.5s', duration: '4.8s' },
];

function JudicialMark() {
  return (
    <div className="judicial-mark" aria-hidden="true">
      <div className="mark-aura" />
      <svg viewBox="0 0 620 350" role="presentation">
        <defs>
          <linearGradient id="goldStroke" x1="70" y1="30" x2="550" y2="325">
            <stop stopColor="#f1e6c6" />
            <stop offset=".43" stopColor="#bda36d" />
            <stop offset="1" stopColor="#786340" />
          </linearGradient>
          <linearGradient id="stoneFill" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#d9ccb0" stopOpacity=".2" />
            <stop offset="1" stopColor="#7d6d4e" stopOpacity=".04" />
          </linearGradient>
          <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="buildingClip">
            <path d="M75 300h470v22H75zM106 275h408v18H106zM123 135h374v14H123zM103 127 310 38l207 89z" />
          </clipPath>
        </defs>

        <g className="structure-fill">
          <path d="M103 127 310 38l207 89z" fill="url(#stoneFill)" />
          <path d="M123 149h374v126H123z" fill="url(#stoneFill)" opacity=".38" />
          <path d="M106 275h408v18H106zM75 300h470v22H75z" fill="url(#stoneFill)" />
        </g>

        <g className="draw-lines" fill="none" stroke="url(#goldStroke)" strokeLinecap="round" strokeLinejoin="round">
          <path className="draw draw-1" d="M103 127 310 38l207 89H103Z" />
          <path className="draw draw-2" d="M132 116h356M123 135h374M123 149h374" />
          <path className="draw draw-3" d="M106 275H514V293H106ZM75 300V322H545V300H75M75 300H159" />
          <path className="draw draw-4" d="M151 158v108M181 158v108M143 158h46M140 269h52" />
          <path className="draw draw-5" d="M238 158v108M268 158v108M230 158h46M227 269h52" />
          <path className="draw draw-6" d="M352 158v108M382 158v108M344 158h46M341 269h52" />
          <path className="draw draw-7" d="M439 158v108M469 158v108M431 158h46M428 269h52" />
          <path className="draw draw-8" d="M145 104 310 53l165 51M278 94h64" />
        </g>

        <g className="scales" fill="none" stroke="url(#goldStroke)" strokeLinecap="round" strokeLinejoin="round" filter="url(#softGlow)">
          <path className="draw scale-draw-1" d="M310 86v129M275 228h70M289 215h42" />
          <path className="draw scale-draw-2" d="M232 119H388M310 103c-7 0-13 6-13 13s6 13 13 13 13-6 13-13-6-13-13-13Z" />
          <path className="draw scale-draw-3" d="M310 120L232 188M310 120L388 188" />
          <path className="draw scale-draw-4" d="M197 188c4 18 17 27 35 27s31-9 35-27h-70ZM353 188c4 18 17 27 35 27s31-9 35-27h-70Z" />
          <circle className="scale-joint" cx="310" cy="116" r="4.5" fill="#d2bd8b" stroke="none" />
        </g>

        <g className="pediment-detail" fill="none" stroke="#c9b27e" strokeWidth=".7" opacity=".5">
          <path d="M285 112h50M294 104h32M302 96h16M310 69v17M301 78h18" />
        </g>

        <g className="mark-sweep" clipPath="url(#buildingClip)">
          <rect x="-180" y="20" width="80" height="330" fill="url(#sweepGradient)" transform="skewX(-16)" />
        </g>
        <defs>
          <linearGradient id="sweepGradient" x1="0" x2="1">
            <stop stopColor="#fff" stopOpacity="0" />
            <stop offset=".5" stopColor="#fff8e2" stopOpacity=".5" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Splash() {
  return (
    <section className="splash" aria-label="Initializing judicial management system" role="status">
      <div className="ambient-light" />
      <div className="architectural-grid" />
      <div className="columns-bg" />

      <svg className="case-connections" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
        <g fill="none" stroke="currentColor">
          <path d="M90 218h190l75 74h178M980 182h224l96 96h86M113 694h208l79-76h164M902 682h174l70-68h215" />
          <path d="M214 115v92M1240 280v116M300 699v91M1090 592v91" />
        </g>
        <g fill="currentColor">
          <circle cx="90" cy="218" r="2" /><circle cx="355" cy="292" r="2" />
          <circle cx="980" cy="182" r="2" /><circle cx="1300" cy="278" r="2" />
          <circle cx="113" cy="694" r="2" /><circle cx="400" cy="618" r="2" />
          <circle cx="902" cy="682" r="2" /><circle cx="1146" cy="614" r="2" />
        </g>
      </svg>

      <div className="document-ghost document-left">
        <i /><i /><i /><i />
      </div>
      <div className="document-ghost document-right">
        <i /><i /><i /><i />
      </div>

      <div className="particles" aria-hidden="true">
        {particles.map((particle, index) => (
          <span
            key={index}
            style={{
              left: particle.x,
              top: particle.y,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>

      <main className="splash-content">
        <JudicialMark />
        <div className="title-lockup">
          <div className="title-rule" />
          <h1>
            <span>Judicial Case Management</span>
            <span>and Precedent System</span>
          </h1>
          <p>Adjudication Registry <b>•</b> Precedent Citations <b>•</b> Statutory Compliance</p>
          <div className="loading-block">
            <span className="loading-context" aria-live="polite">
              Loading Case Management Registry...
            </span>
            <div className="progress-track"><span /></div>
          </div>
        </div>
      </main>
    </section>
  );
}

export type TabType =
  | 'overview'
  | 'dossier'
  | 'citations'
  | 'judicial-review'
  | 'taxonomy'
  | 'incidents'
  | 'charge-sheets'
  | 'citations-crud';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [backendHealth, setBackendHealth] = useState<HealthResponse | null>(null);
  const [checkingBackend, setCheckingBackend] = useState(true);

  // Automatic loading sequence transition
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const transitionDelay = prefersReducedMotion ? 350 : 2500;
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, transitionDelay);

    return () => clearTimeout(timer);
  }, []);

  // Proactive background health check (independent of splash transition)
  useEffect(() => {
    api
      .checkHealth()
      .then((data) => setBackendHealth(data))
      .catch(() => setBackendHealth(null))
      .finally(() => setCheckingBackend(false));
  }, []);

  if (showSplash) {
    return (
      <div className="app-shell">
        <Splash />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090b0e] text-[#eee9dc] font-sans flex flex-col antialiased">
      {/* Top Header */}
      <header className="border-b border-[#1b1f28] bg-[#0c0f14]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#131720] border border-[#7d6d4e]/60 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
              <img
                src="/logo.png"
                alt="Judicial Case Management System Logo"
                className="w-full h-full object-contain p-0.5"
              />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-wide text-[#f1e6c6]">
                Judicial Case Management & Precedent System
              </h1>
              <p className="text-[10px] text-[#8c887d]">
                High Court & Trial Bench Registry • Member 3 Module (Tejas)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* Backend Connectivity Status Indicator */}
            <div
              className="flex items-center gap-2 bg-[#12161f] border border-[#212735] px-3 py-1.5 rounded-full"
              title={
                backendHealth?.status === 'UP'
                  ? 'Database connection active'
                  : 'Backend service unreachable'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  checkingBackend
                    ? 'bg-amber-400 animate-pulse'
                    : backendHealth?.status === 'UP'
                    ? 'bg-emerald-400'
                    : 'bg-rose-500'
                }`}
              />
              <span className="text-[#a39e93] text-[11px] font-medium">
                {checkingBackend
                  ? 'Checking API...'
                  : backendHealth?.status === 'UP'
                  ? 'Registry Online'
                  : 'Backend Offline'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <nav className="w-full md:w-64 shrink-0 space-y-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#736f66] px-3 mb-2">
            Main Navigation
          </div>

          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#181d28] text-[#f1e6c6] border border-[#7d6d4e] shadow-sm'
                : 'text-[#a39e93] hover:bg-[#12151c] hover:text-[#eee9dc]'
            }`}
          >
            <IconLayoutDashboard className="w-4 h-4 text-[#d2bd8b]" />
            <span>Executive Overview</span>
          </button>

          <div className="pt-3 mt-3 border-t border-[#1a1e27]">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#736f66] px-3 mb-2">
              Analytical Workflows
            </div>

            <button
              onClick={() => setActiveTab('dossier')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition flex items-center gap-2.5 cursor-pointer ${
                activeTab === 'dossier'
                  ? 'bg-[#181d28] text-[#f1e6c6] border border-[#7d6d4e] shadow-sm'
                  : 'text-[#a39e93] hover:bg-[#12151c] hover:text-[#eee9dc]'
              }`}
            >
              <IconFileText className="w-4 h-4 text-[#d2bd8b]" />
              <span>Criminal Case Dossier</span>
            </button>

            <button
              onClick={() => setActiveTab('citations')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition flex items-center gap-2.5 cursor-pointer ${
                activeTab === 'citations'
                  ? 'bg-[#181d28] text-[#f1e6c6] border border-[#7d6d4e] shadow-sm'
                  : 'text-[#a39e93] hover:bg-[#12151c] hover:text-[#eee9dc]'
              }`}
            >
              <IconAward className="w-4 h-4 text-[#d2bd8b]" />
              <span>Citation Ranking</span>
            </button>

            <button
              onClick={() => setActiveTab('judicial-review')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition flex items-center gap-2.5 cursor-pointer ${
                activeTab === 'judicial-review'
                  ? 'bg-[#181d28] text-[#f1e6c6] border border-[#7d6d4e] shadow-sm'
                  : 'text-[#a39e93] hover:bg-[#12151c] hover:text-[#eee9dc]'
              }`}
            >
              <IconScale className="w-4 h-4 text-[#d2bd8b]" />
              <span>Judicial Review</span>
            </button>

            <button
              onClick={() => setActiveTab('taxonomy')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition flex items-center gap-2.5 cursor-pointer ${
                activeTab === 'taxonomy'
                  ? 'bg-[#181d28] text-[#f1e6c6] border border-[#7d6d4e] shadow-sm'
                  : 'text-[#a39e93] hover:bg-[#12151c] hover:text-[#eee9dc]'
              }`}
            >
              <IconTag className="w-4 h-4 text-[#d2bd8b]" />
              <span>Precedent Taxonomy</span>
            </button>
          </div>

          {/* Registry Management (CRUD) */}
          <div className="pt-3 mt-3 border-t border-[#1a1e27]">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#d2bd8b] px-3 mb-2 flex items-center justify-between">
              <span>Case Registries</span>
              <span className="text-[9px] bg-[#1d222e] border border-[#7d6d4e]/60 px-1.5 py-0.5 rounded text-[#f1e6c6]">
                CRUD
              </span>
            </div>

            <button
              onClick={() => setActiveTab('charge-sheets')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition flex items-center gap-2.5 cursor-pointer ${
                activeTab === 'charge-sheets'
                  ? 'bg-[#181d28] text-[#f1e6c6] border border-[#7d6d4e] shadow-sm'
                  : 'text-[#a39e93] hover:bg-[#12151c] hover:text-[#eee9dc]'
              }`}
            >
              <IconBriefcase className="w-4 h-4 text-[#d2bd8b]" />
              <span>Docket Charge Sheets</span>
            </button>

            <button
              onClick={() => setActiveTab('incidents')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition flex items-center gap-2.5 cursor-pointer ${
                activeTab === 'incidents'
                  ? 'bg-[#181d28] text-[#f1e6c6] border border-[#7d6d4e] shadow-sm'
                  : 'text-[#a39e93] hover:bg-[#12151c] hover:text-[#eee9dc]'
              }`}
            >
              <IconMapPin className="w-4 h-4 text-[#d2bd8b]" />
              <span>Incident Registry</span>
            </button>

            <button
              onClick={() => setActiveTab('citations-crud')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition flex items-center gap-2.5 cursor-pointer ${
                activeTab === 'citations-crud'
                  ? 'bg-[#181d28] text-[#f1e6c6] border border-[#7d6d4e] shadow-sm'
                  : 'text-[#a39e93] hover:bg-[#12151c] hover:text-[#eee9dc]'
              }`}
            >
              <IconScale className="w-4 h-4 text-[#d2bd8b]" />
              <span>Judgment Citations</span>
            </button>
          </div>
        </nav>

        {/* Main Workspace Area */}
        <main className="flex-1 min-w-0 bg-[#0c0e13] border border-[#1d222e] rounded-2xl p-6 shadow-xl">
          {activeTab === 'overview' && <DashboardOverview onNavigate={setActiveTab} />}
          {activeTab === 'dossier' && <CriminalDossierView />}
          {activeTab === 'citations' && <CitationRankingView />}
          {activeTab === 'judicial-review' && <JudicialReviewView />}
          {activeTab === 'taxonomy' && <PrecedentTaxonomyView />}
          {activeTab === 'incidents' && <IncidentManagementView />}
          {activeTab === 'charge-sheets' && <ChargeSheetManagementView />}
          {activeTab === 'citations-crud' && <CitationManagementView />}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1a1e27] py-4 text-center text-[11px] text-[#6b675e]">
        Judicial Case Management and Precedent System • High Court & Trial Bench Registry • Member 3 Module (Tejas)
      </footer>
    </div>
  );
}
