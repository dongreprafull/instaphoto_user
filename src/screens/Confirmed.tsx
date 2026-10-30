import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import { CheckIcon } from './Icons'

interface BookingDetail {
  booking_code: string
  total_amount: string
  photographer_name: string | null
}

export default function Confirmed({ bookingId, onBackHome }: { bookingId: number; onBackHome: () => void }) {
  const [booking, setBooking] = useState<BookingDetail | null>(null)

  useEffect(() => {
    apiFetch<{ booking: BookingDetail }>(`/bookings/status.php?booking_id=${bookingId}`, { auth: false })
      .then((data) => setBooking(data.booking))
      .catch(() => {})
  }, [bookingId])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckIcon color="var(--success)" size={34} />
        </div>
        <div style={{ fontSize: 21, fontWeight: 500 }}>Payment successful</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
          Thanks for booking with Instant Photo{booking?.photographer_name ? ` and for choosing ${booking.photographer_name}` : ''}!
        </div>

        {booking && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 18, width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            <Row label="Booking ID" value={booking.booking_code} />
            <Row label="Amount paid" value={`₹${parseFloat(booking.total_amount).toFixed(2)}`} />
          </div>
        )}
      </div>

      <div style={{ padding: '16px 24px 24px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={onBackHome}
          style={{ width: '100%', height: 52, background: 'var(--accent)', color: '#fff', borderRadius: 14, fontSize: 15, fontWeight: 500 }}
        >
          Back to home
        </button>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  )
}
