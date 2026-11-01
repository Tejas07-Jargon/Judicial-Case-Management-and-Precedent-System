import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Scale,
  Database,
  Search,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Gavel,
  FileText,
  Users,
  BookOpen,
  Trash2,
  Edit3,
  Filter,
  Download,
  Clock,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  X,
  RefreshCw
} from 'lucide-react';

// ==========================================================================
// SPLASH INTRO (CLEAN & MINIMAL WITH ESC SHORTCUT)
// ==========================================================================
const particles = [
  { x: "20%", y: "26%", delay: "1.4s", duration: "7.2s" },
  { x: "27%", y: "67%", delay: "2.1s", duration: "8.4s" },
  { x: "35%", y: "34%", delay: "3.4s", duration: "6.8s" },
  { x: "43%", y: "73%", delay: "1.8s", duration: "7.7s" },
  { x: "54%", y: "20%", delay: "2.8s", duration: "8.1s" },
  { x: "61%", y: "64%", delay: "3.7s", duration: "7.1s" },
  { x: "69%", y: "31%", delay: "2.3s", duration: "8.8s" },
  { x: "77%", y: "59%", delay: "4.1s", duration: "7.4s" },
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

function Splash({ onComplete }: { onComplete: () => void }) {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(onComplete, 280);
  };

  useEffect(() => {
    const timer = setTimeout(handleDismiss, 10000);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <section
      className={`splash ${isExiting ? 'is-exiting' : ''}`}
      aria-label="Application loading"
      onClick={handleDismiss}
      style={{ cursor: 'pointer' }}
    >
      <button
        className="splash-skip-btn"
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss();
        }}
      >
        <span>Skip Intro [Esc]</span>
        <ChevronRight size={16} />
      </button>

      <div className="ambient-light" />
      <div className="architectural-grid" />
      <div className="columns-bg" />

      <svg className="case-connections" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
        <path d="M 120 780 C 340 700, 280 480, 520 410 S 760 520, 940 330 S 1220 280, 1340 180" fill="none" stroke="currentColor" />
        <path d="M 160 220 C 320 280, 420 180, 680 260 S 980 180, 1160 380 S 1280 620, 1380 720" fill="none" stroke="currentColor" />
      </svg>

      <div className="document-ghost document-left" aria-hidden="true"><i /><i /><i /><i /></div>
      <div className="document-ghost document-right" aria-hidden="true"><i /><i /><i /><i /></div>

      <div className="particles" aria-hidden="true">
        {particles.map((p, idx) => (
          <span key={idx} style={{ left: p.x, top: p.y, animationDelay: p.delay, animationDuration: p.duration }} />
        ))}
      </div>

      <main className="splash-content">
        <JudicialMark />
        <div className="title-lockup">
          <div className="title-rule" />
          <h1>
            <span>Judicial Case Management</span>
            <span>&amp; Precedent System</span>
          </h1>
          <p>Cases <b>•</b> Judgments <b>•</b> Appeals <b>•</b> Precedents</p>
          <div className="loading-block">
            <span className="loading-context">Initializing Legal Database Engine</span>
            <div className="progress-track"><span /></div>
          </div>
        </div>
      </main>
    </section>
  );
}

// ==========================================================================
// NAVIGATION HEADER
// ==========================================================================
function Navigation({
  currentView,
  setView,
  onReplaySplash
}: {
  currentView: string;
  setView: (v: string) => void;
  onReplaySplash: () => void;
}) {
  return (
    <header className="site-nav">
      <div className="site-nav-left" onClick={() => setView('menu')}>
        <div className="nav-emblem">
          <Scale size={20} />
        </div>
        <h1 className="nav-title">Judicial Nexus</h1>
      </div>

      <nav className="nav-links">
        <button
          className={`nav-tab-btn ${currentView === 'menu' ? 'is-active' : ''}`}
          onClick={() => setView('menu')}
        >
          Overview
        </button>
        <button
          className={`nav-tab-btn ${currentView === 'add' ? 'is-active' : ''}`}
          onClick={() => setView('add')}
        >
          Record Management
        </button>
        <button
          className={`nav-tab-btn ${currentView === 'fetch' ? 'is-active' : ''}`}
          onClick={() => setView('fetch')}
        >
          Query Explorer
        </button>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          className="btn-ghost"
          onClick={onReplaySplash}
          title="Replay intro animation"
        >
          <RefreshCw size={14} /> Intro
        </button>
        <div className="nav-status-badge">
          <span className="pulse-dot" />
          <span>MySQL 8.0 Live</span>
        </div>
      </div>
    </header>
  );
}

