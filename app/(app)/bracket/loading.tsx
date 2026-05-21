export default function BracketLoading() {
  return (
    <div className="screen-body">
      <div style={{ padding: '4px 20px 12px' }}>
        <div className="skel" style={{ width: 140, height: 32, marginBottom: 8 }}/>
        <div className="skel" style={{ width: 200, height: 12 }}/>
      </div>
      <div style={{ padding: '0 16px 12px' }}>
        <div className="skel" style={{ width: '100%', height: 44, borderRadius: 12 }}/>
      </div>
      <div style={{ padding: '0 20px 12px', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skel" style={{ width: 72, height: 28, borderRadius: 8, flexShrink: 0 }}/>
        ))}
      </div>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skel" style={{ width: '100%', height: 96, borderRadius: 14 }}/>
        ))}
      </div>
    </div>
  )
}
