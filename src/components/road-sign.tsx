import type { ReactNode } from "react";

const RED = "#c41212";
const BLUE = "#1d4e89";
const YELLOW = "#f2c200";
const WHITE = "#fffcf7";
const BLACK = "#1a1a1a";

function Warn({ children }: { children: ReactNode }) {
  return (
    <>
      <polygon
        points="50,8 94,88 6,88"
        fill={WHITE}
        stroke={RED}
        strokeWidth="7"
        strokeLinejoin="round"
      />
      {children}
    </>
  );
}

function BanRing({ children, fill = WHITE }: { children?: ReactNode; fill?: string }) {
  return (
    <>
      <circle cx="50" cy="50" r="40" fill={fill} stroke={RED} strokeWidth="8" />
      {children}
    </>
  );
}

export function RoadSign({ id, className }: { id: string; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      {draw(id)}
    </svg>
  );
}

function draw(id: string) {
  switch (id) {
    case "w-rail":
      return (
        <Warn>
          <path d="M32 70 V38 H68 V70" fill="none" stroke={BLACK} strokeWidth="5" />
          <path d="M28 46 H72 M28 58 H72" stroke={BLACK} strokeWidth="4" />
        </Warn>
      );
    case "w-ped":
      return (
        <Warn>
          <circle cx="50" cy="40" r="4" fill={BLACK} />
          <path
            d="M50 46 v12 M42 54 h16 M46 74 l4-14 4 14"
            fill="none"
            stroke={BLACK}
            strokeWidth="4"
            strokeLinecap="round"
          />
        </Warn>
      );
    case "w-kids":
      return (
        <Warn>
          <circle cx="40" cy="42" r="4" fill={BLACK} />
          <circle cx="60" cy="44" r="5" fill={BLACK} />
          <path
            d="M40 48 v10 M34 54 h12 M37 70 l3-10 3 10 M60 51 v12 M52 58 h16 M56 76 l4-12 4 12"
            fill="none"
            stroke={BLACK}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </Warn>
      );
    case "w-slip":
      return (
        <Warn>
          <path
            d="M30 62c10-16 14-16 22 0s12 16 20 0"
            fill="none"
            stroke={BLACK}
            strokeWidth="5"
            strokeLinecap="round"
          />
        </Warn>
      );
    case "prio-main":
      return <polygon points="50,6 94,50 50,94 6,50" fill={YELLOW} stroke={WHITE} strokeWidth="5" />;
    case "prio-yield":
      return (
        <polygon
          points="50,90 8,14 92,14"
          fill={WHITE}
          stroke={RED}
          strokeWidth="7"
          strokeLinejoin="round"
        />
      );
    case "prio-stop":
      return (
        <>
          <polygon points="32,8 68,8 92,32 92,68 68,92 32,92 8,68 8,32" fill={RED} />
          <text
            x="50"
            y="58"
            textAnchor="middle"
            fontSize="16"
            fontWeight="700"
            fill={WHITE}
            fontFamily="sans-serif"
          >
            STOP
          </text>
        </>
      );
    case "ban-brick":
      return (
        <>
          <circle cx="50" cy="50" r="42" fill={RED} />
          <rect x="18" y="42" width="64" height="16" rx="2" fill={WHITE} />
        </>
      );
    case "ban-over":
      return (
        <BanRing>
          <path d="M28 58c8-18 36-18 44 0" fill="none" stroke={BLACK} strokeWidth="5" />
          <path d="M24 78 76 28" stroke={RED} strokeWidth="7" />
        </BanRing>
      );
    case "ban-speed":
      return (
        <BanRing>
          <text
            x="50"
            y="58"
            textAnchor="middle"
            fontSize="22"
            fontWeight="700"
            fill={BLACK}
            fontFamily="sans-serif"
          >
            40
          </text>
        </BanRing>
      );
    case "ban-stop":
      return (
        <BanRing fill={BLUE}>
          <path d="M28 28 72 72 M72 28 28 72" stroke={RED} strokeWidth="7" />
        </BanRing>
      );
    case "ban-park":
      return (
        <BanRing fill={BLUE}>
          <path d="M26 74 74 26" stroke={RED} strokeWidth="7" />
        </BanRing>
      );
    case "must-straight":
      return (
        <>
          <circle cx="50" cy="50" r="42" fill={BLUE} />
          <path d="M50 74 V32" stroke={WHITE} strokeWidth="8" strokeLinecap="round" />
          <path
            d="M36 44 50 26 64 44"
            fill="none"
            stroke={WHITE}
            strokeWidth="8"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </>
      );
    case "must-right":
      return (
        <>
          <circle cx="50" cy="50" r="42" fill={BLUE} />
          <path d="M32 50 H68" stroke={WHITE} strokeWidth="8" strokeLinecap="round" />
          <path
            d="M56 36 72 50 56 64"
            fill="none"
            stroke={WHITE}
            strokeWidth="8"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </>
      );
    case "info-cross":
      return (
        <>
          <rect x="8" y="8" width="84" height="84" fill={BLUE} />
          <polygon points="50,18 82,78 18,78" fill={WHITE} />
          <circle cx="50" cy="42" r="4" fill={BLACK} />
          <path
            d="M50 48 v10 M43 55 h14 M46 72 l4-12 4 12"
            fill="none"
            stroke={BLACK}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </>
      );
    case "info-oneway":
      return (
        <>
          <rect x="6" y="28" width="88" height="44" rx="4" fill={BLUE} />
          <path d="M22 50 H68" stroke={WHITE} strokeWidth="8" strokeLinecap="round" />
          <path
            d="M58 36 76 50 58 64"
            fill="none"
            stroke={WHITE}
            strokeWidth="8"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </>
      );
    case "info-park":
      return (
        <>
          <rect x="10" y="10" width="80" height="80" rx="6" fill={BLUE} />
          <text
            x="50"
            y="66"
            textAnchor="middle"
            fontSize="48"
            fontWeight="700"
            fill={WHITE}
            fontFamily="sans-serif"
          >
            P
          </text>
        </>
      );
    default:
      return <circle cx="50" cy="50" r="36" fill={WHITE} />;
  }
}
