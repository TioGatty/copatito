export default function HomeLoading() {
  return (
    <div className="screen-body">
      <div style={{ padding: '4px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="skel" style={{ width: 38, height: 38, borderRadius: '50%' }}/>
            <div>
              <div className="skel" style={{ width: 40, height: 10, marginBottom: 6 }}/>
              <div className="skel" style={{ width: 90, height: 14 }}/>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div className="skel" style={{ width: 56, height: 28, borderRadius: 999 }}/>
            <div className="skel" style={{ width: 28, height: 28, borderRadius: 999 }}/>
            <div className="skel" style={{ width: 28, height: 28, borderRadius: 999 }}/>
          </div>
        </div>
        <div className="skel" style={{ width: 80, height: 11, marginBottom: 8 }}/>
        <div className="skel" style={{ width: 120, height: 52, marginBottom: 14 }}/>
        <div style={{ display: 'flex', gap: 20 }}>
          {[0,1,2].map(i => (
            <div key={i}>
              <div className="skel" style={{ width: 36, height: 18, marginBottom: 4 }}/>
              <div className="skel" style={{ width: 54, height: 10 }}/>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '12px 20px 4px' }}>
        <div className="skel" style={{ width: 180, height: 22 }}/>
      </div>
      <div style={{ padding: '8px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[0,1,2].map(i => <div key={i} className="skel" style={{ width: '100%', height: 160, borderRadius: 18 }}/>)}
      </div>
    </div>
  )
}
