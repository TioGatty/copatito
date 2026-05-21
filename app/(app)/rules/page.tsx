export const dynamic = 'force-static'

import Link from 'next/link'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 className="display" style={{
        fontSize: 20, fontWeight: 700, margin: '0 0 12px',
        color: 'var(--gold)', letterSpacing: '-0.02em',
      }}>{title}</h2>
      <div style={{ fontSize: 14, color: 'var(--t-2)', lineHeight: 1.7 }}>
        {children}
      </div>
    </div>
  )
}

function Pts({ children, color = 'var(--gold)' }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="mono" style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 6,
      background: 'var(--pill-gold-bg)', color, fontWeight: 700,
      fontSize: 12, minWidth: 28, textAlign: 'center',
    }}>{children}</span>
  )
}

export default function RulesPage() {
  return (
    <div className="screen-body">
      {/* Header */}
      <div style={{ padding: '4px 20px 16px', position: 'relative', overflow: 'hidden' }}>
        <div className="sun-motif" style={{ opacity: 0.3 }}/>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="display" style={{ fontSize: 30, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.03em' }}>
            Reglas
          </h1>
          <div style={{ fontSize: 12, color: 'var(--t-3)' }}>
            Cómo funciona CopaTío · Mundial 2026
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>

        <Section title="🎯 El objetivo">
          <p>
            Pronosticá el resultado de los 104 partidos del Mundial 2026 y sumá puntos cuanto más cerca estés del marcador real.
            Competí en pools privados con tus amigos o en el ranking global.
          </p>
        </Section>

        <Section title="📊 Sistema de puntos">
          <div style={{
            background: 'var(--bg-1)', border: '0.5px solid var(--line-soft)',
            borderRadius: 14, padding: 16, marginBottom: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <Pts>+10</Pts>
              <span><strong>Score exacto</strong> — acertás el marcador completo (ej. Argentina 2-1 Brasil, predicción 2-1)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <Pts>+6</Pts>
              <span><strong>Diferencia de gol</strong> — acertás la diferencia y el ganador (ej. resultado 2-1, predicción 3-2)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Pts>+3</Pts>
              <span><strong>Ganador</strong> — acertás quién gana o si empata (ej. resultado 2-1, predicción 4-2)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, opacity: 0.6 }}>
              <Pts color="var(--lose)">+0</Pts>
              <span>No acertaste nada</span>
            </div>
          </div>
        </Section>

        <Section title="🔥 Multiplicador por fase">
          <p>Cuanto más avanzada la fase, más valen los puntos:</p>
          <div style={{
            background: 'var(--bg-1)', border: '0.5px solid var(--line-soft)',
            borderRadius: 14, padding: 12, marginTop: 10,
          }}>
            {[
              { phase: 'Fase de grupos', mult: '×1' },
              { phase: '16avos de final', mult: '×1.5' },
              { phase: 'Octavos de final', mult: '×2' },
              { phase: 'Cuartos de final', mult: '×2.5' },
              { phase: 'Semifinales', mult: '×3' },
              { phase: 'Tercer puesto', mult: '×2' },
              { phase: 'Final', mult: '×5' },
            ].map((r, i, arr) => (
              <div key={r.phase} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 4px',
                borderBottom: i < arr.length - 1 ? '0.5px solid var(--line-soft)' : 'none',
              }}>
                <span>{r.phase}</span>
                <span className="mono" style={{ color: 'var(--gold)', fontWeight: 700 }}>{r.mult}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 10, fontSize: 13, color: 'var(--t-3)' }}>
            <em>Ejemplo:</em> acertar el score exacto de la Final = 10 × 5 = <strong>50 puntos</strong>.
          </p>
        </Section>

        <Section title="⏰ Cierre de pronósticos">
          <p>
            Podés pronosticar hasta <strong>15 minutos antes del kickoff</strong>. Después de eso el partido se bloquea
            y no podés cambiarlo. Las predicciones hechas a último momento valen lo mismo que las cargadas con anticipación.
          </p>
        </Section>

        <Section title="🏆 Eliminación directa (knockouts)">
          <p>
            En partidos eliminatorios, el score se predice en los 90 minutos reglamentarios.
            Si empatás los scores, te aparece un selector adicional: <strong>¿quién avanza si hay empate?</strong>
            Eso simula el tiempo extra o los penales — sin sumar puntos extra por ahora, solo para mantener tu predicción coherente.
          </p>
          <p style={{ marginTop: 8, fontSize: 13, color: 'var(--t-3)' }}>
            Los equipos en cada partido knockout se completan automáticamente con los resultados reales del torneo conforme avanza
            (vos pronosticás ese partido recién cuando se conocen los dos equipos).
          </p>
        </Section>

        <Section title="🪙 Monedas">
          <p>
            Las monedas son la moneda interna del juego. Te sirven para crear pools privados.
          </p>
          <div style={{
            background: 'var(--bg-1)', border: '0.5px solid var(--line-soft)',
            borderRadius: 14, padding: 14, marginTop: 12,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)', marginBottom: 8 }}>Cómo ganarlas:</div>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              <li><strong>+100 monedas</strong> al registrarte (bono de bienvenida)</li>
              <li><strong>+1 moneda</strong> por cada pronóstico acertado (cualquier nivel)</li>
              <li><strong>+5 monedas extra</strong> si acertás el score exacto</li>
            </ul>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)', marginTop: 14, marginBottom: 8 }}>Cómo gastarlas:</div>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              <li><strong>Crear un pool privado</strong> (vos elegís el costo: 0–1000 monedas)</li>
              <li><strong>Unirte a un pool</strong> (pagás el costo que definió el creador)</li>
            </ul>
          </div>
        </Section>

        <Section title="👥 Pools privados">
          <p>
            Creá una competencia con tus amigos. Funciona así:
          </p>
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li>Podés crear hasta <strong>5 pools propios</strong></li>
            <li>El creador define el <strong>costo de entrada</strong> (mismo para todos los miembros)</li>
            <li>Compartís un <strong>código de 6 caracteres</strong> o un link directo</li>
            <li>El ranking dentro del pool usa la suma de puntos del torneo de cada miembro</li>
            <li>Los pronósticos de los demás miembros se ven <strong>solo después del kickoff</strong> de cada partido (anti-trampa)</li>
          </ul>
          <p style={{ marginTop: 10, fontSize: 13, color: 'var(--t-3)' }}>
            <em>Nota:</em> las monedas del pool quedan en el sistema. Esta versión no procesa pagos en dinero real —
            la coordinación de premios queda entre los miembros del pool.
          </p>
        </Section>

        <Section title="📈 Ranking global">
          <p>
            Hay un ranking público con todos los jugadores ordenados por puntos totales.
            En caso de empate, desempata primero la cantidad de aciertos (predicciones con puntos &gt; 0),
            después la cantidad total de pronósticos.
          </p>
          <p style={{ marginTop: 8 }}>
            El podio (top 3) tiene medalla. Tu posición siempre aparece destacada en la pantalla.
          </p>
        </Section>

        <Section title="🤝 Juego limpio">
          <ul style={{ paddingLeft: 18 }}>
            <li>Una cuenta por persona. Cuentas duplicadas pueden ser eliminadas sin aviso.</li>
            <li>Los pronósticos se cierran 15 minutos antes del kickoff <strong>para todos por igual</strong> — no hay excepciones.</li>
            <li>Los resultados reales son cargados por los administradores tras cada partido (o sincronizados desde fuente oficial).</li>
            <li>Si detectás un bug que da puntos o monedas indebidos, reportalo. Explotarlo puede llevar a baneo.</li>
          </ul>
        </Section>

        <Section title="❓ Preguntas frecuentes">
          <p><strong>¿Puedo cambiar mi pronóstico?</strong></p>
          <p style={{ marginBottom: 12 }}>Sí, todas las veces que quieras hasta 15 min antes del kickoff.</p>

          <p><strong>¿Qué pasa si un admin corrige un resultado?</strong></p>
          <p style={{ marginBottom: 12 }}>El sistema recalcula automáticamente los puntos y monedas. Si el partido se "deshace", las monedas premiadas se descuentan.</p>

          <p><strong>¿Puedo borrar mi cuenta?</strong></p>
          <p style={{ marginBottom: 12 }}>Por ahora no hay un botón self-serve. Pedinos por mail y la eliminamos.</p>

          <p><strong>¿Hay app móvil?</strong></p>
          <p>No, pero CopaTío está optimizado para celular. Agregalo a tu pantalla de inicio desde el menú del browser para acceso rápido.</p>
        </Section>

        {/* CTA back */}
        <div style={{ padding: '8px 0 24px' }}>
          <Link href="/home" style={{
            display: 'flex', justifyContent: 'center',
            padding: 14, borderRadius: 12,
            background: 'var(--gold)', color: 'var(--btn-primary-text)',
            textDecoration: 'none', fontWeight: 700, fontSize: 14,
          }}>
            Empezar a pronosticar →
          </Link>
        </div>

        <div style={{ height: 16 }}/>
      </div>
    </div>
  )
}
