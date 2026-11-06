const ASPHALT = "#2a241c";
const LANE = "#d7c4a4";
const YOU = "#e39b12";
const OTHER = "#efe6d6";
const TRAM = "#c4372a";
const INK = "#1c1612";

function Car({ x, y, rot, fill, label }: { x: number; y: number; rot: number; fill: string; label: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x="-16" y="-26" width="32" height="52" rx="8" fill={fill} />
      <rect x="-10" y="-16" width="20" height="14" rx="2" fill={INK} opacity="0.35" />
      <text x="0" y="12" textAnchor="middle" fontSize="11" fontFamily="sans-serif" fill={INK}>
        {label}
      </text>
    </g>
  );
}

export function Diagram({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 320 220" className="h-auto w-full" role="img">
      <rect width="320" height="220" rx="18" fill={ASPHALT} />
      {id === "round" ? <Round /> : id === "zebra" ? <Zebra /> : <Cross id={id} />}
    </svg>
  );
}

function Cross({ id }: { id: string }) {
  return (
    <>
      <rect x="120" y="0" width="80" height="220" fill="#3a3128" />
      <rect x="0" y="70" width="320" height="80" fill="#3a3128" />
      <path d="M160 0 V70 M160 150 V220 M0 110 H120 M200 110 H320" stroke={LANE} strokeWidth="2" strokeDasharray="6 8" />
      {id === "tram" ? (
        <>
          <rect x="138" y="8" width="8" height="54" fill={LANE} />
          <rect x="174" y="8" width="8" height="54" fill={LANE} />
          <g transform="translate(160 36)">
            <rect x="-22" y="-18" width="44" height="36" rx="4" fill={TRAM} />
            <text x="0" y="5" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#fff">
              трамвай
            </text>
          </g>
        </>
      ) : null}
      {id === "left" ? (
        <Car x={160} y={28} rot={180} fill={OTHER} label="прямо" />
      ) : null}
      {id === "equal" ? <Car x={250} y={110} rot={-90} fill={OTHER} label="справа" /> : null}
      {id === "yield" ? <Car x={70} y={110} rot={90} fill={OTHER} label="главная" /> : null}
      <Car x={160} y={186} rot={0} fill={YOU} label="ты" />
      {id === "yield" ? (
        <polygon points="188,168 206,198 170,198" fill="#fffcf7" stroke="#c41212" strokeWidth="3" />
      ) : null}
    </>
  );
}

function Round() {
  return (
    <>
      <circle cx="160" cy="100" r="62" fill="none" stroke="#3a3128" strokeWidth="36" />
      <circle cx="160" cy="100" r="28" fill="#241e18" />
      <text x="160" y="104" textAnchor="middle" fontSize="11" fontFamily="sans-serif" fill={LANE}>
        4.3
      </text>
      <Car x={214} y={78} rot={40} fill={OTHER} label="на кольце" />
      <Car x={160} y={186} rot={0} fill={YOU} label="ты" />
    </>
  );
}

function Zebra() {
  return (
    <>
      <rect x="70" y="0" width="180" height="220" fill="#3a3128" />
      {Array.from({ length: 6 }).map((_, i) => (
        <rect key={i} x={88 + i * 26} y="78" width="14" height="64" fill={LANE} />
      ))}
      <circle cx="168" cy="96" r="7" fill={OTHER} />
      <path d="M168 106 v16 M158 116 h20 M162 142 l6-18 6 18" stroke={OTHER} strokeWidth="4" fill="none" strokeLinecap="round" />
      <text x="168" y="64" textAnchor="middle" fontSize="11" fontFamily="sans-serif" fill={LANE}>
        пешеход
      </text>
      <Car x={160} y={186} rot={0} fill={YOU} label="ты" />
    </>
  );
}
