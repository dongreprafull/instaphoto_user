import { Fragment } from 'react'
import { mockBooking, packages, formatCurrency } from '../mock/data'
import { CheckIcon, PhoneIcon } from './Icons'

const STEPS: { key: typeof mockBooking.status; label: string }[] = [
  { key: 'assigned', label: 'Assigned' },
  { key: 'on_the_way', label: 'On the way' },
  { key: 'arrived', label: 'Arrived' },
  { key: 'completed', label: 'Completed' },
]

export default function Confirmed({ onBackHome }: { onBackHome: () => void }) {
  const booking = mockBooking
  const pkg = packages.find((p) => p.id === booking.packageId) ?? packages[0]
  const currentIndex = STEPS.findIndex((s) => s.key === booking.status)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: '36px 24px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '8px 0 4px' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--success-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckIcon color="var(--success)" size={30} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 500 }}>Booking confirmed</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{booking.photographer.name} is on the way to your location</div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'var(--accent-bg)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            {booking.photographer.initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{booking.photographer.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{booking.photographer.phoneMasked}</div>
          </div>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--accent)',
              color: '#fff',
              borderRadius: 999,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <PhoneIcon />
            Call
          </button>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <DetailRow label="Booking ID" value={booking.id} />
          <DetailRow label="Package" value={`${pkg.name.replace(' package', '')} · ${formatCurrency(pkg.price)}`} />
          <DetailRow label="Date & time" value={booking.dateLabel} />
          <DetailRow label="Location" value={booking.address} />
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 14 }}>Status</div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {STEPS.map((step, i) => (
              <Fragment key={step.key}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: i <= currentIndex ? 'var(--accent)' : 'var(--border)',
                    }}
                  />
                  <div style={{ fontSize: 10, color: i <= currentIndex ? 'var(--text)' : 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
                    {step.label}
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: i < currentIndex ? 'var(--accent)' : 'var(--border)' }} />
                )}
              </Fragment>
            ))}
          </div>
        </div>

        <button
          onClick={onBackHome}
          style={{ textAlign: 'center', fontSize: 13, color: 'var(--accent)', fontWeight: 500, paddingTop: 6, background: 'none', border: 'none' }}
        >
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
