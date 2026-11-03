import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import { BackIcon } from './Icons'

interface BookingRow {
  id: number
  booking_code: string
  status: string
  total_amount: string
  cancel_reason: string | null
  created_at: string
  completed_at: string | null
  package_name: string
  photographer_name: string | null
}

const STATUS_COLOR: Record<string, { bg: string; fg: string }> = {
  completed: { bg: 'var(--success-bg)', fg: 'var(--success)' },
  cancelled: { bg: 'rgba(192,57,43,0.1)', fg: '#c0392b' },
  assigned: { bg: 'var(--accent-bg)', fg: 'var(--accent)' },
  on_the_way: { bg: 'var(--accent-bg)', fg: 'var(--accent)' },
  arrived: { bg: 'var(--accent-bg)', fg: 'var(--accent)' },
  searching: { bg: 'var(--accent-bg)', fg: 'var(--accent)' },
  no_photographer: { bg: 'rgba(192,57,43,0.1)', fg: '#c0392b' },
}

function label(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function MyBookings({ onBack }: { onBack: () => void }) {
  const [bookings, setBookings] = useState<BookingRow[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch<{ bookings: BookingRow[] }>('/users/bookings.php')
      .then((data) => setBookings(data.bookings))
      .catch(() => setError('Could not load bookings.'))
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 24px 16px' }}>
        <button onClick={onBack} aria-label="Back" style={{ display: 'flex', width: 32, height: 32, alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <BackIcon />
        </button>
        <span style={{ fontSize: 16, fontWeight: 500 }}>My bookings</span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '4px 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {error && <div style={{ color: '#c0392b', fontSize: 13 }}>{error}</div>}
        {!bookings && !error && <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginTop: 24 }}>Loading…</div>}
        {bookings && bookings.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginTop: 24 }}>No bookings yet.</div>}

        {bookings?.map((b) => {
          const color = STATUS_COLOR[b.status] || { bg: 'var(--surface)', fg: 'var(--text-muted)' }
          return (
            <div key={b.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{b.booking_code}</span>
                <span style={{ fontSize: 11, fontWeight: 500, background: color.bg, color: color.fg, padding: '3px 10px', borderRadius: 999 }}>{label(b.status)}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {b.package_name}{b.photographer_name ? ` · ${b.photographer_name}` : ''}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>{new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span style={{ fontWeight: 500 }}>₹{parseFloat(b.total_amount).toFixed(2)}</span>
              </div>
              {b.status === 'cancelled' && b.cancel_reason && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Reason: {b.cancel_reason}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
