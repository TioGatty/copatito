import React from 'react'

const COUNTRY: Record<string, string> = {
  ARG: 'Argentina', BRA: 'Brasil', MEX: 'México', URU: 'Uruguay', COL: 'Colombia',
  CHI: 'Chile', ECU: 'Ecuador', PAR: 'Paraguay', PER: 'Perú',
  USA: 'EE.UU.', CAN: 'Canadá', FRA: 'Francia', ESP: 'España', GER: 'Alemania',
  ENG: 'Inglaterra', NED: 'Países Bajos', POR: 'Portugal', BEL: 'Bélgica',
  JPN: 'Japón', KOR: 'Corea del Sur', SEN: 'Senegal', MAR: 'Marruecos',
  AUS: 'Australia', CRO: 'Croacia', ITA: 'Italia', SUI: 'Suiza', DEN: 'Dinamarca',
  NOR: 'Noruega', GHA: 'Ghana', EGY: 'Egipto', NGA: 'Nigeria', KSA: 'Arabia S.',
  QAT: 'Catar', IRN: 'Irán', SCO: 'Escocia', NZL: 'N. Zelanda',
  CRC: 'Costa Rica', PAN: 'Panamá', HON: 'Honduras', JAM: 'Jamaica',
  HAI: 'Haití', VEN: 'Venezuela', BOL: 'Bolivia',
  // WC 2026 additional teams
  RSA: 'Sudáfrica', CZE: 'Rep. Checa', BIH: 'Bosnia',
  TUR: 'Turquía', CUW: 'Curazao', CIV: 'Costa Marfil',
  SWE: 'Suecia', TUN: 'Túnez', CPV: 'Cabo Verde',
  IRQ: 'Irak', ALG: 'Argelia', AUT: 'Austria',
  JOR: 'Jordania', COD: 'R.D. Congo', UZB: 'Uzbekistán',
}

