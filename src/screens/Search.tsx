import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '../lib/api'
import { BackIcon } from './Icons'

interface BookingStatus {
  id: number
  status: 'searching' | 'no_photographer' | 'assigned' | 'on_the_way' | 'arrived' | 'completed' | 'cancelled'
  search_radius_km: string | number
}

export default function Search({
  bookingId,
  onBack,
  onCancel,
  onFound,
}: {
  bookingId: number
  onBack: () => void
  onCancel: () => void
  onFound: () => void
}) {
  const [status, setStatus] = useState<'searching' | 'no_photographer'>('searching')
  const [radiusKm, setRadiusKm] = useState(5)
  const [error, setError] = useState('')
  const foundRef = useRef(false)

  useEffect(() => {
    let active = true
    const poll = async () => {
      try {
        const data = await apiFetch<{ booking: BookingStatus }>(`/bookings/status.php?booking_id=${bookingId}`, { auth: false })
        if (!active) return
        setRadiusKm(Number(data.booking.search_radius_km) || 5)
        if (data.booking.status === 'assigned' && !foundRef.current) {
          foundRef.current = true
          onFound()
        } else if (data.booking.status === 'no_photographer') {
          setStatus('no_photographer')
        } else if (data.booking.status === 'cancelled') {
          onCancel()
        }
      } catch (e: any) {
        if (active) setError(e?.message || 'Lost connection — retrying…')
      }
    }
    poll()
    const interval = setInterval(poll, 2500)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [bookingId, onFound, onCancel])

  async function handleRetry() {
    setError('')
    setStatus('searching')
    try {
      await apiFetch(`/bookings/retry-search.php`, { method: 'POST', body: { booking_id: bookingId } })
    } catch (e: any) {
      setError(e?.message || 'Could not retry search.')
    }
  }

  async function handleCancel() {
    try {
      await apiFetch(`/bookings/cancel.php`, { method: 'POST', body: { booking_id: bookingId } })
    } catch {
      // ignore — still navigate away
    }
    onCancel()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 24px 16px' }}>
        <button
          onClick={onBack}
          aria-label="Back"
          style={{
            display: 'flex', width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
          }}
        >
          <BackIcon />
        </button>
        <span style={{ fontSize: 16, fontWeight: 500 }}>
          {status === 'searching' ? 'Finding a photographer' : 'No photographer found'}
        </span>
      </div>

      <div style={{ position: 'relative', margin: '0 24px', height: 360, borderRadius: 20, overflow: 'hidden', background: '#e3e8ee' }}>
        <svg width="100%" height="100%" viewBox="0 0 342 360" preserveAspectRatio="none" aria-hidden="true">
          <rect width="342" height="360" fill="#e3e8ee" />
          <path d="M0 80 H342" stroke="#cbd3db" strokeWidth={3} />
          <path d="M0 220 H342" stroke="#cbd3db" strokeWidth={3} />
          <path d="M110 0 V360" stroke="#cbd3db" strokeWidth={3} />
          <path d="M250 0 V360" stroke="#cbd3db" strokeWidth={3} />
        </svg>
        {status === 'searching' && (
          <>
            <div className="radar-ring delay" style={ringStyle} />
            <div className="radar-ring" style={ringStyle} />
          </>
        )}
        <div
          style={{
            position: 'absolute', left: '50%', top: '50%', width: 14, height: 14, transform: 'translate(-50%, -50%)',
            background: 'var(--accent)', borderRadius: '50%', border: '3px solid #fff',
          }}
        />
        <span
          style={{
            position: 'absolute', left: '50%', top: 'calc(50% + 14px)', transform: 'translateX(-50%)', fontSize: 11,
            background: 'var(--text)', color: '#fff', padding: '3px 8px', borderRadius: 999,
          }}
        >
          You are here
        </span>
        <span
          style={{
            position: 'absolute', top: 14, left: 14, fontSize: 11, background: 'var(--surface)', padding: '5px 10px',
            borderRadius: 999, color: 'var(--text-muted)',
          }}
        >
          Searching within {radiusKm} km
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 }}>
        {status === 'searching' ? (
          <>
            <span
              style={{
                display: 'inline-block', width: 22, height: 22, border: '3px solid var(--border)',
                borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.9s linear infinite',
              }}
            />
            <div style={{ fontSize: 14, fontWeight: 500 }}>Looking for available photographers…</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 14, fontWeight: 500 }}>No photographers are available right now.</div>
            <button
              onClick={handleRetry}
              style={{ height: 44, padding: '0 20px', background: 'var(--accent)', color: '#fff', borderRadius: 12, fontSize: 14, fontWeight: 500 }}
            >
              Search again
            </button>
          </>
        )}
        {error && <div style={{ color: '#c0392b', fontSize: 12 }}>{error}</div>}
      </div>

      <div style={{ padding: '16px 24px 24px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={handleCancel}
          style={{ width: '100%', height: 48, background: 'var(--surface)', border: '1px solid #d7d5ce', borderRadius: 14, fontSize: 14, fontWeight: 500, color: 'var(--text)' }}
        >
          Cancel search
        </button>
      </div>
    </div>
  )
}

const ringStyle = {
  position: 'absolute' as const, left: '50%', top: '50%', width: 16, height: 16, transform: 'translate(-50%, -50%)',
  border: '2px solid var(--accent)', borderRadius: '50%', background: 'rgba(67,56,202,0.15)',
}
