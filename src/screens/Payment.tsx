import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import { BackIcon, StarIcon, CardIcon } from './Icons'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface BookingDetail {
  id: number
  booking_code: string
  package_price: string
  gst_amount: string
  total_amount: string
  photographer_name: string | null
  rating: string | null
  bookings_count: number | null
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve()
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Could not load payment gateway. Check your connection.'))
    document.body.appendChild(script)
  })
}

export default function Payment({
  bookingId,
  onBack,
  onPay,
}: {
  bookingId: number
  onBack: () => void
  onPay: () => void
}) {
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    apiFetch<{ booking: BookingDetail }>(`/bookings/status.php?booking_id=${bookingId}`, { auth: false })
      .then((data) => setBooking(data.booking))
      .catch(() => setError('Could not load booking details.'))
  }, [bookingId])

  async function handlePay() {
    setError('')
    setPaying(true)
    try {
      await loadRazorpayScript()
      const order = await apiFetch<{ order_id: string; amount: number; currency: string; key_id: string }>(
        '/payments/create-order.php',
        { method: 'POST', body: { booking_id: bookingId } }
      )

      const rzp = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: 'Instant Photo',
        description: booking ? `Booking ${booking.booking_code}` : 'Photography booking',
        handler: async (response: any) => {
          try {
            await apiFetch('/payments/verify.php', {
              method: 'POST',
              body: {
                booking_id: bookingId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            })
            onPay()
          } catch (e: any) {
            setError(e?.message || 'Payment verification failed.')
          } finally {
            setPaying(false)
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
        theme: { color: '#4338ca' },
      })
      rzp.open()
    } catch (e: any) {
      setError(e?.message || 'Could not start payment.')
      setPaying(false)
    }
  }

  const price = booking ? parseFloat(booking.package_price) : 0
  const gst = booking ? parseFloat(booking.gst_amount) : 0
  const total = booking ? parseFloat(booking.total_amount) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 24px 16px' }}>
        <button
          onClick={onBack}
          aria-label="Back"
          style={{ display: 'flex', width: 32, height: 32, alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}
        >
          <BackIcon />
        </button>
        <span style={{ fontSize: 16, fontWeight: 500 }}>Confirm &amp; pay</span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '4px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {booking?.photographer_name && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--accent-bg)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 500 }}>
              {booking.photographer_name.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{booking.photographer_name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <StarIcon />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {booking.rating ?? '5.0'} · {booking.bookings_count ?? 0} bookings
                </span>
              </div>
            </div>
          </div>
        )}

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 12 }}>Order summary</div>
          <Row label="Basic package" value={`₹${price.toFixed(2)}`} />
          <Row label="GST (18%)" value={`₹${gst.toFixed(2)}`} muted />
          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0 12px' }} />
          <Row label="Total" value={`₹${total.toFixed(2)}`} bold />
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <CardIcon />
          <div style={{ fontSize: 13 }}>Pay securely via UPI, card or netbanking</div>
        </div>

        {error && <div style={{ color: '#c0392b', fontSize: 13 }}>{error}</div>}
      </div>

      <div style={{ padding: '16px 24px 24px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={handlePay}
          disabled={!booking || paying}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 52, background: 'var(--accent)', color: '#fff', borderRadius: 14, fontSize: 15, fontWeight: 500, opacity: !booking || paying ? 0.7 : 1 }}
        >
          {paying ? 'Processing…' : `Pay ₹${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  )
}

function Row({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: bold ? 16 : 14, fontWeight: bold ? 500 : 400, color: muted ? 'var(--text-muted)' : 'var(--text)', marginBottom: bold ? 0 : 8 }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
