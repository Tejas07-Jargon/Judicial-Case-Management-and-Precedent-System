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

function Splash() {
  return (
    <section className="splash" aria-label="Application loading">
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

export default function App() {
  return (
    <div className="app-shell">
      <Splash />
    </div>
  );
}
