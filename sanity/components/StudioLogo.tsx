export function StudioLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          width: '30px',
          height: '30px',
          borderRadius: '7px',
          background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '900',
          fontSize: '12px',
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '-0.5px',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(249,115,22,0.4)',
        }}
      >
        DW
      </div>
    </div>
  )
}