// ==========================================================================
// MAIN MENU / MINIMAL OVERVIEW HUB
// ==========================================================================
function MainMenu({ setView }: { setView: (v: string) => void }) {
  return (
    <div className="main-container view-entrance">
      <div className="header-hero">
        <h2 className="hero-title">Judicial Case Management System</h2>
        <p className="hero-subtitle">
          Manage court proceedings, case histories, legal precedents, and judicial analytics.
        </p>
      </div>

      <div className="module-cards-grid">
        {/* Module 1: Record Management */}
        <div className="module-card" onClick={() => setView('add')}>
          <div>
            <div className="card-header-icon">
              <Database size={26} />
            </div>
            <h3 className="card-title">Record Management</h3>
            <p className="card-desc">
              File new criminal and civil cases, schedule court hearings, assign legal counsel,
              and record final judgments.
            </p>
          </div>
          <div className="card-action-cue">
            <span>Open Console</span>
            <ChevronRight size={18} />
          </div>
        </div>

        {/* Module 2: Query Analytics */}
        <div className="module-card" onClick={() => setView('fetch')}>
          <div>
            <div className="card-header-icon">
              <Search size={26} />
            </div>
            <h3 className="card-title">Query Explorer</h3>
            <p className="card-desc">
              Run analytical queries Q1 to Q15 across court dockets, appellate lineages,
              lawyer rosters, and case statistics.
            </p>
          </div>
          <div className="card-action-cue">
            <span>Explore Queries</span>
            <ChevronRight size={18} />
          </div>
        </div>
      </div>

      <div className="overview-footer-bar">
        <span>19 Relational Tables</span>
        <span className="dot">•</span>
        <span>15 Analytical Queries</span>
        <span className="dot">•</span>
        <span>MySQL 8.0</span>
      </div>
    </div>
  );
}

// ==========================================================================
// RECORD MANAGEMENT CONSOLE
// ==========================================================================
type WorkflowType =
  | 'criminal'
  | 'civil'
  | 'hearing'
  | 'judgment'
  | 'counsel'
  | 'cite'
  | 'update'
  | 'delete'
  | 'cancel_hearing'
  | 'withdraw_counsel'
  | 'drop_charge'
  | 'strike_precedent';

interface WorkflowMeta {
  title: string;
  category: string;
  icon: React.ReactNode;
  procedure: string;
  samples: Record<string, string>;
}

const WORKFLOW_METAS: Record<WorkflowType, WorkflowMeta> = {
  criminal: {
    title: 'Register Criminal Case',
    category: 'Filings',
    icon: <ShieldAlert size={16} />,
    procedure: 'CALL Register_Criminal_Case(case_id, court_id, NULL, date, fir, bail, agency)',
    samples: {
      case_id: 'CASE_9101',
      court_id: 'CRT_DC_DEL',
      title: 'State vs. Vikram Rao & Ors',
      date: '2026-03-15',
      fir: 'FIR-2026-DEL-0941',
      bail: '150000',
      agency: 'Delhi Special Cell'
    }
  },
  civil: {
    title: 'Register Civil Case',
    category: 'Filings',
    icon: <FileText size={16} />,
    procedure: 'CALL Register_Civil_Case(case_id, court_id, title, filing_date, claim_amount, dispute_category)',
    samples: {
      case_id: 'CASE_9201',
      court_id: 'CRT_HC_MUM',
      title: 'Verma Infrastructure vs. Apex Buildcon',
      filing_date: '2026-02-10',
      claim_amount: '8500000',
      dispute_category: 'Commercial Contract Breach'
    }
  },
  hearing: {
    title: 'Schedule Hearing',
    category: 'Proceedings',
    icon: <Gavel size={16} />,
    procedure: 'CALL Schedule_Hearing_Session(bench_id, case_id, timestamp, notes, judge_id)',
    samples: {
      bench_id: 'HRG_9501',
      case_id: 'CASE_1001',
      hearing_timestamp: '2026-11-20T10:30',
      summary_notes: 'Courtroom 3A - Preliminary Arguments & Evidence Review',
      judge_id: 'JDG_001'
    }
  },
  judgment: {
    title: 'Record Verdict',
    category: 'Proceedings',
    icon: <CheckCircle2 size={16} />,
    procedure: 'CALL Record_Final_Judgment(judgment_id, case_id, verdict_date, judgment_text)',
    samples: {
      judgment_id: 'JMT_9901',
      case_id: 'CASE_1001',
      verdict_date: '2026-12-05',
      judgment_text: 'The Court finds the accused guilty on charge counts 1 & 2. Sentenced to 3 years imprisonment.'
    }
  },
  counsel: {
    title: 'Assign Counsel',
    category: 'Relations',
    icon: <Users size={16} />,
    procedure: 'CALL Assign_Counsel_To_Party(counsel_id, lawyer_id, party_id, is_lead)',
    samples: {
      counsel_id: 'CNSL_9401',
      lawyer_id: 'ENT_004',
      party_id: 'PRT_02',
      is_lead: 'true'
    }
  },
  cite: {
    title: 'Cite Precedent',
    category: 'Relations',
    icon: <BookOpen size={16} />,
    procedure: 'INSERT INTO CASE_CITATION (citation_id, citing_case, cited_case, note)',
    samples: {
      citation_id: 'CIT_9601',
      citing_case: 'CASE_1001',
      cited_case: 'CASE_1002',
      note: 'Applied strict evidentiary burden standard per precedent'
    }
  },
  update: {
    title: 'Update Case Title',
    category: 'Maintenance',
    icon: <Edit3 size={16} />,
    procedure: 'UPDATE `CASE` SET Title = ? WHERE Case_ID = ?',
    samples: {
      case_id: 'CASE_1001',
      new_title: 'State vs. Rajesh Sharma (Amended Title)'
    }
  },
  delete: {
    title: 'Withdraw Case',
    category: 'Maintenance',
    icon: <Trash2 size={16} />,
    procedure: 'DELETE FROM `CASE` WHERE Case_ID = ? (CASCADE ALL)',
    samples: {
      case_id: 'CASE_9101'
    }
  },
  cancel_hearing: {
    title: 'Cancel Hearing',
    category: 'Maintenance',
    icon: <Trash2 size={16} />,
    procedure: 'DELETE FROM HEARING WHERE Case_ID = ? AND Hearing_Timestamp = ?',
    samples: {
      case_id: 'CASE_1001',
      hearing_timestamp: '2026-11-20T10:30'
    }
  },
  withdraw_counsel: {
    title: 'Withdraw Counsel',
    category: 'Maintenance',
    icon: <Trash2 size={16} />,
    procedure: 'DELETE FROM CASE_COUNSEL WHERE Counsel_ID = ?',
    samples: {
      counsel_id: 'CNSL_01'
    }
  },
  drop_charge: {
    title: 'Drop Charge Sheet',
    category: 'Maintenance',
    icon: <Trash2 size={16} />,
    procedure: 'DELETE FROM DOCKET_CHARGE_SHEET WHERE Charge_Sheet_ID = ?',
    samples: {
      charge_sheet_id: 'CHG_01'
    }
  },
  strike_precedent: {
    title: 'Strike Precedent',
    category: 'Maintenance',
    icon: <Trash2 size={16} />,
    procedure: 'DELETE FROM CASE_CITATION WHERE Citation_ID = ?',
    samples: {
      citation_id: 'CIT_01'
    }
  }
};