function FlagPaint({ code }: { code: string }) {
  const h3 = (a: string, b: string, c: string) => (
    <>
      <rect x="0" y="0" width="60" height="13.33" fill={a}/>
      <rect x="0" y="13.33" width="60" height="13.34" fill={b}/>
      <rect x="0" y="26.67" width="60" height="13.33" fill={c}/>
    </>
  )
  const v3 = (a: string, b: string, c: string) => (
    <>
      <rect x="0" y="0" width="20" height="40" fill={a}/>
      <rect x="20" y="0" width="20" height="40" fill={b}/>
      <rect x="40" y="0" width="20" height="40" fill={c}/>
    </>
  )

  switch (code) {
    case 'ARG': return <>
      <rect x="0" y="0" width="60" height="13.33" fill="#75AADB"/>
      <rect x="0" y="13.33" width="60" height="13.34" fill="#fff"/>
      <rect x="0" y="26.67" width="60" height="13.33" fill="#75AADB"/>
      <circle cx="30" cy="20" r="3.4" fill="#FCBF49" stroke="#A05A2C" strokeWidth="0.3"/>
    </>
    case 'BRA': return <>
      <rect x="0" y="0" width="60" height="40" fill="#009C3B"/>
      <polygon points="30,4 56,20 30,36 4,20" fill="#FEDF00"/>
      <circle cx="30" cy="20" r="6.5" fill="#002776"/>
      <path d="M23.5 18.5 Q30 16 36.5 18.5" stroke="#fff" strokeWidth="0.8" fill="none"/>
    </>
    case 'MEX': return <>
      {v3('#006847', '#fff', '#CE1126')}
      <circle cx="30" cy="20" r="3.5" fill="none" stroke="#6F4E37" strokeWidth="0.4"/>
    </>
    case 'URU': return <>
      <rect x="0" y="0" width="60" height="40" fill="#fff"/>
      {[1,3,5,7].map(i => (
        <rect key={i} x="20" y={i*4.44} width="40" height="4.44" fill="#0038A8"/>
      ))}
      <rect x="0" y="0" width="22" height="22" fill="#fff"/>
      <circle cx="11" cy="11" r="5" fill="#FCBF49" stroke="#A05A2C" strokeWidth="0.3"/>
    </>
    case 'COL': return <>
      <rect x="0" y="0" width="60" height="20" fill="#FCD116"/>
      <rect x="0" y="20" width="60" height="10" fill="#003893"/>
      <rect x="0" y="30" width="60" height="10" fill="#CE1126"/>
    </>
    case 'CHI': return <>
      <rect x="0" y="0" width="60" height="20" fill="#fff"/>
      <rect x="0" y="20" width="60" height="20" fill="#D52B1E"/>
      <rect x="0" y="0" width="20" height="20" fill="#0033A0"/>
      <polygon points="10,5 11.2,9 15.5,9 12.2,11.5 13.5,15.5 10,13 6.5,15.5 7.8,11.5 4.5,9 8.8,9" fill="#fff"/>
    </>
    case 'ECU': return <>
      <rect x="0" y="0" width="60" height="20" fill="#FFD100"/>
      <rect x="0" y="20" width="60" height="10" fill="#034EA2"/>
      <rect x="0" y="30" width="60" height="10" fill="#ED1C24"/>
    </>
    case 'PAR': return <>
      {h3('#D52B1E', '#fff', '#0038A8')}
      <circle cx="30" cy="20" r="2.5" fill="#FCBF49" stroke="#A05A2C" strokeWidth="0.2"/>
    </>
    case 'PER': return <>{v3('#D91023', '#fff', '#D91023')}</>
    case 'USA': return <>
      {[0,1,2,3,4,5,6].map(i => (
        <rect key={i} x="0" y={i*(40/7)} width="60" height={40/7}
          fill={i % 2 === 0 ? '#B22234' : '#fff'}/>
      ))}
      <rect x="0" y="0" width="24" height={40/7*4} fill="#3C3B6E"/>
    </>
    case 'CAN': return <>
      <rect x="0" y="0" width="15" height="40" fill="#D52B1E"/>
      <rect x="15" y="0" width="30" height="40" fill="#fff"/>
      <rect x="45" y="0" width="15" height="40" fill="#D52B1E"/>
      <path d="M30 10 L31.5 16 L37 15 L33.5 19 L36 21 L31 21.5 L30 26 L29 21.5 L24 21 L26.5 19 L23 15 L28.5 16 Z" fill="#D52B1E"/>
    </>
    case 'FRA': return <>{v3('#0055A4', '#fff', '#EF4135')}</>
    case 'ESP': return <>
      <rect x="0" y="0" width="60" height="10" fill="#AA151B"/>
      <rect x="0" y="10" width="60" height="20" fill="#F1BF00"/>
      <rect x="0" y="30" width="60" height="10" fill="#AA151B"/>
    </>
    case 'GER': return <>{h3('#000', '#DD0000', '#FFCE00')}</>
    case 'ENG': return <>
      <rect x="0" y="0" width="60" height="40" fill="#fff"/>
      <rect x="26" y="0" width="8" height="40" fill="#CF142B"/>
      <rect x="0" y="16" width="60" height="8" fill="#CF142B"/>
    </>
    case 'NED': return <>{h3('#AE1C28', '#fff', '#21468B')}</>
    case 'POR': return <>
      <rect x="0" y="0" width="24" height="40" fill="#006600"/>
      <rect x="24" y="0" width="36" height="40" fill="#FF0000"/>
      <circle cx="24" cy="20" r="6" fill="#FFD700" stroke="#fff" strokeWidth="0.5"/>
      <circle cx="24" cy="20" r="3.5" fill="#fff"/>
    </>
    case 'BEL': return <>{v3('#000', '#FAE042', '#ED2939')}</>
    case 'JPN': return <>
      <rect x="0" y="0" width="60" height="40" fill="#fff"/>
      <circle cx="30" cy="20" r="8" fill="#BC002D"/>
    </>
    case 'KOR': return <>
      <rect x="0" y="0" width="60" height="40" fill="#fff"/>
      <circle cx="30" cy="20" r="7" fill="#C60C30"/>
      <circle cx="30" cy="20" r="3.5" fill="#003478"/>
    </>
    case 'SEN': return <>{v3('#00853F', '#FDEF42', '#E31B23')}</>
    case 'MAR': return <>
      <rect x="0" y="0" width="60" height="40" fill="#C1272D"/>
      <polygon points="30,12 32,18 38,18 33,22 35,28 30,24 25,28 27,22 22,18 28,18" fill="none" stroke="#006233" strokeWidth="0.8"/>
    </>
    case 'AUS': return <>
      <rect x="0" y="0" width="60" height="40" fill="#012169"/>
      <path d="M0 0 L24 16 M24 0 L0 16" stroke="#fff" strokeWidth="1.5"/>
      <path d="M0 0 L24 16 M24 0 L0 16" stroke="#C8102E" strokeWidth="0.8"/>
      <path d="M12 0 V16 M0 8 H24" stroke="#fff" strokeWidth="2.5"/>
      <path d="M12 0 V16 M0 8 H24" stroke="#C8102E" strokeWidth="1.5"/>
      <polygon points="40,28 41,30 43,30 41.5,31 42,33 40,32 38,33 38.5,31 37,30 39,30" fill="#fff"/>
    </>
    case 'CRO': return <>{h3('#FF0000', '#fff', '#171796')}</>
    case 'ITA': return <>{v3('#009246', '#fff', '#CE2B37')}</>
    case 'SUI': return <>
      <rect x="0" y="0" width="60" height="40" fill="#D52B1E"/>
      <rect x="26" y="12" width="8" height="16" fill="#fff"/>
      <rect x="22" y="16" width="16" height="8" fill="#fff"/>
    </>
    case 'DEN': return <>
      <rect x="0" y="0" width="60" height="40" fill="#C8102E"/>
      <rect x="0" y="17" width="60" height="6" fill="#fff"/>
      <rect x="18" y="0" width="6" height="40" fill="#fff"/>
    </>
    case 'NOR': return <>
      <rect x="0" y="0" width="60" height="40" fill="#BA0C2F"/>
      <rect x="0" y="16" width="60" height="8" fill="#fff"/>
      <rect x="16" y="0" width="8" height="40" fill="#fff"/>
      <rect x="0" y="18" width="60" height="4" fill="#00205B"/>
      <rect x="18" y="0" width="4" height="40" fill="#00205B"/>
    </>
    case 'GHA': return <>
      {h3('#CE1126', '#FCD116', '#006B3F')}
      <polygon points="30,16 31.5,21 26.5,18 33.5,18 28.5,21" fill="#000"/>
    </>
    case 'EGY': return <>{h3('#CE1126', '#fff', '#000')}</>
    case 'NGA': return <>{v3('#008751', '#fff', '#008751')}</>
    case 'KSA': return <>
      <rect x="0" y="0" width="60" height="40" fill="#006C35"/>
      <path d="M14 22 H46" stroke="#fff" strokeWidth="1"/>
      <rect x="20" y="24" width="20" height="2" fill="#fff"/>
    </>
    case 'QAT': return <>
      <rect x="0" y="0" width="22" height="40" fill="#fff"/>
      <path d="M22 0 L26 4 L22 8 L26 12 L22 16 L26 20 L22 24 L26 28 L22 32 L26 36 L22 40 L60 40 L60 0 Z" fill="#8A1538"/>
    </>
    case 'IRN': return <>{h3('#239F40', '#fff', '#DA0000')}</>
    case 'SCO': return <>
      <rect x="0" y="0" width="60" height="40" fill="#0065BD"/>
      <path d="M0 0 L60 40 M60 0 L0 40" stroke="#fff" strokeWidth="6"/>
    </>
    case 'NZL': return <>
      <rect x="0" y="0" width="60" height="40" fill="#012169"/>
      <path d="M0 0 L24 16 M24 0 L0 16" stroke="#fff" strokeWidth="1.5"/>
      <path d="M0 0 L24 16 M24 0 L0 16" stroke="#C8102E" strokeWidth="0.8"/>
      <path d="M12 0 V16 M0 8 H24" stroke="#fff" strokeWidth="2.5"/>
      <path d="M12 0 V16 M0 8 H24" stroke="#C8102E" strokeWidth="1.5"/>
    </>
    case 'CRC': return <>
      <rect x="0" y="0" width="60" height="40" fill="#002B7F"/>
      <rect x="0" y="6" width="60" height="28" fill="#fff"/>
      <rect x="0" y="14" width="60" height="12" fill="#CE1126"/>
    </>
    case 'PAN': return <>
      <rect x="0" y="0" width="60" height="40" fill="#fff"/>
      <rect x="30" y="0" width="30" height="20" fill="#D52B1E"/>
      <rect x="0" y="20" width="30" height="20" fill="#005AAB"/>
      <polygon points="15,5 16.5,9 20.5,9 17.5,11.5 18.5,15.5 15,13 11.5,15.5 12.5,11.5 9.5,9 13.5,9" fill="#005AAB"/>
      <polygon points="45,25 46.5,29 50.5,29 47.5,31.5 48.5,35.5 45,33 41.5,35.5 42.5,31.5 39.5,29 43.5,29" fill="#D52B1E"/>
    </>
    case 'HON': return <>{h3('#00BCE4', '#fff', '#00BCE4')}</>
    case 'JAM': return <>
      <rect x="0" y="0" width="60" height="40" fill="#009B3A"/>
      <polygon points="0,0 30,20 0,40" fill="#000"/>
      <polygon points="60,0 30,20 60,40" fill="#000"/>
      <path d="M0 0 L60 40 M60 0 L0 40" stroke="#FED100" strokeWidth="3"/>
    </>
    case 'HAI': return <>
      <rect x="0" y="0" width="60" height="20" fill="#00209F"/>
      <rect x="0" y="20" width="60" height="20" fill="#D21034"/>
    </>
    case 'VEN': return <>{h3('#FFCC00', '#00247D', '#CF142B')}</>
    case 'BOL': return <>{h3('#DA291C', '#FFD100', '#007934')}</>
    // ─── WC 2026 additions ───────────────────────────────
    case 'RSA': return <>
      {/* South Africa: black/gold/green horizontal + Y shape */}
      <rect x="0" y="0" width="60" height="13.33" fill="#000"/>
      <rect x="0" y="13.33" width="60" height="13.34" fill="#FFB81C"/>
      <rect x="0" y="26.67" width="60" height="13.33" fill="#007A4D"/>
      {/* White + red bands */}
      <polygon points="0,0 20,20 0,40" fill="#FFFFFF"/>
      <polygon points="0,5 15,20 0,35" fill="#007A4D"/>
      <rect x="0" y="17" width="60" height="6" fill="#FFFFFF"/>
      <rect x="0" y="18.5" width="60" height="3" fill="#DE3831"/>
    </>
    case 'CZE': return <>
      <rect x="0" y="0" width="60" height="20" fill="#FFFFFF"/>
      <rect x="0" y="20" width="60" height="20" fill="#D7141A"/>
      <polygon points="0,0 26,20 0,40" fill="#11457E"/>
    </>
    case 'BIH': return <>
      <rect x="0" y="0" width="60" height="40" fill="#002395"/>
      <polygon points="15,0 45,40 55,40 25,0" fill="#FCCA00"/>
      {[0,1,2,3,4,5,6].map(i => (
        <polygon key={i}
          points={`${10+i*4.5},${i*5} ${12+i*4.5},${i*5+2} ${10+i*4.5},${i*5+4} ${8+i*4.5},${i*5+2}`}
          fill="#FFFFFF"/>
      ))}
    </>
    case 'TUR': return <>
      <rect x="0" y="0" width="60" height="40" fill="#E30A17"/>
      <circle cx="27" cy="20" r="8" fill="#FFFFFF"/>
      <circle cx="30" cy="20" r="6.5" fill="#E30A17"/>
      <polygon points="39,20 37.5,17 40,14 36.5,15 35,12 35,15.5 31.5,16.5 35,17.5 35,21 37.5,18.5" fill="#FFFFFF"/>
    </>
    case 'CUW': return <>
      <rect x="0" y="0" width="60" height="40" fill="#002B7F"/>
      <rect x="0" y="27" width="60" height="5" fill="#F9E814"/>
      <polygon points="8,10 9,13 12,13 10,15 11,18 8,16 5,18 6,15 4,13 7,13" fill="#FFFFFF"/>
      <polygon points="14,6 15,9 18,9 16,11 17,14 14,12 11,14 12,11 10,9 13,9" fill="#FFFFFF"/>
    </>
    case 'CIV': return <>{v3('#F77F00', '#FFFFFF', '#009A44')}</>
    case 'SWE': return <>
      <rect x="0" y="0" width="60" height="40" fill="#006AA7"/>
      <rect x="0" y="16" width="60" height="8" fill="#FECC02"/>
      <rect x="18" y="0" width="8" height="40" fill="#FECC02"/>
    </>
    case 'TUN': return <>
      <rect x="0" y="0" width="60" height="40" fill="#E70013"/>
      <circle cx="30" cy="20" r="10" fill="#FFFFFF"/>
      <circle cx="29" cy="20" r="7" fill="#E70013"/>
      <path d="M34 20 A5 5 0 1 1 34 19.9" fill="none" stroke="#FFFFFF" strokeWidth="2.5"/>
      <polygon points="36,18 34.5,16 37,14.5 33.5,15.5 32.5,12.5 32.5,15.5 29,16.5 32.5,17.5 32.5,20.5 35,18.5" fill="#FFFFFF"/>
    </>
    case 'CPV': return <>
      <rect x="0" y="0" width="60" height="40" fill="#003893"/>
      <rect x="0" y="23" width="60" height="4" fill="#FFFFFF"/>
      <rect x="0" y="27" width="60" height="4" fill="#CF2027"/>
      <rect x="0" y="31" width="60" height="4" fill="#FFFFFF"/>
      {[0,1,2,3,4,5,6,7,8,9].map(i => {
        const a = (i * 36 - 90) * Math.PI / 180
        const r = 6
        const cx = 22 + r * Math.cos(a), cy = 20 + r * Math.sin(a)
        return <polygon key={i}
          points={`${cx},${cy-1.5} ${cx+0.5},${cy-0.5} ${cx+1.5},${cy} ${cx+0.5},${cy+0.5} ${cx},${cy+1.5} ${cx-0.5},${cy+0.5} ${cx-1.5},${cy} ${cx-0.5},${cy-0.5}`}
          fill="#FFFFFF"/>
      })}
    </>
    case 'IRQ': return <>
      {h3('#CE1126', '#FFFFFF', '#000000')}
      <text x="30" y="24" textAnchor="middle" fontSize="6" fill="#007A3D" fontFamily="serif">كوفية</text>
    </>
    case 'ALG': return <>
      <rect x="0" y="0" width="30" height="40" fill="#006233"/>
      <rect x="30" y="0" width="30" height="40" fill="#FFFFFF"/>
      <circle cx="32" cy="20" r="7" fill="#FFFFFF"/>
      <circle cx="34" cy="20" r="5.5" fill="#D21034"/>
      <polygon points="38,20 36.5,17 39,14.5 35.5,15.5 34.5,12.5 34.5,15.5 31,16.5 34.5,17.5 34.5,20.5 37,18.5" fill="#D21034"/>
    </>
    case 'AUT': return <>{h3('#ED2939', '#FFFFFF', '#ED2939')}</>
    case 'JOR': return <>
      {h3('#007A3D', '#FFFFFF', '#000000')}
      <polygon points="0,0 22,20 0,40" fill="#CE1126"/>
      <polygon points="8,18 9,14.5 12.5,14.5 9.8,16.8 10.8,20.3 8,18.1 5.2,20.3 6.2,16.8 3.5,14.5 7,14.5" fill="#FFFFFF"/>
    </>
    case 'COD': return <>
      <rect x="0" y="0" width="60" height="40" fill="#007FFF"/>
      <polygon points="0,40 42,0 60,0 60,2 44,0 2,40" fill="#F7D618"/>
      <polygon points="0,36 40,0 42,0 2,40" fill="#CE1021"/>
      <polygon points="0,38 0,40 2,40" fill="#CE1021"/>
      <polygon points="6,4 7.2,7.5 11,7.5 8,9.5 9,13 6,11 3,13 4,9.5 1,7.5 4.8,7.5" fill="#F7D618"/>
    </>
    case 'UZB': return <>
      <rect x="0" y="0" width="60" height="13.33" fill="#1EB53A"/>
      <rect x="0" y="13.33" width="60" height="2" fill="#FFFFFF"/>
      <rect x="0" y="15.33" width="60" height="9.34" fill="#FFFFFF"/>
      <rect x="0" y="24.67" width="60" height="2" fill="#FFFFFF"/>
      <rect x="0" y="26.67" width="60" height="13.33" fill="#CE1126"/>
      <circle cx="10" cy="6.67" r="3.5" fill="#FFFFFF"/>
      <circle cx="12" cy="6.67" r="3.5" fill="#1EB53A"/>
      {Array.from({ length: 36 }, (_, i) => {
        const col = i % 12, row = Math.floor(i / 12)
        return <circle key={i} cx={20 + col * 3.2} cy={3 + row * 3.5} r="0.6" fill="#FFFFFF"/>
      })}
    </>
    default: return <rect x="0" y="0" width="60" height="40" fill="#444"/>
  }
}

export default function Flag({ code, size = 32 }: { code: string; size?: number }) {
  const w = size
  const h = Math.round(size * 0.67)
  const uid = `f-${code}-${size}`
  return (
    <svg
      width={w} height={h} viewBox="0 0 60 40"
      style={{
        flexShrink: 0,
        borderRadius: Math.max(2, size * 0.08),
        boxShadow: '0 0 0 0.5px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.35)',
        overflow: 'hidden',
        background: '#222',
        display: 'block',
      }}
      role="img"
      aria-label={COUNTRY[code] ?? code}
    >
      <defs>
        <clipPath id={`clip-${uid}`}>
          <rect x="0" y="0" width="60" height="40"/>
        </clipPath>
      </defs>
      <g clipPath={`url(#clip-${uid})`}>
        <FlagPaint code={code}/>
        <rect x="0" y="0" width="60" height="20" fill="rgba(255,255,255,0.06)"/>
      </g>
    </svg>
  )
}

export { COUNTRY }
