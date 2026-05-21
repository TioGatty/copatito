export default function PoolsLoading() {
  return (
    <div className="screen-body">
      <div style={{ padding: '4px 20px 12px' }}>
        <div className="skel" style={{ width: 160, height: 32, marginBottom: 8 }}/>
        <div className="skel" style={{ width: 220, height: 12 }}/>
      </div>
      <div style={{ padding: '0 20px 12px' }}>
        <div className="skel" style={{ width: '100%', height: 76, borderRadius: 18 }}/>
      </div>
      <div style={{ padding: '4px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skel" style={{ width: '100%', height: 72, borderRadius: 18 }}/>
        ))}
      </div>
    </div>
  )
}
