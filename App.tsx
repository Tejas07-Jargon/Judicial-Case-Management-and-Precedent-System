import { useState, useEffect } from 'react';
import { Scale, Database, Search, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

// --- ORIGINAL SPLASH COMPONENTS RETAINED ---
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
  useEffect(() => {
    // Exactly matches the CSS timeline duration before transitioning
    const timer = setTimeout(onComplete, 10000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <section className="splash" aria-label="Application loading" onClick={onComplete} style={{ cursor: 'pointer' }}>
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

      <div className="document-ghost document-left"><i /><i /><i /><i /></div>
      <div className="document-ghost document-right"><i /><i /><i /><i /></div>

      <div className="particles" aria-hidden="true">
        {particles.map((particle, index) => (
          <span key={index} style={{ left: particle.x, top: particle.y, animationDelay: particle.delay, animationDuration: particle.duration }} />
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
            <span className="loading-context">Case records <b>•</b> Judgments <b>•</b> Appeals <b>•</b> Precedents</span>
            <div className="progress-track"><span /></div>
          </div>
        </div>
      </main>
    </section>
  );
}

// --- NEW APPLICATION VIEWS ---

function MainMenu({ setView }: { setView: (v: string) => void }) {
  return (
    <div className="main-container view-fade-in">
      <div className="header-logo">
        <Scale />
        <h2>Judicial Nexus</h2>
      </div>
      <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 40px' }}>
        <p style={{ color: 'rgba(218,211,193,0.8)', marginBottom: '40px', letterSpacing: '0.05em' }}>
          Select a secure module to interface with the central legal repository.
        </p>
        <div className="menu-grid" style={{ margin: '0 auto' }}>
          <button className="btn-gold" onClick={() => setView('add')}>
            <Database size={24} /> Add Records (Guided)
          </button>
          <button className="btn-gold" onClick={() => setView('fetch')}>
            <Search size={24} /> Fetch Queries
          </button>
        </div>
      </div>
    </div>
  );
}

function AddRecord({ setView }: { setView: (v: string) => void }) {
  const [status, setStatus] = useState<{type: 'error'|'success', msg: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [workflow, setWorkflow] = useState<'criminal' | 'civil' | 'hearing' | 'judgment' | 'update' | 'delete' | 'counsel' | 'cite' | 'cancel_hearing' | 'withdraw_counsel' | 'drop_charge' | 'strike_precedent'>('criminal');


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const endpointMap: any = {
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
      // Destructure the correct URL and HTTP method based on the selected tab
      const { url, method } = endpointMap[workflow];
      
      const res = await fetch(url, {
        method: method, // Dynamically use POST, PUT, or DELETE
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Validation failed');
      setStatus({ type: 'success', msg: data.message });
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="main-container view-fade-in">
      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button className="btn-outline" onClick={() => setView('menu')}>
           <ArrowLeft size={16} style={{display:'inline', verticalAlign:'middle', marginRight:'6px'}}/> Back
        </button>
      </div>

      <div className="glass-panel">
        <h3 style={{ margin: '0 0 24px 0', fontSize: '20px', letterSpacing: '0.05em' }}>
          Record Management System (PL/SQL)
        </h3>
        
        {status?.type === 'error' && (
          <div className="banner-error"><AlertCircle size={20}/> {status.msg}</div>
        )}
        {status?.type === 'success' && (
          <div className="banner-success"><CheckCircle2 size={20}/> {status.msg}</div>
        )}

        {/* Dynamic Workflow Toggle */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {([
            'criminal', 'civil', 'hearing', 'judgment', 
            'counsel', 'cite', 'update', 'delete',
            'cancel_hearing', 'withdraw_counsel', 'drop_charge', 'strike_precedent'
          ] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => { setWorkflow(type); setStatus(null); }}
              style={{
                padding: '8px 12px',
                background: workflow === type ? '#c3aa72' : 'transparent',
                color: workflow === type ? '#1a1a1a' : '#c3aa72',
                border: '1px solid #c3aa72',
                borderRadius: '4px',
                textTransform: 'capitalize',
                cursor: 'pointer',
                fontWeight: workflow === type ? 'bold' : 'normal',
                fontSize: '13px'
              }}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          {/* Shared Case Fields (Both Criminal and Civil) */}
          {(workflow === 'criminal' || workflow === 'civil') && (
            <>
              <div className="input-group">
                <label>Case ID</label>
                <input name="case_id" className="input-field" required placeholder="e.g. CASE_5001" />
              </div>
              <div className="input-group">
                <label>Court ID</label>
                <input name="court_id" className="input-field" required placeholder="e.g. CRT_DC_CHN" />
              </div>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Case Title</label>
                <input name="title" className="input-field" required placeholder="State vs. Defendant Name" />
              </div>
              <div className="input-group">
                <label>Filing Date</label>
                {/* Dynamically names the field 'date' for the original Criminal route compatibility */}
                <input name={workflow === 'criminal' ? "date" : "filing_date"} type="date" className="input-field" required />
              </div>
            </>
          )}

          {/* Criminal-Only Fields */}
          {workflow === 'criminal' && (
            <>
              <div className="input-group">
                <label>FIR Number</label>
                <input name="fir" className="input-field" required />
              </div>
              <div className="input-group">
                <label>Bail Amount (₹)</label>
                <input name="bail" type="number" step="0.01" min="0" className="input-field" required />
              </div>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Arresting Agency</label>
                <input name="agency" className="input-field" required />
              </div>
            </>
          )}

          {/* Civil-Only Fields */}
          {workflow === 'civil' && (
            <>
              <div className="input-group">
                <label>Claim Amount (₹)</label>
                <input name="claim_amount" type="number" step="0.01" min="0" className="input-field" required placeholder="e.g. 50000" />
              </div>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Dispute Category</label>
                <input name="dispute_category" className="input-field" required placeholder="e.g. Property Dispute" />
              </div>
            </>
          )}

          {/* Hearing Fields */}
          {workflow === 'hearing' && (
            <>
              <div className="input-group">
                <label>Bench ID</label>
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
                <label>Summary Notes</label>
                <input name="summary_notes" className="input-field" required placeholder="e.g. Room 4B" />
              </div>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Judge ID</label>
                <input name="judge_id" className="input-field" required placeholder="e.g. JDG_001" />
              </div>
            </>
          )}

          {/* Judgment Fields */}
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
              <div className="input-group">
                <label>Verdict Date</label>
                <input name="verdict_date" type="date" className="input-field" required />
              </div>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Judgment Text</label>
                <textarea name="judgment_text" className="input-field" rows={4} required placeholder="Enter the final verdict..." style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
            </>
          )}

          {/* Explicit Update Workflow */}
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

          {/* Explicit Delete Workflow */}
          {workflow === 'delete' && (
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label>Target Case ID to Withdraw</label>
              <input name="case_id" className="input-field" required placeholder="e.g. CASE_3001" />
              <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '8px' }}>
                Warning: ON DELETE CASCADE will erase all associated hearings, judgments, and parties.
              </p>
            </div>
          )}

                    {/* Explicit Assign Counsel Workflow */}
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
                <label>Lead Counsel Designation</label>
                <select name="is_lead" className="input-field" required>
                  <option value="true">Yes - Lead Counsel</option>
                  <option value="false">No - Co-Counsel</option>
                </select>
              </div>
            </>
          )}

          {/* Explicit Cite Precedent Workflow */}
          {workflow === 'cite' && (
            <>
              <div className="input-group">
                <label>Citation Record ID</label>
                <input name="citation_id" className="input-field" required placeholder="e.g. CIT_9001" />
              </div>
              <div className="input-group">
                <label>Active Citing Case ID</label>
                <input name="citing_case" className="input-field" required placeholder="e.g. CASE_1001" />
              </div>
              <div className="input-group">
                <label>Historical Precedent Case ID</label>
                <input name="cited_case" className="input-field" required placeholder="e.g. CASE_900" />
              </div>
              <div className="input-group">
                <label>Relevance / Applicability Note</label>
                <input name="note" className="input-field" required placeholder="Applied standard of evidence..." />
              </div>
            </>
          )}


                    {/* Granular Delete: Cancel Hearing */}
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

          {/* Granular Delete: Withdraw Counsel */}
          {workflow === 'withdraw_counsel' && (
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label>Counsel Assignment ID</label>
              <input name="counsel_id" className="input-field" required placeholder="e.g. CNSL_01" />
            </div>
          )}

          {/* Granular Delete: Drop Charge */}
          {workflow === 'drop_charge' && (
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label>Charge Sheet ID</label>
              <input name="charge_sheet_id" className="input-field" required placeholder="e.g. CHG_01" />
            </div>
          )}

          {/* Granular Delete: Strike Precedent */}
          {workflow === 'strike_precedent' && (
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label>Citation ID</label>
              <input name="citation_id" className="input-field" required placeholder="e.g. CIT_01" />
            </div>
          )}



          <div style={{ gridColumn: '1 / -1', marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-gold" disabled={loading} style={{ width: '200px' }}>
              {loading ? 'Processing...' : 'Execute Procedure'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FetchRecords({ setView }: { setView: (v: string) => void }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeQuery, setActiveQuery] = useState(0);

  const queryTitles = [
    "Caseload Distribution", "Lawyer Roster", "Appellate Lineage", 
    "Hearing History", "Resolution Duration", "Pending Active Cases", 
    "Double Jeopardy Risk", "Cited Precedents", "Taxonomy Search", "Master Cross-Module Docket",
    // --- New Queries Appended Below ---
    "Stalled Docket Analysis", "Bail Outlier Detection", "Judicial Clearance Rates", "Habitual Litigant Tracker",
    "Lawyer Success Ranking (Window)"
    
  ];


  const fetchQuery = async (id: number) => {
    setLoading(true); setError(''); setActiveQuery(id); setData([]);
    try {
      const res = await fetch(`http://localhost:3000/api/queries/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container view-fade-in" style={{ maxWidth: '1200px' }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button className="btn-outline" onClick={() => setView('menu')}>
           <ArrowLeft size={16} style={{display:'inline', verticalAlign:'middle', marginRight:'6px'}}/> Back
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '24px', width: '100%' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h4 style={{ margin: '0 0 16px 0', color: '#c3aa72', textTransform: 'uppercase' }}>Options</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {queryTitles.map((title, i) => (
              <button 
                key={i} 
                className={activeQuery === i + 1 ? 'btn-gold' : 'btn-outline'} 
                style={{ textAlign: 'left', padding: '10px' }}
                onClick={() => fetchQuery(i + 1)}
              >
                Q{i+1}: {title}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ minHeight: '500px' }}>
          {loading && <p style={{ color: '#c3aa72' }}>Executing query...</p>}
          {error && <div className="banner-error"><AlertCircle size={20}/> {error}</div>}
          {!loading && !error && data.length === 0 && <p style={{ color: 'rgba(218,211,193,0.5)' }}>Select a query from the panel to view results. </p>}
          
          {data.length > 0 && (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>{Object.keys(data[0]).map(key => <th key={key}>{key.replace(/_/g, ' ')}</th>)}</tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr key={idx}>
                      {Object.values(row).map((val: any, i) => (
                        <td key={i}>{val !== null ? String(val) : 'NULL'}</td>
                      ))}
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

export default function App() {
  const [currentView, setCurrentView] = useState<'splash' | 'menu' | 'add' | 'fetch'>('splash');

  return (
    <div className="app-shell">
      {currentView === 'splash' && <Splash onComplete={() => setCurrentView('menu')} />}
      {currentView === 'menu' && <MainMenu setView={(v) => setCurrentView(v as any)} />}
      {currentView === 'add' && <AddRecord setView={(v) => setCurrentView(v as any)} />}
      {currentView === 'fetch' && <FetchRecords setView={(v) => setCurrentView(v as any)} />}
    </div>
  );
}
