import React, { useState, useEffect } from 'react';

// ==========================================================================
// SPLASH EMBLEM & NEOCLASSICAL ARCHITECTURAL ANIMATIONS
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
      </svg>
    </div>
  );
}

function SplashScreen({ onEnter, fading }: { onEnter: () => void; fading: boolean }) {
  const [progressMsg, setProgressMsg] = useState('Initializing Database Engine...');
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setProgressMsg('Mounting Schema & ACID Constraints...'), 1200);
    const t2 = setTimeout(() => setProgressMsg('Precedent Engine & Appellate Indexes Active...'), 2400);
    const t3 = setTimeout(() => {
      setProgressMsg('Judicial Console Ready');
      setCanSkip(true);
    }, 3200);

    // Auto dismiss after 4.5s so user never stays trapped
    const t4 = setTimeout(() => {
      onEnter();
    }, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onEnter]);

  return (
    <section className={`splash ${fading ? 'fading-out' : ''}`} aria-label="Judicial System Initialization">
      <div className="ambient-light" />
      <div className="architectural-grid" />
      <div className="columns-bg" />

      <svg className="case-connections" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
        <g fill="none" stroke="currentColor">
          <path d="M90 218h190l75 74h178M980 182h224l96 96h86M113 694h208l79-76h164M902 682h174l70-68h215" />
          <path d="M214 115v92M1240 280v116M300 699v91M1090 592v91" />
        </g>
      </svg>

      <div className="particles" aria-hidden="true">
        {particles.map((p, idx) => (
          <span
            key={idx}
            style={{
              left: p.x,
              top: p.y,
              animationDelay: p.delay,
              animationDuration: p.duration,
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
          <p>Managing Cases <b>•</b> Judgments <b>•</b> Appeals <b>•</b> Legal Precedents</p>
          
          <div className="loading-block">
            <span className="loading-context">
              {progressMsg}
            </span>
            <div className="progress-track"><span /></div>
          </div>

          <div style={{ marginTop: '26px', display: 'flex', gap: '12px' }}>
            <button
              onClick={onEnter}
              className="btn-gold"
              style={{ fontSize: '0.9rem', padding: '10px 24px', cursor: 'pointer' }}
            >
              Enter Judicial Console &rarr;
            </button>
            {canSkip && (
              <button
                onClick={onEnter}
                className="btn-ghost"
                style={{ fontSize: '0.82rem', padding: '10px 18px' }}
              >
                Skip Intro
              </button>
            )}
          </div>
        </div>
      </main>
    </section>
  );
}

// ==========================================================================
// MAIN JUDICIAL CONSOLE APPLICATION
// ==========================================================================

export default function App() {
  // Splash & layout state
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashFading, setSplashFading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cases' | 'hearings' | 'judgments' | 'appeals' | 'precedents' | 'audit'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals & detail views
  const [selectedCaseForDossier, setSelectedCaseForDossier] = useState<any | null>(null);
  const [filingModalOpen, setFilingModalOpen] = useState(false);
  const [filingSubtype, setFilingSubtype] = useState<'criminal' | 'civil'>('criminal');
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [judgmentModalOpen, setJudgmentModalOpen] = useState(false);

  // Backend state
  const [status, setStatus] = useState<{ connected: boolean; host?: string; database?: string; lastError?: string }>({ connected: false });
  const [summary, setSummary] = useState<any>({ totalCases: 0, pendingCases: 0, closedCases: 0, clearanceRate: 0 });
  const [cases, setCases] = useState<any[]>([]);
  const [courts, setCourts] = useState<any[]>([]);
  const [judges, setJudges] = useState<any[]>([]);
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [hearings, setHearings] = useState<any[]>([]);
  const [judgments, setJudgments] = useState<any[]>([]);
  const [precedents, setPrecedents] = useState<any[]>([]);
  const [masterDocket, setMasterDocket] = useState<any[]>([]);
  const [appeals, setAppeals] = useState<any[]>([]);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCourt, setFilterCourt] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');

  // Query engine state (Q1 - Q15)
  const [selectedQueryId, setSelectedQueryId] = useState('1');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [showSqlPreview, setShowSqlPreview] = useState(false);

  // Notifications
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Form states
  const [crimForm, setCrimForm] = useState({
    Case_ID: 'CASE_' + Math.floor(1000 + Math.random() * 9000),
    Court_ID: 'CRT_DC_CHN',
    Parent_Case_ID: '',
    Title: '',
    Filing_Date: new Date().toISOString().split('T')[0],
    FIR_Or_Complaint_No: 'FIR-2026-' + Math.floor(100 + Math.random() * 900),
    Bail_Amount: '50000',
    Arresting_Agency: 'State Investigation Agency'
  });

  const [civForm, setCivForm] = useState({
    Case_ID: 'CASE_' + Math.floor(1000 + Math.random() * 9000),
    Court_ID: 'CRT_HC_TN',
    Parent_Case_ID: '',
    Title: '',
    Filing_Date: new Date().toISOString().split('T')[0],
    Dispute_Value: '1500000',
    Civil_Case_Type: 'Contract Breach'
  });

  const [hearingForm, setHearingForm] = useState({
    Case_ID: 'CASE_1001',
    Hearing_Timestamp: '2026-11-20 10:30:00',
    Summary_Notes: 'Evidence presentation and witness cross-examination.',
    Judge_ID: 'ENT_006',
    Bench_Role: 'Single Judge'
  });

  const [judgmentForm, setJudgmentForm] = useState({
    Judgment_ID: 'JUDG_' + Math.floor(1000 + Math.random() * 9000),
    Case_ID: 'CASE_1001',
    Verdict_Date: new Date().toISOString().split('T')[0],
    Judgment_Text: 'Court concludes trial and pronounces final decree based on statutory evidence.'
  });

  const [counselForm, setCounselForm] = useState({
    Counsel_ID: 'CNSL_' + Math.floor(10 + Math.random() * 90),
    Lawyer_ID: 'ENT_004',
    Party_ID: 'PRT_02',
    Lead_Counsel_Flag: true
  });

  const [precedentForm, setPrecedentForm] = useState({
    Citation_ID: 'CIT_' + Math.floor(10 + Math.random() * 90),
    Citing_Case_ID: 'CASE_3001',
    Cited_Precedent_Case_ID: 'CASE_900',
    Relevance_Note: 'Precedent ratio for evaluating commercial fraud intent and corporate director culpability.'
  });

  const notify = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 6000);
  };

  const handleDismissSplash = () => {
    setSplashFading(true);
    setTimeout(() => {
      setSplashVisible(false);
      setSplashFading(false);
    }, 700);
  };

  // Data fetching
  const loadData = async () => {
    try {
      const [stRes, sumRes, casesRes, courtsRes, judgesRes, lawyersRes, hearingsRes, judgmentsRes, precRes, docketRes, appealsRes, auditRes] = await Promise.all([
        fetch('/api/status').then(r => r.json()).catch(() => ({ connected: false })),
        fetch('/api/analytics/summary').then(r => r.json()).catch(() => ({})),
        fetch('/api/cases').then(r => r.json()).catch(() => []),
        fetch('/api/courts').then(r => r.json()).catch(() => []),
        fetch('/api/judges').then(r => r.json()).catch(() => []),
        fetch('/api/lawyers').then(r => r.json()).catch(() => []),
        fetch('/api/hearings').then(r => r.json()).catch(() => []),
        fetch('/api/judgments').then(r => r.json()).catch(() => []),
        fetch('/api/precedents').then(r => r.json()).catch(() => []),
        fetch('/api/master-docket').then(r => r.json()).catch(() => []),
        fetch('/api/appeals').then(r => r.json()).catch(() => []),
        fetch('/api/audit-trail').then(r => r.json()).catch(() => [])
      ]);

      setStatus(stRes);
      setSummary(sumRes);
      setCases(casesRes);
      setCourts(courtsRes);
      setJudges(judgesRes);
      setLawyers(lawyersRes);
      setHearings(hearingsRes);
      setJudgments(judgmentsRes);
      setPrecedents(precRes);
      setMasterDocket(docketRes);
      setAppeals(appealsRes);
      setAuditTrail(auditRes);
    } catch (err: any) {
      console.warn('Judicial data sync error:', err.message);
    }
  };

  useEffect(() => {
    loadData();
    runAnalyticalQuery(selectedQueryId);
  }, []);

  const runAnalyticalQuery = async (queryId: string) => {
    setQueryLoading(true);
    setSelectedQueryId(queryId);
    try {
      const res = await fetch(`/api/analytics/q/${queryId}`);
      const data = await res.json();
      setQueryResult(data);
    } catch (err: any) {
      notify(`Failed to run Query Q${queryId}: ${err.message}`, 'error');
    } finally {
      setQueryLoading(false);
    }
  };

  // Action handlers
  const handleRegisterCriminal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/cases/criminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crimForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      notify(data.message, 'success');
      loadData();
      setFilingModalOpen(false);
      setCrimForm({
        ...crimForm,
        Case_ID: 'CASE_' + Math.floor(1000 + Math.random() * 9000),
        Title: ''
      });
    } catch (err: any) {
      notify(err.message, 'error');
    }
  };

  const handleRegisterCivil = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/cases/civil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(civForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      notify(data.message, 'success');
      loadData();
      setFilingModalOpen(false);
      setCivForm({
        ...civForm,
        Case_ID: 'CASE_' + Math.floor(1000 + Math.random() * 9000),
        Title: ''
      });
    } catch (err: any) {
      notify(err.message, 'error');
    }
  };

  const handleScheduleHearing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/hearings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hearingForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scheduling failed');
      notify(data.message, 'success');
      loadData();
      setScheduleModalOpen(false);
    } catch (err: any) {
      notify(err.message, 'error');
    }
  };

  const handleRecordJudgment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/judgments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(judgmentForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Judgment recording failed');
      notify(data.message, 'success');
      loadData();
      setJudgmentModalOpen(false);
      setJudgmentForm({
        ...judgmentForm,
        Judgment_ID: 'JUDG_' + Math.floor(1000 + Math.random() * 9000),
        Judgment_Text: ''
      });
    } catch (err: any) {
      notify(err.message, 'error');
    }
  };

  const handleAssignCounsel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/counsel/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(counselForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Counsel assignment failed');
      notify(data.message, 'success');
      loadData();
    } catch (err: any) {
      notify(err.message, 'error');
    }
  };

  const handleCitePrecedent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/precedents/cite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(precedentForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Citation failed');
      notify(data.message, 'success');
      loadData();
    } catch (err: any) {
      notify(err.message, 'error');
    }
  };

  const handleDeleteCase = async (caseId: string) => {
    if (!confirm(`Are you sure you want to permanently purge Case ${caseId}? All associated hearings, judgments, and docket charges will cascade delete.`)) return;
    try {
      const res = await fetch(`/api/cases/${caseId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      notify(data.message, 'success');
      if (selectedCaseForDossier?.Case_ID === caseId) setSelectedCaseForDossier(null);
      loadData();
    } catch (err: any) {
      notify(err.message, 'error');
    }
  };

  const handleCancelHearing = async (caseId: string, timestamp: string) => {
    if (!confirm(`Cancel hearing session for ${caseId} at ${timestamp}?`)) return;
    try {
      const res = await fetch(`/api/hearings/${caseId}/${encodeURIComponent(timestamp)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cancel failed');
      notify(data.message, 'success');
      loadData();
    } catch (err: any) {
      notify(err.message, 'error');
    }
  };

  // Filtered master docket
  const filteredDocket = masterDocket.filter(item => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term ||
      item.Case_ID.toLowerCase().includes(term) ||
      item.Title.toLowerCase().includes(term) ||
      item.Court_Name.toLowerCase().includes(term) ||
      (item.Applied_Charges && item.Applied_Charges.toLowerCase().includes(term));
    
    const matchesStatus = filterStatus === 'ALL' || item.Status === filterStatus;
    const matchesCourt = filterCourt === 'ALL' || item.Court_Name === filterCourt;
    
    return matchesSearch && matchesStatus && matchesCourt;
  });

  return (
    <div className="app-shell">
      {/* 1. VISUALLY IMPRESSIVE SPLASH INTRO */}
      {splashVisible && (
        <SplashScreen
          onEnter={handleDismissSplash}
          fading={splashFading}
        />
      )}

      {/* 2. SIDEBAR BACKDROP FOR MOBILE/TABLET */}
      <div
        className={`sidebar-backdrop ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="app-layout">
        {/* 3. PROFESSIONAL JUDICIAL SIDEBAR */}
        <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-brand">
              <div className="sidebar-brand-icon">⚖</div>
              <div>
                <div className="sidebar-brand-title">JUDICATURE</div>
                <div className="sidebar-brand-sub">Case & Precedent System</div>
              </div>
            </div>
          </div>

          <div className="sidebar-nav">
            <div className="sidebar-section-label">General Operations</div>
            
            <button
              onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
              className={`sidebar-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <div className="sidebar-nav-item-content">
                <span className="sidebar-nav-icon">🏛️</span>
                <span>Dashboard</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('cases'); setSidebarOpen(false); }}
              className={`sidebar-nav-btn ${activeTab === 'cases' ? 'active' : ''}`}
            >
              <div className="sidebar-nav-item-content">
                <span className="sidebar-nav-icon">📁</span>
                <span>Master Docket</span>
              </div>
              <span className="sidebar-nav-badge">{cases.length}</span>
            </button>

            <button
              onClick={() => { setActiveTab('hearings'); setSidebarOpen(false); }}
              className={`sidebar-nav-btn ${activeTab === 'hearings' ? 'active' : ''}`}
            >
              <div className="sidebar-nav-item-content">
                <span className="sidebar-nav-icon">📅</span>
                <span>Cause List & Benches</span>
              </div>
              <span className="sidebar-nav-badge">{hearings.length}</span>
            </button>

            <button
              onClick={() => { setActiveTab('judgments'); setSidebarOpen(false); }}
              className={`sidebar-nav-btn ${activeTab === 'judgments' ? 'active' : ''}`}
            >
              <div className="sidebar-nav-item-content">
                <span className="sidebar-nav-icon">📜</span>
                <span>Judgments & Decrees</span>
              </div>
              <span className="sidebar-nav-badge">{judgments.length}</span>
            </button>

            <div className="sidebar-section-label">Jurisprudence & Law</div>

            <button
              onClick={() => { setActiveTab('appeals'); setSidebarOpen(false); }}
              className={`sidebar-nav-btn ${activeTab === 'appeals' ? 'active' : ''}`}
            >
              <div className="sidebar-nav-item-content">
                <span className="sidebar-nav-icon">⚖️</span>
                <span>Appeals & Lineage</span>
              </div>
              <span className="sidebar-nav-badge">{appeals.length}</span>
            </button>

            <button
              onClick={() => { setActiveTab('precedents'); setSidebarOpen(false); }}
              className={`sidebar-nav-btn ${activeTab === 'precedents' ? 'active' : ''}`}
            >
              <div className="sidebar-nav-item-content">
                <span className="sidebar-nav-icon">📚</span>
                <span>Precedents & Counsel</span>
              </div>
              <span className="sidebar-nav-badge">{precedents.length}</span>
            </button>

            <button
              onClick={() => { setActiveTab('audit'); setSidebarOpen(false); }}
              className={`sidebar-nav-btn ${activeTab === 'audit' ? 'active' : ''}`}
            >
              <div className="sidebar-nav-item-content">
                <span className="sidebar-nav-icon">🛡️</span>
                <span>Audit & Analytics</span>
              </div>
              <span className="sidebar-nav-badge">Q1–Q15</span>
            </button>
          </div>

          <div className="sidebar-footer">
            <div className="sidebar-status-box">
              <div className="sidebar-status-header">
                <span>Database Engine</span>
                {status.connected ? (
                  <span className="status-chip online" style={{ padding: '2px 8px', fontSize: '0.68rem' }}>
                    <span className="status-dot"></span> Live
                  </span>
                ) : (
                  <span className="status-chip fallback" style={{ padding: '2px 8px', fontSize: '0.68rem' }}>
                    <span className="status-dot"></span> Standalone
                  </span>
                )}
              </div>
              <div className="sidebar-status-meta">
                <span>{status.connected ? `MySQL: ${status.database}` : 'In-Memory ACID Store'}</span>
                <span>Host: {status.host || 'localhost'} • Port 3000</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  fetch('/api/reconnect', { method: 'POST' }).then(() => loadData());
                  notify('Testing MySQL connection & syncing datasets...', 'info');
                }}
                className="btn-ghost"
                style={{ flex: 1, padding: '7px 10px', fontSize: '0.74rem' }}
                title="Refresh database state and sync"
              >
                🔄 Sync State
              </button>
              <button
                onClick={() => setSplashVisible(true)}
                className="btn-ghost"
                style={{ padding: '7px 10px', fontSize: '0.74rem' }}
                title="Replay introductory emblem splash"
              >
                🏛 Emblem
              </button>
            </div>
          </div>
        </aside>

        {/* 4. MAIN WORKSPACE CONTENT */}
        <div className="app-content">
          {/* TOP HEADER BAR */}
          <header className="app-header">
            <div className="header-left">
              <button
                className="mobile-menu-toggle"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation sidebar"
              >
                ☰
              </button>

              <div className="header-breadcrumbs">
                <span className="breadcrumb-root">Judicature</span>
                <span className="breadcrumb-sep">&gt;</span>
                <span className="breadcrumb-active">
                  {activeTab === 'dashboard' && 'Dashboard Overview'}
                  {activeTab === 'cases' && 'Master Docket & Filing'}
                  {activeTab === 'hearings' && 'Cause List & Bench Constitution'}
                  {activeTab === 'judgments' && 'Decrees & Judgments Archive'}
                  {activeTab === 'appeals' && 'Appellate Lineage & Traversals'}
                  {activeTab === 'precedents' && 'Precedent Engine & Bar Roster'}
                  {activeTab === 'audit' && 'Audit Trail & Analytical Intelligence (Q1–Q15)'}
                </span>
              </div>
            </div>

            <div className="header-right">
              <div className="header-search">
                <span className="header-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Global docket / title search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button
                onClick={() => setFilingModalOpen(true)}
                className="btn-gold"
              >
                ⚡ File Case
              </button>
            </div>
          </header>

          {/* NOTIFICATION BANNER */}
          {notification && (
            <div style={{ padding: '16px 28px 0' }}>
              <div className={`alert-banner ${notification.type}`}>
                <span>{notification.text}</span>
                <button
                  onClick={() => setNotification(null)}
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                  &times;
                </button>
              </div>
            </div>
          )}

          {/* PAGE CONTENT CONTAINER */}
          <main className="page-container">
            {/* ========================================================== */}
            {/* TAB 1: DASHBOARD OVERVIEW */}
            {/* ========================================================== */}
            {activeTab === 'dashboard' && (
              <div>
                <div className="page-hero">
                  <div>
                    <h1 className="page-title">Executive Judicial Console</h1>
                    <p className="page-subtitle">
                      Hierarchical Case Management, Bench Schedules, Precedent Retrieval & Forensic Analytics
                    </p>
                  </div>
                  <div className="page-actions">
                    <button onClick={() => setFilingModalOpen(true)} className="btn-gold">
                      ⚡ File Case
                    </button>
                    <button onClick={() => setScheduleModalOpen(true)} className="btn-secondary">
                      📅 Schedule Proceeding
                    </button>
                    <button onClick={() => setJudgmentModalOpen(true)} className="btn-secondary">
                      📜 Deliver Verdict
                    </button>
                  </div>
                </div>

                {/* KPI METRIC CARDS */}
                <div className="kpi-grid">
                  <div className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-label">Active Dockets</span>
                      <span className="kpi-icon">📁</span>
                    </div>
                    <div className="kpi-val">{summary.totalCases || cases.length}</div>
                    <div className="kpi-sub">Across 3 Judicial Tiers</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-label">Pending Trials</span>
                      <span className="kpi-icon" style={{ color: '#fbbf24' }}>⏳</span>
                    </div>
                    <div className="kpi-val" style={{ color: '#fbbf24' }}>{summary.pendingCases || 0}</div>
                    <div className="kpi-sub">Awaiting Final Verdict</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-label">Decreed & Closed</span>
                      <span className="kpi-icon" style={{ color: '#34d399' }}>✓</span>
                    </div>
                    <div className="kpi-val" style={{ color: '#34d399' }}>{summary.closedCases || 0}</div>
                    <div className="kpi-sub">Final Judgment Pronounced</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-label">Disposal Clearance</span>
                      <span className="kpi-icon" style={{ color: '#60a5fa' }}>📊</span>
                    </div>
                    <div className="kpi-val" style={{ color: '#60a5fa' }}>{summary.clearanceRate || 0}%</div>
                    <div className="kpi-sub">Concluded vs Total Ratio</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-label">Bench Judges</span>
                      <span className="kpi-icon">🏛️</span>
                    </div>
                    <div className="kpi-val">{judges.length}</div>
                    <div className="kpi-sub">High & District Benches</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-label">Bar Advocates</span>
                      <span className="kpi-icon">👔</span>
                    </div>
                    <div className="kpi-val">{lawyers.length}</div>
                    <div className="kpi-sub">Active Bar Council Licenses</div>
                  </div>
                </div>

                {/* TWO-COLUMN DASHBOARD SECTION */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '24px' }}>
                  {/* RECENT DOCKET ACTIVITY */}
                  <div className="card-panel">
                    <div className="card-header">
                      <div className="card-title-group">
                        <h2 className="card-title">📋 Recent Docket Activity</h2>
                        <p className="card-desc">Active cases across trial and appellate courts</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('cases')}
                        className="btn-ghost"
                        style={{ fontSize: '0.74rem' }}
                      >
                        View Full Docket &rarr;
                      </button>
                    </div>

                    <div className="card-body no-padding">
                      <div className="table-container">
                        <table className="custom-table">
                          <thead>
                            <tr>
                              <th>Case ID</th>
                              <th>Title</th>
                              <th>Court Venue</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cases.slice(0, 5).map((c) => (
                              <tr key={c.Case_ID}>
                                <td style={{ fontWeight: 600, color: '#f1e6c6' }}>{c.Case_ID}</td>
                                <td style={{ maxWidth: '240px' }}>{c.Title}</td>
                                <td>{c.Court_Name}</td>
                                <td>
                                  <span className={`badge ${c.Status === 'Closed' ? 'closed' : 'pending'}`}>
                                    {c.Status}
                                  </span>
                                </td>
                                <td>
                                  <button
                                    onClick={() => setSelectedCaseForDossier(c)}
                                    className="btn-ghost"
                                    style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                                  >
                                    Dossier
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE PROCEEDINGS CAUSE LIST */}
                  <div className="card-panel">
                    <div className="card-header">
                      <div className="card-title-group">
                        <h2 className="card-title">🏛️ Upcoming Hearings Cause List</h2>
                        <p className="card-desc">Scheduled bench hearings and presiding magistrates</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('hearings')}
                        className="btn-ghost"
                        style={{ fontSize: '0.74rem' }}
                      >
                        All Hearings &rarr;
                      </button>
                    </div>

                    <div className="card-body no-padding">
                      <div className="table-container">
                        <table className="custom-table">
                          <thead>
                            <tr>
                              <th>Timestamp</th>
                              <th>Case</th>
                              <th>Presiding Judge</th>
                              <th>Bench Role</th>
                            </tr>
                          </thead>
                          <tbody>
                            {hearings.slice(0, 5).map((h, i) => (
                              <tr key={i}>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem' }}>{h.Hearing_Timestamp}</td>
                                <td style={{ fontWeight: 500 }}>
                                  <span style={{ color: '#c8b27a', cursor: 'pointer' }} onClick={() => {
                                    const match = cases.find(x => x.Case_ID === h.Case_ID);
                                    if (match) setSelectedCaseForDossier(match);
                                  }}>
                                    {h.Case_ID}
                                  </span>
                                </td>
                                <td>{h.Presiding_Judge}</td>
                                <td>
                                  <span className="badge gold">{h.Bench_Role || 'Single Judge'}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* JURISDICTIONAL ARCHITECTURE & QUICK ACTIONS */}
                <div className="card-panel" style={{ marginTop: '24px' }}>
                  <div className="card-header">
                    <div className="card-title-group">
                      <h2 className="card-title">⚖️ Three-Tier Appellate Architecture & Precedent Engine</h2>
                      <p className="card-desc">District Courts (Trial) &bull; High Courts (Appellate & Writ) &bull; Supreme Court (Apex Precedents)</p>
                    </div>
                  </div>
                  <div className="card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                      <div style={{ background: 'rgba(10, 12, 16, 0.6)', border: '1px solid var(--gold-border)', borderRadius: '8px', padding: '16px' }}>
                        <div style={{ color: '#c8b27a', fontWeight: 600, fontSize: '0.88rem', marginBottom: '6px' }}>
                          🏛️ Court Tiers Enrolled
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
                          Supreme Court of India, Madras High Court, and Chennai District Court are fully registered with jurisdictional boundaries.
                        </p>
                        <button onClick={() => runAnalyticalQuery('1')} className="btn-ghost" style={{ fontSize: '0.75rem', width: '100%' }}>
                          Inspect Caseload by Tier (Q1)
                        </button>
                      </div>

                      <div style={{ background: 'rgba(10, 12, 16, 0.6)', border: '1px solid var(--gold-border)', borderRadius: '8px', padding: '16px' }}>
                        <div style={{ color: '#c084fc', fontWeight: 600, fontSize: '0.88rem', marginBottom: '6px' }}>
                          📜 Recursive Appellate Traversal
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
                          Traces trial decrees to high court appeals using recursive Common Table Expressions (CTE) without data redundancy.
                        </p>
                        <button onClick={() => { setActiveTab('appeals'); }} className="btn-ghost" style={{ fontSize: '0.75rem', width: '100%' }}>
                          View Appellate Lineage (Q3)
                        </button>
                      </div>

                      <div style={{ background: 'rgba(10, 12, 16, 0.6)', border: '1px solid var(--gold-border)', borderRadius: '8px', padding: '16px' }}>
                        <div style={{ color: '#34d399', fontWeight: 600, fontSize: '0.88rem', marginBottom: '6px' }}>
                          🛡️ Automated Case Lifecycle Guard
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
                          Triggers automatically close cases upon judgment pronouncement while rejecting hearings for closed dockets.
                        </p>
                        <button onClick={() => setActiveTab('audit')} className="btn-ghost" style={{ fontSize: '0.75rem', width: '100%' }}>
                          View Procedural Audit Log
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* TAB 2: MASTER DOCKET & CASES */}
            {/* ========================================================== */}
            {activeTab === 'cases' && (
              <div>
                <div className="page-hero">
                  <div>
                    <h1 className="page-title">Judicial Master Docket</h1>
                    <p className="page-subtitle">
                      Complete cross-tier registry of criminal and civil cases, statute charges, hearings and judgment verdicts
                    </p>
                  </div>
                  <div className="page-actions">
                    <button onClick={() => setFilingModalOpen(true)} className="btn-gold">
                      ⚡ File New Case
                    </button>
                  </div>
                </div>

                <div className="card-panel">
                  {/* SEARCH & FILTERS */}
                  <div className="filter-toolbar">
                    <div className="filter-group">
                      <input
                        type="text"
                        placeholder="Filter by ID, Title, Court or Statute..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input"
                        style={{ width: '280px' }}
                      />

                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="form-select"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="Pending">Pending Trials</option>
                        <option value="Closed">Closed & Decreed</option>
                      </select>

                      <select
                        value={filterCourt}
                        onChange={(e) => setFilterCourt(e.target.value)}
                        className="form-select"
                      >
                        <option value="ALL">All Jurisdictions</option>
                        {courts.map((court) => (
                          <option key={court.Court_ID} value={court.Court_Name}>
                            {court.Court_Name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--gold-600)' }}>
                      Showing <b>{filteredDocket.length}</b> of <b>{masterDocket.length}</b> Docket Records
                    </div>
                  </div>

                  <div className="card-body no-padding">
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Case ID</th>
                            <th>Case Title / Action</th>
                            <th>Jurisdictional Court</th>
                            <th>Status</th>
                            <th>Applied Statute Charges</th>
                            <th>Last Hearing</th>
                            <th>Verdict Delivery</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredDocket.map((c) => {
                            const fullCase = cases.find(x => x.Case_ID === c.Case_ID) || c;
                            return (
                              <tr key={c.Case_ID}>
                                <td>
                                  <button
                                    onClick={() => setSelectedCaseForDossier(fullCase)}
                                    className="badge gold"
                                    style={{ cursor: 'pointer', background: 'rgba(200,178,122,0.15)', border: '1px solid var(--gold-500)' }}
                                    title="Inspect Complete Case Dossier"
                                  >
                                    {c.Case_ID}
                                  </button>
                                </td>
                                <td style={{ maxWidth: '280px', fontWeight: 500 }}>{c.Title}</td>
                                <td>{c.Court_Name}</td>
                                <td>
                                  <span className={`badge ${c.Status === 'Closed' ? 'closed' : 'pending'}`}>
                                    {c.Status}
                                  </span>
                                </td>
                                <td>
                                  <span style={{ fontSize: '0.74rem', color: '#c8b27a', fontFamily: 'var(--font-mono)' }}>
                                    {c.Applied_Charges}
                                  </span>
                                </td>
                                <td style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>{c.Last_Hearing_Date}</td>
                                <td>
                                  {c.Judgment_Status === 'No Verdict' ? (
                                    <span style={{ color: 'var(--text-muted)' }}>Pending Decree</span>
                                  ) : (
                                    <span style={{ color: '#34d399', fontWeight: 600 }}>{c.Judgment_Status}</span>
                                  )}
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button
                                      onClick={() => setSelectedCaseForDossier(fullCase)}
                                      className="btn-ghost"
                                      style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                                    >
                                      👁️ Dossier
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCase(c.Case_ID)}
                                      className="btn-danger"
                                      title="Cascading Purge: Deletes parent case, hearings, charges & counsel"
                                    >
                                      Purge
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}

                          {filteredDocket.length === 0 && (
                            <tr>
                              <td colSpan={8}>
                                <div className="empty-state">
                                  <div className="empty-state-icon">⚖️</div>
                                  <div className="empty-state-title">No Docket Records Found</div>
                                  <div className="empty-state-desc">
                                    No records match your active search and filter constraints.
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* TAB 3: HEARINGS & CAUSE LIST */}
            {/* ========================================================== */}
            {activeTab === 'hearings' && (
              <div>
                <div className="page-hero">
                  <div>
                    <h1 className="page-title">Court Proceedings & Bench Cause List</h1>
                    <p className="page-subtitle">
                      Daily cause lists, bench composition rules, and proceedings minutes with lifecycle constraints
                    </p>
                  </div>
                  <div className="page-actions">
                    <button onClick={() => setScheduleModalOpen(true)} className="btn-gold">
                      📅 Schedule Proceeding
                    </button>
                  </div>
                </div>

                <div className="card-panel">
                  <div className="card-header">
                    <div className="card-title-group">
                      <h2 className="card-title">🏛️ Active Cause List ({hearings.length} Proceedings)</h2>
                      <p className="card-desc">Scheduled hearings with presiding magistrates and bench mandates</p>
                    </div>
                  </div>

                  <div className="card-body no-padding">
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Case ID</th>
                            <th>Case Title</th>
                            <th>Hearing Session</th>
                            <th>Bench Constitution</th>
                            <th>Presiding Judge</th>
                            <th>Proceedings Minutes & Orders</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {hearings.map((h, idx) => (
                            <tr key={idx}>
                              <td>
                                <span
                                  className="badge gold"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => {
                                    const match = cases.find(x => x.Case_ID === h.Case_ID);
                                    if (match) setSelectedCaseForDossier(match);
                                  }}
                                >
                                  {h.Case_ID}
                                </span>
                              </td>
                              <td style={{ fontWeight: 500 }}>{h.Case_Title}</td>
                              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#f5eedc' }}>
                                {h.Hearing_Timestamp}
                              </td>
                              <td>
                                <span className="badge gold">{h.Bench_Role || 'Single Judge'}</span>
                              </td>
                              <td style={{ fontWeight: 500 }}>{h.Presiding_Judge}</td>
                              <td style={{ maxWidth: '320px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                {h.Summary_Notes}
                              </td>
                              <td>
                                <button
                                  onClick={() => handleCancelHearing(h.Case_ID, h.Hearing_Timestamp)}
                                  className="btn-danger"
                                >
                                  Cancel
                                </button>
                              </td>
                            </tr>
                          ))}

                          {hearings.length === 0 && (
                            <tr>
                              <td colSpan={7}>
                                <div className="empty-state">
                                  <div className="empty-state-icon">📅</div>
                                  <div className="empty-state-title">No Active Proceedings</div>
                                  <div className="empty-state-desc">Use the Schedule Proceeding button to assign a bench.</div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* TAB 4: JUDGMENTS & DECREES */}
            {/* ========================================================== */}
            {activeTab === 'judgments' && (
              <div>
                <div className="page-hero">
                  <div>
                    <h1 className="page-title">Judgments & Final Decrees Archive</h1>
                    <p className="page-subtitle">
                      Concluded judicial verdicts, ratio decidendi, and duration benchmarks with trigger-enforced auto closure
                    </p>
                  </div>
                  <div className="page-actions">
                    <button onClick={() => setJudgmentModalOpen(true)} className="btn-gold">
                      📜 Deliver Final Decree
                    </button>
                  </div>
                </div>

                <div className="card-panel">
                  <div className="card-header">
                    <div className="card-title-group">
                      <h2 className="card-title">📜 Decrees Archive ({judgments.length} Pronounced)</h2>
                      <p className="card-desc">Case verdicts rendered with duration benchmarks</p>
                    </div>
                  </div>

                  <div className="card-body no-padding">
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Decree Ref</th>
                            <th>Case ID</th>
                            <th>Case Title</th>
                            <th>Verdict Pronounced</th>
                            <th>Duration to Resolution</th>
                            <th>Ratio Decidendi & Judgment Text</th>
                          </tr>
                        </thead>
                        <tbody>
                          {judgments.map((j) => (
                            <tr key={j.Judgment_ID}>
                              <td style={{ fontWeight: 600, color: '#c8b27a', fontFamily: 'var(--font-mono)' }}>
                                {j.Judgment_ID}
                              </td>
                              <td>
                                <span
                                  className="badge gold"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => {
                                    const match = cases.find(x => x.Case_ID === j.Case_ID);
                                    if (match) setSelectedCaseForDossier(match);
                                  }}
                                >
                                  {j.Case_ID}
                                </span>
                              </td>
                              <td style={{ fontWeight: 500 }}>{j.Case_Title}</td>
                              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{j.Verdict_Date}</td>
                              <td>
                                <span style={{ color: '#34d399', fontWeight: 600 }}>
                                  {j.Days_To_Resolution !== null ? `${j.Days_To_Resolution} Days` : '—'}
                                </span>
                              </td>
                              <td style={{ maxWidth: '420px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {j.Judgment_Text}
                              </td>
                            </tr>
                          ))}

                          {judgments.length === 0 && (
                            <tr>
                              <td colSpan={6}>
                                <div className="empty-state">
                                  <div className="empty-state-icon">📜</div>
                                  <div className="empty-state-title">No Concluded Judgments</div>
                                  <div className="empty-state-desc">Use Deliver Final Decree to conclude pending dockets.</div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* TAB 5: APPEALS & LINEAGE */}
            {/* ========================================================== */}
            {activeTab === 'appeals' && (
              <div>
                <div className="page-hero">
                  <div>
                    <h1 className="page-title">Appellate Lineage & Hierarchy Traversal</h1>
                    <p className="page-subtitle">
                      Tracking appellate transfers and hierarchical challenges from Trial Courts to High Courts
                    </p>
                  </div>
                  <div className="page-actions">
                    <button onClick={() => runAnalyticalQuery('3')} className="btn-secondary">
                      🔄 Run Recursive CTE (Q3)
                    </button>
                  </div>
                </div>

                <div className="card-panel">
                  <div className="card-header">
                    <div className="card-title-group">
                      <h2 className="card-title">⚖️ Appellate Docket Lineage</h2>
                      <p className="card-desc">Cases with registered Parent Case references linking lower and higher judicial tiers</p>
                    </div>
                  </div>

                  <div className="card-body no-padding">
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Appeal Case ID</th>
                            <th>Appeal Title</th>
                            <th>Appellate Court</th>
                            <th>Parent Originating Docket</th>
                            <th>Filing Date</th>
                            <th>Current Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appeals.map((app) => (
                            <tr key={app.Case_ID}>
                              <td>
                                <span className="badge appeal" style={{ fontWeight: 600 }}>{app.Case_ID}</span>
                              </td>
                              <td style={{ fontWeight: 600 }}>{app.Title}</td>
                              <td>{app.Court_Name} ({app.Tier_Level})</td>
                              <td>
                                {app.Parent_Case_ID ? (
                                  <span style={{ color: '#c8b27a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span>↳ {app.Parent_Case_ID}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({app.Parent_Case_Title})</span>
                                  </span>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)' }}>Original Jurisdiction</span>
                                )}
                              </td>
                              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{app.Filing_Date}</td>
                              <td>
                                <span className={`badge ${app.Status === 'Closed' ? 'closed' : 'pending'}`}>
                                  {app.Status}
                                </span>
                              </td>
                              <td>
                                <button
                                  onClick={() => {
                                    const match = cases.find(x => x.Case_ID === app.Case_ID);
                                    if (match) setSelectedCaseForDossier(match);
                                  }}
                                  className="btn-ghost"
                                  style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                                >
                                  View Dossier
                                </button>
                              </td>
                            </tr>
                          ))}

                          {appeals.length === 0 && (
                            <tr>
                              <td colSpan={7}>
                                <div className="empty-state">
                                  <div className="empty-state-icon">⚖️</div>
                                  <div className="empty-state-title">No Registered Appeals</div>
                                  <div className="empty-state-desc">Appellate dockets will appear when parent cases are challenged.</div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* LINEAGE STEPPER DEMONSTRATION */}
                <div className="card-panel">
                  <div className="card-header">
                    <h3 className="card-title">Appellate Transfer Hierarchy: Case 2001 Lineage</h3>
                  </div>
                  <div className="card-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                      <div style={{ background: 'rgba(12,15,20,0.8)', border: '1px solid var(--gold-border)', borderRadius: '8px', padding: '16px', flex: 1, minWidth: '220px' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--gold-600)', textTransform: 'uppercase', fontWeight: 600 }}>Level 2 &bull; Originating Trial</div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f5eedc', marginTop: '4px' }}>CASE_1001</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Chennai District Court &bull; State vs. Ram</div>
                        <span className="badge pending" style={{ marginTop: '8px' }}>Trial Concluded</span>
                      </div>

                      <div style={{ fontSize: '1.5rem', color: 'var(--gold-500)' }}>&rarr;</div>

                      <div style={{ background: 'rgba(12,15,20,0.8)', border: '1px solid var(--gold-500)', borderRadius: '8px', padding: '16px', flex: 1, minWidth: '220px', boxShadow: '0 0 16px var(--gold-glow)' }}>
                        <div style={{ fontSize: '0.72rem', color: '#c084fc', textTransform: 'uppercase', fontWeight: 600 }}>Level 1 &bull; First Appeal</div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f5eedc', marginTop: '4px' }}>CASE_2001</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Madras High Court &bull; Ram vs. State (Appeal)</div>
                        <span className="badge pending" style={{ marginTop: '8px' }}>Appellate Admission</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* TAB 6: PRECEDENTS & COUNSEL */}
            {/* ========================================================== */}
            {activeTab === 'precedents' && (
              <div>
                <div className="page-hero">
                  <div>
                    <h1 className="page-title">Precedent Engine & Counsel Matrix</h1>
                    <p className="page-subtitle">
                      Binding jurisprudence citation, ratio decidendi mapping, and Bar Council advocate assignments
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '24px' }}>
                  {/* LINK PRECEDENT FORM */}
                  <div className="card-panel">
                    <div className="card-header">
                      <div className="card-title-group">
                        <h2 className="card-title">📚 Cite Legal Precedent</h2>
                        <p className="card-desc">Invokes stored procedure <code style={{ color: '#c8b27a' }}>Cite_Precedent</code> to link ratio</p>
                      </div>
                    </div>

                    <div className="card-body">
                      <form onSubmit={handleCitePrecedent}>
                        <div className="form-group" style={{ marginBottom: '14px' }}>
                          <label className="form-label">Citation Code</label>
                          <input
                            type="text"
                            required
                            value={precedentForm.Citation_ID}
                            onChange={(e) => setPrecedentForm({ ...precedentForm, Citation_ID: e.target.value })}
                            className="form-input"
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: '14px' }}>
                          <label className="form-label">Citing Active Case</label>
                          <select
                            value={precedentForm.Citing_Case_ID}
                            onChange={(e) => setPrecedentForm({ ...precedentForm, Citing_Case_ID: e.target.value })}
                            className="form-select"
                          >
                            {cases.map((c) => (
                              <option key={c.Case_ID} value={c.Case_ID}>
                                {c.Case_ID} — {c.Title}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: '14px' }}>
                          <label className="form-label">Cited Authority Precedent</label>
                          <select
                            value={precedentForm.Cited_Precedent_Case_ID}
                            onChange={(e) => setPrecedentForm({ ...precedentForm, Cited_Precedent_Case_ID: e.target.value })}
                            className="form-select"
                          >
                            {cases.map((c) => (
                              <option key={c.Case_ID} value={c.Case_ID}>
                                {c.Case_ID} — {c.Title} ({c.Status})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: '18px' }}>
                          <label className="form-label">Ratio Decidendi Relevance Statement</label>
                          <input
                            type="text"
                            required
                            value={precedentForm.Relevance_Note}
                            onChange={(e) => setPrecedentForm({ ...precedentForm, Relevance_Note: e.target.value })}
                            className="form-input"
                          />
                        </div>

                        <button type="submit" className="btn-gold">
                          📚 Cite Precedent in Docket
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* ASSIGN ADVOCATE FORM */}
                  <div className="card-panel">
                    <div className="card-header">
                      <div className="card-title-group">
                        <h2 className="card-title">👔 Assign Counsel to Litigant</h2>
                        <p className="card-desc">Invokes procedure <code style={{ color: '#c8b27a' }}>Assign_Counsel_To_Party</code> with license check</p>
                      </div>
                    </div>

                    <div className="card-body">
                      <form onSubmit={handleAssignCounsel}>
                        <div className="form-group" style={{ marginBottom: '14px' }}>
                          <label className="form-label">Assignment ID</label>
                          <input
                            type="text"
                            required
                            value={counselForm.Counsel_ID}
                            onChange={(e) => setCounselForm({ ...counselForm, Counsel_ID: e.target.value })}
                            className="form-input"
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: '14px' }}>
                          <label className="form-label">Enrolled Advocate</label>
                          <select
                            value={counselForm.Lawyer_ID}
                            onChange={(e) => setCounselForm({ ...counselForm, Lawyer_ID: e.target.value })}
                            className="form-select"
                          >
                            {lawyers.map((l) => (
                              <option key={l.Entity_ID} value={l.Entity_ID}>
                                {l.First_Name} {l.Last_Name} ({l.Specialization} &bull; {l.Firm_Name})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: '14px' }}>
                          <label className="form-label">Litigant Party ID</label>
                          <input
                            type="text"
                            required
                            value={counselForm.Party_ID}
                            onChange={(e) => setCounselForm({ ...counselForm, Party_ID: e.target.value })}
                            className="form-input"
                          />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                          <input
                            type="checkbox"
                            id="leadFlag2"
                            checked={counselForm.Lead_Counsel_Flag}
                            onChange={(e) => setCounselForm({ ...counselForm, Lead_Counsel_Flag: e.target.checked })}
                          />
                          <label htmlFor="leadFlag2" style={{ fontSize: '0.82rem', color: '#e5e0d4' }}>
                            Designate as Lead Counsel for Proceeding
                          </label>
                        </div>

                        <button type="submit" className="btn-gold">
                          Assign Counsel
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* ACTIVE PRECEDENT CITATIONS TABLE */}
                <div className="card-panel">
                  <div className="card-header">
                    <div className="card-title-group">
                      <h2 className="card-title">📖 Active Case Precedents Matrix ({precedents.length})</h2>
                      <p className="card-desc">Binding citations linked across trial and appellate dockets</p>
                    </div>
                  </div>

                  <div className="card-body no-padding">
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Citation Code</th>
                            <th>Citing Docket</th>
                            <th>Cited Authority Precedent</th>
                            <th>Relevance Ratio Decidendi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {precedents.map((cit) => (
                            <tr key={cit.Citation_ID}>
                              <td style={{ fontWeight: 600, color: '#c8b27a', fontFamily: 'var(--font-mono)' }}>
                                {cit.Citation_ID}
                              </td>
                              <td style={{ fontWeight: 600 }}>
                                {cit.Citing_Case_ID}: {cit.Citing_Case_Title}
                              </td>
                              <td style={{ color: '#c084fc', fontWeight: 600 }}>
                                {cit.Cited_Precedent_Case_ID}: {cit.Cited_Precedent_Title}
                              </td>
                              <td style={{ maxWidth: '380px', fontSize: '0.8rem' }}>{cit.Relevance_Note}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* TAB 7: AUDIT TRAIL & ANALYTICS (Q1 - Q15) */}
            {/* ========================================================== */}
            {activeTab === 'audit' && (
              <div>
                <div className="page-hero">
                  <div>
                    <h1 className="page-title">Forensic Audit Trail & Analytical Intelligence</h1>
                    <p className="page-subtitle">
                      Chronological court registry audit stream alongside 15 deep analytical queries (Q1–Q15)
                    </p>
                  </div>
                </div>

                {/* ANALYTICAL QUERY SELECTOR */}
                <div className="card-panel">
                  <div className="card-header">
                    <div className="card-title-group">
                      <h2 className="card-title">📊 Analytical Query Intelligence (Q1 – Q15)</h2>
                      <p className="card-desc">Execute complex recursive, subquery, aggregate and window queries on active MySQL engine</p>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="query-tab-grid">
                      {[
                        { id: '1', title: 'Q1: Caseload by Court Tier', desc: 'Tier distribution' },
                        { id: '2', title: 'Q2: Active Lawyer Roster', desc: 'Client representations' },
                        { id: '3', title: 'Q3: Appellate Lineage', desc: 'Recursive CTE hierarchy' },
                        { id: '4', title: 'Q4: Hearing Audit & Benches', desc: 'Judge history log' },
                        { id: '5', title: 'Q5: Resolution Duration', desc: 'Days to final decree' },
                        { id: '6', title: 'Q6: Active Trial Dockets', desc: 'Subquery filter' },
                        { id: '7', title: 'Q7: Double Jeopardy Risk', desc: 'Duplicate statute charges' },
                        { id: '8', title: 'Q8: Precedent Engine', desc: 'Most cited case laws' },
                        { id: '9', title: 'Q9: Legal Taxonomy Search', desc: 'Precedent keyword tags' },
                        { id: '10', title: 'Q10: Master Docket Join', desc: '6-way cross module join' },
                        { id: '11', title: 'Q11: Stalled Dockets', desc: 'Inactive pending trials' },
                        { id: '12', title: 'Q12: Bail Outlier Analysis', desc: 'Above-average bail variance' },
                        { id: '13', title: 'Q13: Judicial Clearance Rate', desc: 'Disposal percentage' },
                        { id: '14', title: 'Q14: Procedural Bottlenecks', desc: 'Hearings without decree' },
                        { id: '15', title: 'Q15: Lawyer Specialty Rank', desc: 'Window DENSE_RANK()' }
                      ].map((q) => (
                        <button
                          key={q.id}
                          onClick={() => runAnalyticalQuery(q.id)}
                          className={`query-chip ${selectedQueryId === q.id ? 'selected' : ''}`}
                        >
                          <span className="query-chip-title">{q.title}</span>
                          <span className="query-chip-desc">{q.desc}</span>
                        </button>
                      ))}
                    </div>

                    {/* QUERY RESULT VIEWER */}
                    {queryLoading ? (
                      <div className="loading-state">
                        <div className="loading-spinner" />
                        <div>Executing query on database engine...</div>
                      </div>
                    ) : queryResult ? (
                      <div style={{ marginTop: '20px', borderTop: '1px solid var(--gold-border)', paddingTop: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: '#f5eedc' }}>
                              {queryResult.title}
                            </h3>
                            <div style={{ fontSize: '0.82rem', color: 'var(--gold-600)', marginTop: '2px' }}>
                              {queryResult.description} &bull; Executed via <b style={{ color: '#f1e6c6' }}>{queryResult.source}</b>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {queryResult.sql && (
                              <button
                                onClick={() => setShowSqlPreview(!showSqlPreview)}
                                className="btn-ghost"
                                style={{ fontSize: '0.74rem' }}
                              >
                                {showSqlPreview ? 'Hide SQL' : 'View SQL Query'}
                              </button>
                            )}
                            <span className="status-chip online">{queryResult.data?.length || 0} Records</span>
                          </div>
                        </div>

                        {showSqlPreview && queryResult.sql && (
                          <pre style={{ background: '#07090b', border: '1px solid var(--gold-border)', borderRadius: '6px', padding: '12px', fontSize: '0.74rem', color: '#c8b27a', overflowX: 'auto', marginBottom: '16px', fontFamily: 'var(--font-mono)' }}>
                            {queryResult.sql.trim()}
                          </pre>
                        )}

                        <div className="table-container">
                          <table className="custom-table">
                            <thead>
                              <tr>
                                {queryResult.data && queryResult.data.length > 0 ? (
                                  Object.keys(queryResult.data[0]).map((key) => (
                                    <th key={key}>{key.replace(/_/g, ' ')}</th>
                                  ))
                                ) : (
                                  <th>Result</th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {queryResult.data && queryResult.data.length > 0 ? (
                                queryResult.data.map((row: any, i: number) => (
                                  <tr key={i}>
                                    {Object.values(row).map((val: any, j: number) => (
                                      <td key={j}>
                                        {val === null || val === undefined ? (
                                          <span style={{ color: 'var(--text-faint)' }}>NULL</span>
                                        ) : typeof val === 'number' ? (
                                          <span style={{ color: '#c8b27a', fontWeight: 600 }}>{val}</span>
                                        ) : (
                                          String(val)
                                        )}
                                      </td>
                                    ))}
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td style={{ textAlign: 'center', padding: '24px' }}>No records returned.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* CHRONOLOGICAL AUDIT TRAIL STREAM */}
                <div className="card-panel">
                  <div className="card-header">
                    <div className="card-title-group">
                      <h2 className="card-title">🛡️ Chronological Proceedings Audit Stream ({auditTrail.length})</h2>
                      <p className="card-desc">Immutable event record of filings, hearing sessions and verdict deliveries</p>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="timeline-list">
                      {auditTrail.map((ev, i) => (
                        <div key={i} className="timeline-item">
                          <div className="timeline-marker">
                            {ev.Event_Type === 'HEARING_SESSION' && '📅'}
                            {ev.Event_Type === 'JUDGMENT_PRONOUNCED' && '📜'}
                            {ev.Event_Type === 'CASE_FILED' && '⚡'}
                          </div>
                          <div className="timeline-content">
                            <div className="timeline-header">
                              <span className="timeline-title">
                                {ev.Event_Type.replace(/_/g, ' ')} &bull; {ev.Case_ID}
                              </span>
                              <span className="timeline-time">{ev.Event_Timestamp}</span>
                            </div>
                            <div className="timeline-details">{ev.Details}</div>
                            <div className="timeline-actor">
                              <span>Actor:</span>
                              <b style={{ color: '#f5eedc' }}>{ev.Actor_Name}</b>
                              <span>({ev.Actor_Role})</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ========================================================== */}
      {/* MODAL: CASE DOSSIER DETAIL VIEW */}
      {/* ========================================================== */}
      {selectedCaseForDossier && (
        <div className="modal-backdrop" onClick={() => setSelectedCaseForDossier(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="badge gold">{selectedCaseForDossier.Case_ID}</span>
                <h3 className="modal-title">Case Dossier & Lifecycle Records</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedCaseForDossier(null)}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#f5eedc', marginBottom: '4px' }}>
                  {selectedCaseForDossier.Title}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {selectedCaseForDossier.Court_Name} ({selectedCaseForDossier.Tier_Level || 'Trial Court'}) &bull; Filed on {selectedCaseForDossier.Filing_Date}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(8,10,13,0.8)', border: '1px solid var(--gold-border)', borderRadius: '6px', padding: '10px 14px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--gold-600)', textTransform: 'uppercase' }}>Classification</div>
                  <div style={{ fontWeight: 600, marginTop: '2px' }}>{selectedCaseForDossier.Case_Category || 'Criminal'}</div>
                </div>

                <div style={{ background: 'rgba(8,10,13,0.8)', border: '1px solid var(--gold-border)', borderRadius: '6px', padding: '10px 14px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--gold-600)', textTransform: 'uppercase' }}>Docket Status</div>
                  <div style={{ marginTop: '2px' }}>
                    <span className={`badge ${selectedCaseForDossier.Status === 'Closed' ? 'closed' : 'pending'}`}>
                      {selectedCaseForDossier.Status}
                    </span>
                  </div>
                </div>

                {selectedCaseForDossier.Parent_Case_ID && (
                  <div style={{ background: 'rgba(8,10,13,0.8)', border: '1px solid var(--gold-border)', borderRadius: '6px', padding: '10px 14px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--gold-600)', textTransform: 'uppercase' }}>Appellate Parent</div>
                    <div style={{ fontWeight: 600, color: '#c084fc', marginTop: '2px' }}>{selectedCaseForDossier.Parent_Case_ID}</div>
                  </div>
                )}
              </div>

              {/* CRIMINAL SPECIFICS */}
              {(selectedCaseForDossier.FIR_Or_Complaint_No || selectedCaseForDossier.Bail_Amount !== undefined) && (
                <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '14px', marginBottom: '18px' }}>
                  <div style={{ color: '#f87171', fontWeight: 600, fontSize: '0.82rem', marginBottom: '6px' }}>
                    🛡️ Criminal Subclass Specifics
                  </div>
                  <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div><b>FIR / Complaint No:</b> {selectedCaseForDossier.FIR_Or_Complaint_No || 'N/A'}</div>
                    <div><b>Bail Amount:</b> ₹{Number(selectedCaseForDossier.Bail_Amount || 0).toLocaleString()}</div>
                    <div><b>Arresting Agency:</b> {selectedCaseForDossier.Arresting_Agency || 'State Police'}</div>
                  </div>
                </div>
              )}

              {/* CIVIL SPECIFICS */}
              {selectedCaseForDossier.Dispute_Value && (
                <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px', padding: '14px', marginBottom: '18px' }}>
                  <div style={{ color: '#60a5fa', fontWeight: 600, fontSize: '0.82rem', marginBottom: '6px' }}>
                    ⚖️ Civil Dispute Specifics
                  </div>
                  <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div><b>Suit Type:</b> {selectedCaseForDossier.Civil_Case_Type}</div>
                    <div><b>Dispute Claim Value:</b> ₹{Number(selectedCaseForDossier.Dispute_Value).toLocaleString()}</div>
                  </div>
                </div>
              )}

              {/* LINKED HEARINGS */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontWeight: 600, color: '#c8b27a', fontSize: '0.88rem', marginBottom: '8px' }}>
                  Hearing History for this Docket
                </div>
                {hearings.filter(h => h.Case_ID === selectedCaseForDossier.Case_ID).length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {hearings.filter(h => h.Case_ID === selectedCaseForDossier.Case_ID).map((h, i) => (
                      <div key={i} style={{ background: 'rgba(12,15,20,0.8)', border: '1px solid var(--gold-border)', borderRadius: '6px', padding: '10px 12px', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f5eedc', fontWeight: 500 }}>
                          <span>{h.Hearing_Timestamp}</span>
                          <span className="badge gold">{h.Bench_Role}</span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{h.Summary_Notes}</div>
                        <div style={{ color: 'var(--gold-600)', fontSize: '0.72rem', marginTop: '4px' }}>Presiding: {h.Presiding_Judge}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No hearings recorded yet.</div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => {
                  setHearingForm({ ...hearingForm, Case_ID: selectedCaseForDossier.Case_ID });
                  setSelectedCaseForDossier(null);
                  setScheduleModalOpen(true);
                }}
                className="btn-secondary"
              >
                📅 Schedule Hearing
              </button>
              <button
                onClick={() => {
                  setJudgmentForm({ ...judgmentForm, Case_ID: selectedCaseForDossier.Case_ID });
                  setSelectedCaseForDossier(null);
                  setJudgmentModalOpen(true);
                }}
                className="btn-secondary"
              >
                📜 Deliver Verdict
              </button>
              <button
                onClick={() => handleDeleteCase(selectedCaseForDossier.Case_ID)}
                className="btn-danger"
              >
                Purge Docket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL: CASE FILING WORKFLOW */}
      {/* ========================================================== */}
      {filingModalOpen && (
        <div className="modal-backdrop" onClick={() => setFilingModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">⚡ Case Registration Workflow</h3>
              <button className="modal-close-btn" onClick={() => setFilingModalOpen(false)}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => setFilingSubtype('criminal')}
                  className={`btn-ghost ${filingSubtype === 'criminal' ? 'btn-gold' : ''}`}
                  style={{ flex: 1 }}
                >
                  🔴 Criminal Case
                </button>
                <button
                  type="button"
                  onClick={() => setFilingSubtype('civil')}
                  className={`btn-ghost ${filingSubtype === 'civil' ? 'btn-gold' : ''}`}
                  style={{ flex: 1 }}
                >
                  🔵 Civil Dispute Suit
                </button>
              </div>

              {filingSubtype === 'criminal' ? (
                <form onSubmit={handleRegisterCriminal}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Case Identifier</label>
                      <input
                        type="text"
                        required
                        value={crimForm.Case_ID}
                        onChange={(e) => setCrimForm({ ...crimForm, Case_ID: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Jurisdictional Court</label>
                      <select
                        value={crimForm.Court_ID}
                        onChange={(e) => setCrimForm({ ...crimForm, Court_ID: e.target.value })}
                        className="form-select"
                      >
                        {courts.map((court) => (
                          <option key={court.Court_ID} value={court.Court_ID}>
                            {court.Court_Name} ({court.Tier_Level})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Parent Case (If Appeal)</label>
                      <input
                        type="text"
                        placeholder="e.g. CASE_1001"
                        value={crimForm.Parent_Case_ID}
                        onChange={(e) => setCrimForm({ ...crimForm, Parent_Case_ID: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Filing Date</label>
                      <input
                        type="date"
                        required
                        value={crimForm.Filing_Date}
                        onChange={(e) => setCrimForm({ ...crimForm, Filing_Date: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Case Title / Cause of Action</label>
                      <input
                        type="text"
                        required
                        placeholder="State vs. Accused Party"
                        value={crimForm.Title}
                        onChange={(e) => setCrimForm({ ...crimForm, Title: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">FIR / Police Reference</label>
                      <input
                        type="text"
                        value={crimForm.FIR_Or_Complaint_No}
                        onChange={(e) => setCrimForm({ ...crimForm, FIR_Or_Complaint_No: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Bail Amount (INR)</label>
                      <input
                        type="number"
                        min="0"
                        value={crimForm.Bail_Amount}
                        onChange={(e) => setCrimForm({ ...crimForm, Bail_Amount: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Arresting Agency</label>
                      <input
                        type="text"
                        value={crimForm.Arresting_Agency}
                        onChange={(e) => setCrimForm({ ...crimForm, Arresting_Agency: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button type="button" onClick={() => setFilingModalOpen(false)} className="btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn-gold">
                      ⚡ Atomically File Criminal Case
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegisterCivil}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Case Identifier</label>
                      <input
                        type="text"
                        required
                        value={civForm.Case_ID}
                        onChange={(e) => setCivForm({ ...civForm, Case_ID: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Jurisdictional Court</label>
                      <select
                        value={civForm.Court_ID}
                        onChange={(e) => setCivForm({ ...civForm, Court_ID: e.target.value })}
                        className="form-select"
                      >
                        {courts.map((court) => (
                          <option key={court.Court_ID} value={court.Court_ID}>
                            {court.Court_Name} ({court.Tier_Level})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Parent Case (If Appeal)</label>
                      <input
                        type="text"
                        placeholder="e.g. CASE_3001"
                        value={civForm.Parent_Case_ID}
                        onChange={(e) => setCivForm({ ...civForm, Parent_Case_ID: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Filing Date</label>
                      <input
                        type="date"
                        required
                        value={civForm.Filing_Date}
                        onChange={(e) => setCivForm({ ...civForm, Filing_Date: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Suit Designation</label>
                      <input
                        type="text"
                        required
                        placeholder="Petitioner vs. Respondent Entity"
                        value={civForm.Title}
                        onChange={(e) => setCivForm({ ...civForm, Title: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Dispute Value (INR)</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={civForm.Dispute_Value}
                        onChange={(e) => setCivForm({ ...civForm, Dispute_Value: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Civil Suit Type</label>
                      <select
                        value={civForm.Civil_Case_Type}
                        onChange={(e) => setCivForm({ ...civForm, Civil_Case_Type: e.target.value })}
                        className="form-select"
                      >
                        <option value="Contract Breach">Contract Breach</option>
                        <option value="Property Partition">Property Partition</option>
                        <option value="Intellectual Property">Intellectual Property</option>
                        <option value="Corporate Insolvency">Corporate Insolvency</option>
                        <option value="Tort & Defamation">Tort & Defamation</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button type="button" onClick={() => setFilingModalOpen(false)} className="btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn-gold">
                      ⚡ Atomically File Civil Suit
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL: SCHEDULE PROCEEDING */}
      {/* ========================================================== */}
      {scheduleModalOpen && (
        <div className="modal-backdrop" onClick={() => setScheduleModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">📅 Schedule Court Proceeding & Assign Bench</h3>
              <button className="modal-close-btn" onClick={() => setScheduleModalOpen(false)}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleScheduleHearing}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Target Case</label>
                    <select
                      value={hearingForm.Case_ID}
                      onChange={(e) => setHearingForm({ ...hearingForm, Case_ID: e.target.value })}
                      className="form-select"
                    >
                      {cases.map((c) => (
                        <option key={c.Case_ID} value={c.Case_ID}>
                          {c.Case_ID} — {c.Title} ({c.Status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hearing Date & Time</label>
                    <input
                      type="text"
                      placeholder="YYYY-MM-DD HH:MM:SS"
                      required
                      value={hearingForm.Hearing_Timestamp}
                      onChange={(e) => setHearingForm({ ...hearingForm, Hearing_Timestamp: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Presiding Judge</label>
                    <select
                      value={hearingForm.Judge_ID}
                      onChange={(e) => setHearingForm({ ...hearingForm, Judge_ID: e.target.value })}
                      className="form-select"
                    >
                      {judges.map((j) => (
                        <option key={j.Entity_ID} value={j.Entity_ID}>
                          {j.First_Name} {j.Last_Name} ({j.Judicial_ID})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bench Composition Role</label>
                    <select
                      value={hearingForm.Bench_Role}
                      onChange={(e) => setHearingForm({ ...hearingForm, Bench_Role: e.target.value })}
                      className="form-select"
                    >
                      <option value="Single Judge">Single Judge</option>
                      <option value="Division Bench Lead">Division Bench Lead</option>
                      <option value="Associate Judge">Associate Judge</option>
                      <option value="Full Bench">Full Bench</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Proceedings Agenda & Summary Notes</label>
                    <textarea
                      required
                      value={hearingForm.Summary_Notes}
                      onChange={(e) => setHearingForm({ ...hearingForm, Summary_Notes: e.target.value })}
                      className="form-textarea"
                    />
                  </div>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => setScheduleModalOpen(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-gold">
                    📅 Schedule Proceeding
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL: DELIVER JUDGMENT */}
      {/* ========================================================== */}
      {judgmentModalOpen && (
        <div className="modal-backdrop" onClick={() => setJudgmentModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">📜 Pronounce Final Verdict & Close Case</h3>
              <button className="modal-close-btn" onClick={() => setJudgmentModalOpen(false)}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleRecordJudgment}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Judgment Reference ID</label>
                    <input
                      type="text"
                      required
                      value={judgmentForm.Judgment_ID}
                      onChange={(e) => setJudgmentForm({ ...judgmentForm, Judgment_ID: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Adjudicated Case</label>
                    <select
                      value={judgmentForm.Case_ID}
                      onChange={(e) => setJudgmentForm({ ...judgmentForm, Case_ID: e.target.value })}
                      className="form-select"
                    >
                      {cases.map((c) => (
                        <option key={c.Case_ID} value={c.Case_ID}>
                          {c.Case_ID} — {c.Title} ({c.Status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Verdict Pronouncement Date</label>
                    <input
                      type="date"
                      required
                      value={judgmentForm.Verdict_Date}
                      onChange={(e) => setJudgmentForm({ ...judgmentForm, Verdict_Date: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Judgment Legal Text & Ratio Decidendi</label>
                    <textarea
                      required
                      placeholder="State findings of fact, statutes evaluated, and sentencing or decree..."
                      value={judgmentForm.Judgment_Text}
                      onChange={(e) => setJudgmentForm({ ...judgmentForm, Judgment_Text: e.target.value })}
                      className="form-textarea"
                    />
                  </div>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => setJudgmentModalOpen(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-gold">
                    ⚖️ Pronounce Verdict & Trigger Auto-Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
