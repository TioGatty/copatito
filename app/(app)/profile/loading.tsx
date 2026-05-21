export default function ProfileLoading() {
  return (
    <div className="screen-body">
      <div style={{
        padding: '8px 20px 60px',
        background: 'linear-gradient(180deg, oklch(0.2 0.04 60) 0%, var(--bg-0) 100%)',
        textAlign: 'center',
      }}>
        <div className="skel" style={{ width: 88, height: 88, borderRadius: '50%', margin: '12px auto 14px' }}/>
        <div className="skel" style={{ width: 140, height: 22, margin: '0 auto 8px' }}/>
        <div className="skel" style={{ width: 180, height: 12, margin: '0 auto' }}/>
      </div>
      <div style={{ padding: '0 20px', marginTop: -40, position: 'relative', zIndex: 2 }}>
        <div className="skel" style={{ width: '100%', height: 80, borderRadius: 18 }}/>
      </div>
      <div style={{ padding: '16px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="skel" style={{ height: 64, borderRadius: 18 }}/>
        <div className="skel" style={{ height: 64, borderRadius: 18 }}/>
      </div>
      <div style={{ padding: '20px 20px' }}>
        <div className="skel" style={{ width: 160, height: 22, marginBottom: 12 }}/>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skel" style={{ width: '100%', height: 64, borderRadius: 12 }}/>
          ))}
        </div>
      </div>
    </div>
  )
}
