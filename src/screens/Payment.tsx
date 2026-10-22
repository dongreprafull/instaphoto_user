import { packages, mockPhotographer, GST_RATE, formatCurrency } from '../mock/data'
import { BackIcon, StarIcon, CardIcon } from './Icons'

// UI-only pass: onPay below just advances the screen. Wiring this up means
// calling POST /bookings/create.php (reserves the booking + assigns
// mockPhotographer's real id), then creating a Razorpay order and opening
// Razorpay Checkout; onPay fires only after the gateway's success callback
// and a server-side webhook verification, never on tap alone.
export default function Payment({ onBack, onPay }: { onBack: () => void; onPay: () => void }) {
  const pkg = packages[0]
  const gst = pkg.price * GST_RATE
  const total = pkg.price + gst

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
        <span style={{ fontSize: 16, fontWeight: 500 }}>Confirm &amp; pay</span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '4px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'var(--accent-bg)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 500,
            }}
          >
            {mockPhotographer.initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{mockPhotographer.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <StarIcon />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {mockPhotographer.rating} · {mockPhotographer.bookingsCount} bookings
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{mockPhotographer.distanceKm} km away</div>
            <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 500 }}>~{mockPhotographer.etaMins} min</div>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 12 }}>Order summary</div>
          <Row label={pkg.name} value={formatCurrency(pkg.price)} />
          <Row label="GST (18%)" value={formatCurrency(gst)} muted />
          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0 12px' }} />
          <Row label="Total" value={formatCurrency(total)} bold />
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <CardIcon />
          <div style={{ fontSize: 13 }}>Pay securely via UPI, card or netbanking</div>
        </div>
      </div>

      <div style={{ padding: '16px 24px 24px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={onPay}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 52,
            background: 'var(--accent)',
            color: '#fff',
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 500,
          }}
        >
          Pay {formatCurrency(total)}
        </button>
      </div>
    </div>
  )
}

function Row({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: bold ? 16 : 14,
        fontWeight: bold ? 500 : 400,
        color: muted ? 'var(--text-muted)' : 'var(--text)',
        marginBottom: bold ? 0 : 8,
      }}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