function AddRecord({ setView }: { setView: (v: string) => void }) {
  const [workflow, setWorkflow] = useState<WorkflowType>('criminal');
  const [status, setStatus] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const meta = WORKFLOW_METAS[workflow];

  const handleFillSample = () => {
    if (!formRef.current) return;
    const sample = meta.samples;
    for (const [key, value] of Object.entries(sample)) {
      const field = formRef.current.elements.namedItem(key) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
      if (field) {
        field.value = value;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const endpointMap: Record<WorkflowType, { url: string; method: string }> = {
      criminal: { url: 'http://localhost:3000/api/cases/register', method: 'POST' },
      civil: { url: 'http://localhost:3000/api/cases/civil/register', method: 'POST' },
      hearing: { url: 'http://localhost:3000/api/hearings/schedule', method: 'POST' },
      judgment: { url: 'http://localhost:3000/api/judgments/record', method: 'POST' },
      update: { url: 'http://localhost:3000/api/cases/update', method: 'PUT' },
      delete: { url: 'http://localhost:3000/api/cases/delete', method: 'DELETE' },
      counsel: { url: 'http://localhost:3000/api/counsel/assign', method: 'POST' },
      cite: { url: 'http://localhost:3000/api/cases/cite', method: 'POST' },
      cancel_hearing: { url: 'http://localhost:3000/api/hearings/cancel', method: 'DELETE' },
      withdraw_counsel: { url: 'http://localhost:3000/api/counsel/withdraw', method: 'DELETE' },
      drop_charge: { url: 'http://localhost:3000/api/charges/drop', method: 'DELETE' },
      strike_precedent: { url: 'http://localhost:3000/api/citations/strike', method: 'DELETE' }
    };

    try {
      const { url, method } = endpointMap[workflow];
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Operation failed');
      setStatus({ type: 'success', msg: data.message || 'Transaction executed successfully.' });
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Filings', 'Proceedings', 'Relations', 'Maintenance'];

  return (
    <div className="main-container view-entrance">
      <div style={{ width: '100%', maxWidth: '860px', display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button className="btn-outline" onClick={() => setView('menu')}>
          <ArrowLeft size={16} /> Back to Overview
        </button>
      </div>

      <div className="glass-panel" style={{ maxWidth: '860px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '26px', fontFamily: '"Cormorant Garamond", serif', color: '#eee9dc' }}>
              Record Management
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '14.5px', color: 'rgba(238,233,220,0.65)' }}>
              Execute stored procedures and update case proceedings
            </p>
          </div>
          <button type="button" className="autofill-btn" onClick={handleFillSample}>
            <Sparkles size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
            Fill Verified Sample
          </button>
        </div>

        {status?.type === 'error' && (
          <div className="banner-error">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={20} />
              <span>{status.msg}</span>
            </div>
            <button className="btn-ghost" onClick={() => setStatus(null)} style={{ padding: '2px' }}>
              <X size={16} />
            </button>
          </div>
        )}
        {status?.type === 'success' && (
          <div className="banner-success">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={20} />
              <span>{status.msg}</span>
            </div>
            <button className="btn-ghost" onClick={() => setStatus(null)} style={{ padding: '2px' }}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Workflow Categorized Navigation */}
        <div className="workflow-nav-bar">
          {categories.map((cat) => (
            <div key={cat} className="workflow-category-row">
              <span className="category-tag">{cat}</span>
              <div className="workflow-pills-wrap">
                {(Object.keys(WORKFLOW_METAS) as WorkflowType[])
                  .filter((w) => WORKFLOW_METAS[w].category === cat)
                  .map((w) => (
                    <button
                      key={w}
                      type="button"
                      className={`workflow-tab-pill ${workflow === w ? 'is-active' : ''}`}
                      onClick={() => {
                        setWorkflow(w);
                        setStatus(null);
                      }}
                    >
                      {WORKFLOW_METAS[w].icon}
                      <span>{WORKFLOW_METAS[w].title}</span>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Procedure Metadata Badge */}
        <div className="procedure-badge">
          <span>Target Routine:</span>
          <code>{meta.procedure}</code>
        </div>

        {/* Form Container */}
        <form key={workflow} ref={formRef} onSubmit={handleSubmit} className="form-swap-box">
          <div className="form-grid">
            {/* Criminal Filings */}
            {workflow === 'criminal' && (
              <>
                <div className="input-group">
                  <label>Case ID</label>
                  <input name="case_id" className="input-field" required placeholder="e.g. CASE_5001" />
                </div>
                <div className="input-group">
                  <label>Court ID</label>
                  <input name="court_id" className="input-field" required placeholder="e.g. CRT_DC_DEL" />
                </div>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Case Title</label>
                  <input name="title" className="input-field" required placeholder="State vs. Defendant Name" />
                </div>
                <div className="input-group">
                  <label>Filing Date</label>
                  <input name="date" type="date" className="input-field" required />
                </div>
                <div className="input-group">
                  <label>FIR Number</label>
                  <input name="fir" className="input-field" required placeholder="e.g. FIR-2026-DEL-104" />
                </div>
                <div className="input-group">
                  <label>Bail Amount (₹)</label>
                  <input name="bail" type="number" step="0.01" min="0" className="input-field" required placeholder="e.g. 50000" />
                </div>
                <div className="input-group">
                  <label>Arresting Agency</label>
                  <input name="agency" className="input-field" required placeholder="e.g. CBI / State Police" />
                </div>
              </>
            )}

            {/* Civil Filings */}
            {workflow === 'civil' && (
              <>
                <div className="input-group">
                  <label>Case ID</label>
                  <input name="case_id" className="input-field" required placeholder="e.g. CASE_5002" />
                </div>
                <div className="input-group">
                  <label>Court ID</label>
                  <input name="court_id" className="input-field" required placeholder="e.g. CRT_HC_MUM" />
                </div>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Case Title</label>
                  <input name="title" className="input-field" required placeholder="Plaintiff Corp vs. Defendant Ltd" />
                </div>
                <div className="input-group">
                  <label>Filing Date</label>
                  <input name="filing_date" type="date" className="input-field" required />
                </div>
                <div className="input-group">
                  <label>Claim Amount (₹)</label>
                  <input name="claim_amount" type="number" step="0.01" min="0" className="input-field" required placeholder="e.g. 1000000" />
                </div>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Dispute Category</label>
                  <input name="dispute_category" className="input-field" required placeholder="e.g. Commercial Contract Breach" />
                </div>
              </>
            )}

            {/* Hearing Scheduling */}
            {workflow === 'hearing' && (
              <>
                <div className="input-group">
                  <label>Bench / Hearing ID</label>
                  <input name="bench_id" className="input-field" required placeholder="e.g. HRG_9001" />
                </div>
                <div className="input-group">
                  <label>Target Case ID</label>
                  <input name="case_id" className="input-field" required placeholder="e.g. CASE_1001" />
                </div>
                <div className="input-group">
                  <label>Hearing Timestamp</label>
                  <input name="hearing_timestamp" type="datetime-local" className="input-field" required />
                </div>
                <div className="input-group">
                  <label>Presiding Judge ID</label>
                  <input name="judge_id" className="input-field" required placeholder="e.g. JDG_001" />
                </div>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Summary Notes / Room</label>
                  <input name="summary_notes" className="input-field" required placeholder="e.g. Courtroom 4B - Final Arguments" />
                </div>
              </>
            )}

            {/* Judgment Recording */}
            {workflow === 'judgment' && (
              <>
                <div className="input-group">
                  <label>Judgment ID</label>
                  <input name="judgment_id" className="input-field" required placeholder="e.g. JMT_5001" />
                </div>
                <div className="input-group">
                  <label>Target Case ID</label>
                  <input name="case_id" className="input-field" required placeholder="e.g. CASE_1001" />
                </div>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Verdict Date</label>
                  <input name="verdict_date" type="date" className="input-field" required />
                </div>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Judgment Text</label>
                  <textarea
                    name="judgment_text"
                    className="input-field"
                    rows={4}
                    required
                    placeholder="Enter the official verdict, statutory reasoning, and order..."
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>
              </>
            )}

            {/* Counsel Assignment */}
            {workflow === 'counsel' && (
              <>
                <div className="input-group">
                  <label>Assignment ID</label>
                  <input name="counsel_id" className="input-field" required placeholder="e.g. CNSL_9001" />
                </div>
                <div className="input-group">
                  <label>Lawyer Entity ID</label>
                  <input name="lawyer_id" className="input-field" required placeholder="e.g. ENT_004" />
                </div>
                <div className="input-group">
                  <label>Target Party ID</label>
                  <input name="party_id" className="input-field" required placeholder="e.g. PRT_02" />
                </div>
                <div className="input-group">
                  <label>Lead Counsel Role</label>
                  <select name="is_lead" className="input-field" required>
                    <option value="true">Yes - Lead Counsel</option>
                    <option value="false">No - Associate Counsel</option>
                  </select>
                </div>
              </>
            )}

            {/* Precedent Citation */}
            {workflow === 'cite' && (
              <>
                <div className="input-group">
                  <label>Citation ID</label>
                  <input name="citation_id" className="input-field" required placeholder="e.g. CIT_9001" />
                </div>
                <div className="input-group">
                  <label>Active Citing Case ID</label>
                  <input name="citing_case" className="input-field" required placeholder="e.g. CASE_1001" />
                </div>
                <div className="input-group">
                  <label>Historical Cited Case ID</label>
                  <input name="cited_case" className="input-field" required placeholder="e.g. CASE_1002" />
                </div>
                <div className="input-group">
                  <label>Applicability / Standard Note</label>
                  <input name="note" className="input-field" required placeholder="e.g. Precedent for constitutional validity" />
                </div>
              </>
            )}

            {/* Update Case */}
            {workflow === 'update' && (
              <>
                <div className="input-group">
                  <label>Target Case ID</label>
                  <input name="case_id" className="input-field" required placeholder="e.g. CASE_1001" />
                </div>
                <div className="input-group">
                  <label>Revised Case Title</label>
                  <input name="new_title" className="input-field" required placeholder="Enter updated title..." />
                </div>
              </>
            )}

            {/* Delete Case */}
            {workflow === 'delete' && (
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Target Case ID to Delete</label>
                <input name="case_id" className="input-field" required placeholder="e.g. CASE_3001" />
                <p style={{ fontSize: '13px', color: '#f87171', margin: '8px 0 0' }}>
                  Warning: Deleting a case will cascade and remove associated hearings, judgments, and party links.
                </p>
              </div>
            )}

            {/* Cancel Hearing */}
            {workflow === 'cancel_hearing' && (
              <>
                <div className="input-group">
                  <label>Target Case ID</label>
                  <input name="case_id" className="input-field" required placeholder="e.g. CASE_1001" />
                </div>
                <div className="input-group">
                  <label>Exact Hearing Timestamp</label>
                  <input name="hearing_timestamp" type="datetime-local" className="input-field" required />
                </div>
              </>
            )}

            {/* Withdraw Counsel */}
            {workflow === 'withdraw_counsel' && (
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Counsel Assignment ID</label>
                <input name="counsel_id" className="input-field" required placeholder="e.g. CNSL_01" />
              </div>
            )}

            {/* Drop Charge Sheet */}
            {workflow === 'drop_charge' && (
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Charge Sheet ID</label>
                <input name="charge_sheet_id" className="input-field" required placeholder="e.g. CHG_01" />
              </div>
            )}

            {/* Strike Precedent */}
            {workflow === 'strike_precedent' && (
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Citation ID</label>
                <input name="citation_id" className="input-field" required placeholder="e.g. CIT_01" />
              </div>
            )}
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                formRef.current?.reset();
                setStatus(null);
              }}
            >
              Clear
            </button>
            <button type="submit" className="btn-gold" disabled={loading} style={{ minWidth: '180px' }}>
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Gavel size={16} />
                  <span>Execute</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================================================
// QUERY EXPLORER WITH COMMON SEARCH AT TOP RIGHT & FULL-SCREEN FIT
// ==========================================================================
interface QueryInfo {
  id: number;
  title: string;
  category: 'Courts' | 'Appeals' | 'Judicial' | 'Criminal';
  concept: string;
  description: string;
}

const QUERIES: QueryInfo[] = [
  { id: 1, title: 'Caseload Distribution', category: 'Courts', concept: 'GROUP BY & Aggregation', description: 'Distribution of total and pending cases across court jurisdictional tiers.' },
  { id: 2, title: 'Active Lawyer Roster', category: 'Judicial', concept: 'Multi-Way Joins', description: 'Specialized counsel representations mapped to active litigants.' },
  { id: 3, title: 'Recursive Appellate Lineage', category: 'Appeals', concept: 'Recursive CTE', description: 'Full hierarchy of appeal chains traversing lower to supreme courts.' },
  { id: 4, title: 'Hearing History & Bench', category: 'Courts', concept: 'Composite Key Join', description: 'Chronological hearings and assigned judges for a specific docket.' },
  { id: 5, title: 'Resolution Duration', category: 'Courts', concept: 'DATEDIFF Benchmark', description: 'Turnaround duration benchmarking between case filing and final judgment.' },
  { id: 6, title: 'Active Pending Docket', category: 'Courts', concept: 'Subquery IN clause', description: 'Pending cases with scheduled proceedings in active court dockets.' },
  { id: 7, title: 'Double Jeopardy Risk', category: 'Criminal', concept: 'HAVING Threshold', description: 'Detection of multiple charge sheets under the same penal statute.' },
  { id: 8, title: 'Most Cited Precedents', category: 'Appeals', concept: 'Precedent Frequency', description: 'Rank of historical cases cited as binding authority in judgments.' },
  { id: 9, title: 'Taxonomy Precedent Search', category: 'Appeals', concept: 'Tag Relational Mapping', description: 'Retrieval of precedent cases tagged with corporate fraud keywords.' },
  { id: 10, title: 'Master Cross-Module Docket', category: 'Courts', concept: 'Full Outer Aggregation', description: 'Holistic docket view combining charges, hearings, and judgments.' },
  { id: 11, title: 'Stalled Docket Detection', category: 'Courts', concept: 'Temporal Inactivity', description: 'Pending cases with no recorded hearings for over one year.' },
  { id: 12, title: 'Bail Outlier Analysis', category: 'Criminal', concept: 'Correlated Subquery', description: 'Criminal cases with bail set significantly higher than agency average.' },
  { id: 13, title: 'Judicial Clearance Rates', category: 'Judicial', concept: 'Calculated Metric', description: 'Clearance percentage across judges handling civil and criminal trials.' },
  { id: 14, title: 'Habitual Litigant Tracker', category: 'Criminal', concept: 'Frequency Filter', description: 'Individuals named as parties across multiple distinct trial dockets.' },
  { id: 15, title: 'Lawyer Success Ranking', category: 'Judicial', concept: 'Window Functions (RANK)', description: 'Window function partition ranking lawyers by resolved judgments.' },
];

// Helper to format ISO timestamps and date strings into human-friendly format
function formatDateTimeValue(val: any): string {
  if (val === null || val === undefined) return 'NULL';
  const str = String(val).trim();

  // Match ISO 8601 string: e.g. 2023-01-09T18:30:00.000Z or 2025-02-15T06:00:00.000Z or 2026-11-20T10:30
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/);
  if (isoMatch) {
    const [, year, month, day, hourStr, minStr] = isoMatch;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = months[parseInt(month, 10) - 1] || month;
    const hours = parseInt(hourStr, 10);
    const mins = parseInt(minStr, 10);

    // If pure date serialized with midnight time (00:00:00):
    if (hours === 0 && mins === 0 && (!isoMatch[6] || parseInt(isoMatch[6], 10) === 0)) {
      return `${parseInt(day, 10)} ${monthName} ${year}`;
    } else {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedMins = String(mins).padStart(2, '0');
      return `${parseInt(day, 10)} ${monthName} ${year}, ${formattedHours}:${formattedMins} ${ampm}`;
    }
  }

  // Match simple date: YYYY-MM-DD
  const dateOnlyMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = months[parseInt(month, 10) - 1] || month;
    return `${parseInt(day, 10)} ${monthName} ${year}`;
  }

  return str;
}

function FetchRecords({ setView }: { setView: (v: string) => void }) {
  const [activeQueryId, setActiveQueryId] = useState<number | null>(1);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  // Common Top-Right Search (Universal Case Search)
  const [universalSearch, setUniversalSearch] = useState('');
  const [isUniversalSearchActive, setIsUniversalSearchActive] = useState(false);

  // Filters for the sidebar catalog & table rows
  const [queryCatalogFilter, setQueryCatalogFilter] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Courts' | 'Appeals' | 'Judicial' | 'Criminal'>('All');

  const activeQuery = useMemo(() => {
    if (activeQueryId === null) return null;
    return QUERIES.find((q) => q.id === activeQueryId) || QUERIES[0];
  }, [activeQueryId]);

  // Fetch standard analytical query Q1–Q15
  const fetchQuery = async (id: number) => {
    setLoading(true);
    setError('');
    setActiveQueryId(id);
    setIsUniversalSearchActive(false);
    setData([]);
    setTableSearch('');
    const startTime = performance.now();

    try {
      const res = await fetch(`http://localhost:3000/api/queries/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch query results');
      setData(json);
      setExecutionTime(Math.round(performance.now() - startTime));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Execute universal case search
  const executeUniversalSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setIsUniversalSearchActive(false);
      if (activeQueryId) fetchQuery(activeQueryId);
      return;
    }

    setLoading(true);
    setError('');
    setIsUniversalSearchActive(true);
    setActiveQueryId(null);
    setData([]);
    setTableSearch('');
    const startTime = performance.now();

    try {
      const res = await fetch(`http://localhost:3000/api/cases/search?q=${encodeURIComponent(searchTerm.trim())}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Search request failed');
      setData(json);
      setExecutionTime(Math.round(performance.now() - startTime));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Debounced execution for top-right universal search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (universalSearch.trim()) {
        executeUniversalSearch(universalSearch);
      } else if (isUniversalSearchActive) {
        setIsUniversalSearchActive(false);
        setActiveQueryId(1);
        fetchQuery(1);
      }
    }, 280);

    return () => clearTimeout(handler);
  }, [universalSearch]);

  useEffect(() => {
    fetchQuery(1);
  }, []);

  const filteredQueries = useMemo(() => {
    return QUERIES.filter((q) => {
      const matchesSearch =
        q.title.toLowerCase().includes(queryCatalogFilter.toLowerCase()) ||
        q.concept.toLowerCase().includes(queryCatalogFilter.toLowerCase()) ||
        `q${q.id}`.includes(queryCatalogFilter.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || q.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [queryCatalogFilter, categoryFilter]);

  const filteredRows = useMemo(() => {
    if (!tableSearch.trim() || data.length === 0) return data;
    const term = tableSearch.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((val) =>
        formatDateTimeValue(val).toLowerCase().includes(term) ||
        String(val).toLowerCase().includes(term)
      )
    );
  }, [data, tableSearch]);

  const handleExportCSV = () => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((h) => {
            const val = row[h] !== null && row[h] !== undefined ? formatDateTimeValue(row[h]) : '';
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(',')
      )
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = isUniversalSearchActive
      ? `cases_search_${universalSearch.trim()}.csv`
      : `query_Q${activeQuery?.id || 1}_${activeQuery?.title.replace(/\s+/g, '_')}.csv`;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="main-container query-layout-full view-entrance">
      {/* Top Header Row with Common Search at Top Right */}
      <div className="query-explorer-top-bar">
        <button className="btn-outline" onClick={() => setView('menu')}>
          <ArrowLeft size={16} /> Back to Overview
        </button>

        {/* Common Universal Case Search Bar at Top Right */}
        <div className="universal-search-container">
          <Search size={18} className="universal-search-icon" />
          <input
            type="text"
            className="universal-search-input"
            placeholder="Search any Case ID, title, or party (e.g. CASE_1001, Ram)..."
            value={universalSearch}
            onChange={(e) => setUniversalSearch(e.target.value)}
          />
          {universalSearch && (
            <button
              className="universal-search-clear"
              onClick={() => {
                setUniversalSearch('');
                setIsUniversalSearchActive(false);
                fetchQuery(1);
              }}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="query-workspace-layout">
        {/* Sidebar: Query Catalog */}
        <div className="glass-panel query-sidebar">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#c3aa72' }}>
              Queries
            </h4>
            <span className="stat-pill">{filteredQueries.length} available</span>
          </div>

          {/* Search box for queries list */}
          <div className="query-search-box">
            <Search size={16} className="query-search-icon" />
            <input
              type="text"
              placeholder="Filter Q1–Q15..."
              value={queryCatalogFilter}
              onChange={(e) => setQueryCatalogFilter(e.target.value)}
            />
          </div>

          {/* Category filter pills */}
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {(['All', 'Courts', 'Appeals', 'Judicial', 'Criminal'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                className={`btn-ghost ${categoryFilter === cat ? 'is-active' : ''}`}
                style={{
                  fontSize: '12px',
                  padding: '3px 8px',
                  borderRadius: '999px',
                  background: categoryFilter === cat ? 'rgba(195,170,114,0.2)' : 'rgba(255,255,255,0.05)',
                  color: categoryFilter === cat ? '#f3e9d2' : 'rgba(238,233,220,0.7)',
                  border: '1px solid rgba(195,170,114,0.15)'
                }}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Queries list */}
          <div className="query-items-list">
            {filteredQueries.map((q) => (
              <button
                key={q.id}
                className={`query-item-btn ${!isUniversalSearchActive && activeQueryId === q.id ? 'is-active' : ''}`}
                onClick={() => {
                  setUniversalSearch('');
                  fetchQuery(q.id);
                }}
              >
                <div className="query-btn-top">
                  <span className="query-id-tag">Q{q.id}</span>
                  <span className="query-btn-badge">{q.category}</span>
                </div>
                <span className="query-btn-title">{q.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Panel: Results */}
        <div className="glass-panel query-result-panel">
          {/* Header Row */}
          <div className="result-header-row">
            <div>
              {isUniversalSearchActive ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="stat-pill" style={{ color: '#c3aa72', borderColor: 'rgba(195,170,114,0.3)' }}>
                      Universal Case Search
                    </span>
                    <span className="stat-pill">Matches: &ldquo;{universalSearch}&rdquo;</span>
                  </div>
                  <h3 className="result-query-title">Direct Case Lookup Results</h3>
                </>
              ) : activeQuery ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="stat-pill" style={{ color: '#c3aa72', borderColor: 'rgba(195,170,114,0.3)' }}>
                      Query {activeQuery.id}
                    </span>
                    <span className="stat-pill">{activeQuery.concept}</span>
                  </div>
                  <h3 className="result-query-title">{activeQuery.title}</h3>
                </>
              ) : null}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {executionTime !== null && !loading && (
                <span className="stat-pill">
                  <Clock size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  {executionTime} ms
                </span>
              )}
              {data.length > 0 && (
                <span className="stat-pill">
                  {filteredRows.length} / {data.length} Rows
                </span>
              )}
              <button
                className="btn-outline"
                onClick={() => {
                  if (isUniversalSearchActive) {
                    executeUniversalSearch(universalSearch);
                  } else if (activeQueryId) {
                    fetchQuery(activeQueryId);
                  }
                }}
                disabled={loading}
                title="Refresh results"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="banner-error">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <div className="skeleton-wrap">
              <div className="skeleton-row" style={{ width: '100%' }} />
              <div className="skeleton-row" style={{ width: '85%' }} />
              <div className="skeleton-row" style={{ width: '92%' }} />
              <div className="skeleton-row" style={{ width: '78%' }} />
              <div className="skeleton-row" style={{ width: '88%' }} />
            </div>
          )}

          {/* Table Controls (Search inside results & CSV Download) */}
          {!loading && data.length > 0 && (
            <div className="table-controls-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={15} style={{ color: 'rgba(238,233,220,0.6)' }} />
                <input
                  type="text"
                  placeholder="Filter within visible table..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="table-filter-input"
                />
              </div>

              <button className="btn-outline" onClick={handleExportCSV}>
                <Download size={14} /> Export CSV
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && data.length === 0 && (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'rgba(238,233,220,0.6)' }}>
              <Scale size={44} style={{ margin: '0 auto 14px', opacity: 0.35 }} />
              <p style={{ fontSize: '16px' }}>
                {isUniversalSearchActive
                  ? `No cases found matching "${universalSearch}".`
                  : 'No records returned for this query.'}
              </p>
              {isUniversalSearchActive && (
                <button
                  className="btn-outline"
                  style={{ marginTop: '12px' }}
                  onClick={() => {
                    setUniversalSearch('');
                    fetchQuery(1);
                  }}
                >
                  Return to Query 1
                </button>
              )}
            </div>
          )}

          {/* Results Table: Auto-fits horizontally & scrolls vertically */}
          {!loading && data.length > 0 && (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    {Object.keys(data[0]).map((key) => (
                      <th key={key}>{key.replace(/_/g, ' ')}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className="table-row-animate"
                      style={{ animationDelay: `${Math.min(idx * 20, 240)}ms` }}
                    >
                      {Object.entries(row).map(([colKey, val]: any, cIdx) => {
                        const valStr = formatDateTimeValue(val);
                        const lowerKey = colKey.toLowerCase();

                        if (lowerKey === 'status') {
                          return (
                            <td key={cIdx} className="cell-nowrap">
                              <span className={`status-pill ${valStr === 'Pending' ? 'status-pending' : 'status-closed'}`}>
                                {valStr}
                              </span>
                            </td>
                          );
                        }

                        if (lowerKey === 'case_type') {
                          return (
                            <td key={cIdx} className="cell-nowrap">
                              <span className="case-type-badge">{valStr}</span>
                            </td>
                          );
                        }

                        if (lowerKey.includes('case_id')) {
                          return (
                            <td key={cIdx} className="cell-case-id">
                              {valStr}
                            </td>
                          );
                        }

                        if (lowerKey === 'title' || lowerKey.includes('name') || lowerKey.includes('case_name')) {
                          return (
                            <td key={cIdx} className="cell-title" title={valStr}>
                              {valStr}
                            </td>
                          );
                        }

                        if (lowerKey.includes('court')) {
                          return (
                            <td key={cIdx} className="cell-court" title={valStr}>
                              {valStr}
                            </td>
                          );
                        }

                        if (lowerKey.includes('date') || lowerKey.includes('timestamp') || lowerKey === 'tier_level') {
                          return (
                            <td key={cIdx} className="cell-nowrap">
                              {valStr}
                            </td>
                          );
                        }

                        return <td key={cIdx}>{valStr}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// APP ROOT
// ==========================================================================
export default function App() {
  const [currentView, setCurrentView] = useState<'splash' | 'menu' | 'add' | 'fetch'>('splash');

  return (
    <div className="app-shell">
      {currentView === 'splash' && (
        <Splash onComplete={() => setCurrentView('menu')} />
      )}

      {currentView !== 'splash' && (
        <>
          <Navigation
            currentView={currentView}
            setView={(v) => setCurrentView(v as any)}
            onReplaySplash={() => setCurrentView('splash')}
          />
          {currentView === 'menu' && <MainMenu setView={(v) => setCurrentView(v as any)} />}
          {currentView === 'add' && <AddRecord setView={(v) => setCurrentView(v as any)} />}
          {currentView === 'fetch' && <FetchRecords setView={(v) => setCurrentView(v as any)} />}
        </>
      )}
    </div>
  );
}
