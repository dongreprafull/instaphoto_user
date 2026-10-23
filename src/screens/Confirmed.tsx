import { Fragment, useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import { CheckIcon, PhoneIcon } from './Icons'

type Status = 'assigned' | 'on_the_way' | 'arrived' | 'completed'

const STEPS: { key: Status; label: string }[] = [
  { key: 'assigned', label: 'Assigned' },
  { key: 'on_the_way', label: 'On the way' },
  { key: 'arrived', label: 'Arrived' },
  { key: 'completed', label: 'Completed' },
]

interface BookingDetail {
  id: number
  booking_code: string
  status: Status
  total_amount: string
  address: string | null
  created_at: string
  photographer_name: string | null
  photographer_mobile: string | null
}

export default function Confirmed({ bookingId, onBackHome }: { bookingId: number; onBackHome: () => void }) {
  const [booking, setBooking] = useState<BookingDetail | null>(null)

  useEffect(() => {
    let active = true
    const poll = () =>
      apiFetch<{ booking: BookingDetail }>(`/bookings/status.php?booking_id=${bookingId}`, { auth: false })
        .then((data) => active && setBooking(data.booking))
        .catch(() => {})
    poll()
    const interval = setInterval(poll, 4000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [bookingId])

  const currentIndex = booking ? STEPS.findIndex((s) => s.key === booking.status) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: '36px 24px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '8px 0 4px' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckIcon color="var(--success)" size={30} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 500 }}>Booking confirmed</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {booking?.photographer_name ? `${booking.photographer_name} is on the way to your location` : 'Your photographer is on the way'}
          </div>
        </div>

        {booking?.photographer_name && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent-bg)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 500 }}>
              {booking.photographer_name.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{booking.photographer_name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{booking.photographer_mobile}</div>
            </div>
            <a
              href={booking.photographer_mobile ? `tel:${booking.photographer_mobile}` : undefined}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--accent)', color: '#fff', borderRadius: 999, padding: '8px 14px', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}
            >
              <PhoneIcon />
              Call
            </a>
          </div>
        )}

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <DetailRow label="Booking ID" value={booking?.booking_code ?? '…'} />
          <DetailRow label="Amount" value={booking ? `₹${parseFloat(booking.total_amount).toFixed(2)}` : '…'} />
          <DetailRow label="Location" value={booking?.address ?? '…'} />
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 14 }}>Status</div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {STEPS.map((step, i) => (
              <Fragment key={step.key}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: i <= currentIndex ? 'var(--accent)' : 'var(--border)' }} />
                  <div style={{ fontSize: 10, color: i <= currentIndex ? 'var(--text)' : 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
                    {step.label}
                  </div>
                </div>
                {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < currentIndex ? 'var(--accent)' : 'var(--border)' }} />}
              </Fragment>
            ))}
          </div>
        </div>

        <button onClick={onBackHome} style={{ textAlign: 'center', fontSize: 13, color: 'var(--accent)', fontWeight: 500, paddingTop: 6, background: 'none', border: 'none' }}>
          Back to home
        </button>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  )
}
