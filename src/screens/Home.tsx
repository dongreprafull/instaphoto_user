import { packages } from '../mock/data'
import { CameraIcon, PinIcon, CheckIcon, SearchIcon } from './Icons'

export default function Home({ onFindPhotographer }: { onFindPhotographer: () => void }) {
  const pkg = packages[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              display: 'flex',
              width: 28,
              height: 28,
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--accent)',
              borderRadius: 8,
              color: '#fff',
            }}
          >
            <CameraIcon />
          </span>
          <span style={{ fontSize: 17, fontWeight: 500 }}>Instant Photo</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 999,
            padding: '6px 12px',
          }}
        >
          <PinIcon color="var(--text-muted)" />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Pune</span>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 500 }}>Hi there</h1>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>Book a photographer near you in minutes</p>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>
            Choose a package
          </div>

          <div style={{ position: 'relative', background: 'var(--accent-bg)', border: '2px solid var(--accent)', borderRadius: 16, padding: 20 }}>
            <span
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'var(--accent)',
                color: '#fff',
                fontSize: 11,
                fontWeight: 500,
                padding: '3px 10px',
                borderRadius: 999,
              }}
            >
              Selected
            </span>
            <div style={{ fontSize: 16, fontWeight: 500 }}>{pkg.name}</div>
            <div style={{ fontSize: 26, fontWeight: 500, color: 'var(--accent)', marginTop: 2 }}>₹{pkg.price}</div>
            <div style={{ height: 1, background: 'var(--accent-border)', margin: '14px 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Feature text={`${pkg.photos} photographs`} />
              <Feature text={`${pkg.durationMins}-minute session`} />
              <Feature text={pkg.delivery} />
            </div>
          </div>
          <p style={{ margin: '10px 2px 0', fontSize: 12, color: 'var(--text-muted)' }}>18% GST applies at checkout</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Recent bookings
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, fontSize: 13, color: 'var(--text-muted)' }}>
            No bookings yet — your first session will show up here.
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 24px 24px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={onFindPhotographer}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            height: 52,
            background: 'var(--accent)',
            color: '#fff',
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 500,
          }}
        >
          <SearchIcon />
          Find photographer near me
        </button>
      </div>
    </div>
  )
}

function Feature({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <CheckIcon color="var(--accent)" />
      <span style={{ fontSize: 13 }}>{text}</span>
    </div>
  )
}
