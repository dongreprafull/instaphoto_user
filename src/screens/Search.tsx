import { useEffect } from 'react'
import { SEARCH_RADIUS_KM, SEARCH_TIMEOUT_SECONDS } from '../mock/data'
import { BackIcon } from './Icons'

// UI-only pass: once the PHP API is wired up, this effect is replaced by a
// poll against POST /bookings/status.php (or a WebSocket/Firebase listener)
// that resolves to onFound() the moment a photographer accepts, and to a
// "no photographer available" state if SEARCH_TIMEOUT_SECONDS elapses with
// no acceptance.
export default function Search({
  onBack,
  onCancel,
  onFound,
}: {
  onBack: () => void
  onCancel: () => void
  onFound: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onFound, 2600)
    return () => clearTimeout(timer)
  }, [onFound])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 24px 16px' }}>
        <button
          onClick={onBack}
          aria-label="Back"
          style={{
            display: 'flex',
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 10,
          }}
        >
          <BackIcon />
        </button>
        <span style={{ fontSize: 16, fontWeight: 500 }}>Finding a photographer</span>
      </div>

      <div style={{ position: 'relative', margin: '0 24px', height: 360, borderRadius: 20, overflow: 'hidden', background: '#e3e8ee' }}>
        <svg width="100%" height="100%" viewBox="0 0 342 360" preserveAspectRatio="none" aria-hidden="true">
          <rect width="342" height="360" fill="#e3e8ee" />
          <path d="M0 80 H342" stroke="#cbd3db" strokeWidth={3} />
          <path d="M0 220 H342" stroke="#cbd3db" strokeWidth={3} />
          <path d="M110 0 V360" stroke="#cbd3db" strokeWidth={3} />
          <path d="M250 0 V360" stroke="#cbd3db" strokeWidth={3} />
          <circle cx="70" cy="130" r="4" fill="#b9c2cb" />
          <circle cx="190" cy="60" r="4" fill="#b9c2cb" />
          <circle cx="300" cy="260" r="4" fill="#b9c2cb" />
          <circle cx="40" cy="300" r="4" fill="#b9c2cb" />
        </svg>
        <div
          className="radar-ring delay"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 16,
            height: 16,
            transform: 'translate(-50%, -50%)',
            border: '2px solid var(--accent)',
            borderRadius: '50%',
            background: 'rgba(67,56,202,0.15)',
          }}
        />
        <div
          className="radar-ring"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 16,
            height: 16,
            transform: 'translate(-50%, -50%)',
            border: '2px solid var(--accent)',
            borderRadius: '50%',
            background: 'rgba(67,56,202,0.15)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 14,
            height: 14,
            transform: 'translate(-50%, -50%)',
            background: 'var(--accent)',
            borderRadius: '50%',
            border: '3px solid #fff',
          }}
        />
        <span
          style={{
            position: 'absolute',
            left: '50%',
            top: 'calc(50% + 14px)',
            transform: 'translateX(-50%)',
            fontSize: 11,
            background: 'var(--text)',
            color: '#fff',
            padding: '3px 8px',
            borderRadius: 999,
          }}
        >
          You are here
        </span>
        <span
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            fontSize: 11,
            background: 'var(--surface)',
            padding: '5px 10px',
            borderRadius: 999,
            color: 'var(--text-muted)',
          }}
        >
          Searching within {SEARCH_RADIUS_KM} km
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 }}>
        <span
          style={{
            display: 'inline-block',
            width: 22,
            height: 22,
            border: '3px solid var(--border)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            animation: 'spin 0.9s linear infinite',
          }}
        />
        <div style={{ fontSize: 14, fontWeight: 500 }}>Looking for available photographers…</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Usually takes up to {SEARCH_TIMEOUT_SECONDS} seconds</div>
      </div>

      <div style={{ padding: '16px 24px 24px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={onCancel}
          style={{
            width: '100%',
            height: 48,
            background: 'var(--surface)',
            border: '1px solid #d7d5ce',
            borderRadius: 14,
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--text)',
          }}
        >
          Cancel search
        </button>
      </div>
    </div>
  )
}
