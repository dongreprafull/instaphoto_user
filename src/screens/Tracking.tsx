import { Fragment, useEffect, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { apiFetch } from '../lib/api'
import { CheckIcon, PhoneIcon } from './Icons'
import MapResizeFix from '../components/MapResizeFix'

type Status = 'assigned' | 'on_the_way' | 'arrived' | 'completed'

const STEPS: { key: Status; label: string }[] = [
  { key: 'assigned', label: 'Assigned' },
  { key: 'on_the_way', label: 'On the way' },
  { key: 'arrived', label: 'Arrived' },
  { key: 'completed', label: 'Completed' },
]

const STATUS_MESSAGE: Record<Status, (name: string) => string> = {
  assigned: (name) => `${name} has been assigned to your booking`,
  on_the_way: (name) => `${name} is on the way to you`,
  arrived: (name) => `${name} has arrived at your location`,
  completed: () => 'Session completed',
}

interface BookingDetail {
  id: number
  booking_code: string
  status: Status
  total_amount: string
  address: string | null
  user_lat: string | number
  user_lng: string | number
  photographer_name: string | null
  photographer_mobile: string | null
  photographer_lat: string | number | null
  photographer_lng: string | number | null
  payment_status: 'created' | 'paid' | 'failed' | null
}

function FitBothMarkers({ a, b }: { a: [number, number]; b: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (b) map.fitBounds([a, b], { padding: [36, 36], maxZoom: 16 })
    else map.setView(a, 14)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a[0], a[1], b?.[0], b?.[1]])
  return null
}

function MapMarker({ lat, lng, color, label }: { lat: number; lng: number; color: string; label: string }) {
  const icon = divIcon({
    className: '',
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;transform:translateY(-6px)">
      <span style="font-size:10px;font-weight:600;background:${color};color:#fff;padding:2px 6px;border-radius:999px;white-space:nowrap">${label}</span>
      <span style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.35)"></span>
    </div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
  return <Marker position={[lat, lng]} icon={icon} />
}

export default function Tracking({
  bookingId,
  onPayNow,
}: {
  bookingId: number
  onPayNow: () => void
}) {
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
  const userLat = booking ? Number(booking.user_lat) : null
  const userLng = booking ? Number(booking.user_lng) : null
  const photographerLat = booking?.photographer_lat !== null && booking?.photographer_lat !== undefined ? Number(booking.photographer_lat) : null
  const photographerLng = booking?.photographer_lng !== null && booking?.photographer_lng !== undefined ? Number(booking.photographer_lng) : null
  const needsPayment = booking?.status === 'completed' && booking.payment_status !== 'paid'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: '36px 24px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '8px 0 4px' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckIcon color="var(--success)" size={30} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 500 }}>Booking confirmed</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
            {booking ? STATUS_MESSAGE[booking.status](booking.photographer_name || 'Your photographer') : 'Loading…'}
          </div>
        </div>

        {userLat !== null && userLng !== null && (
          <div style={{ height: 220, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <MapContainer center={[userLat, userLng]} zoom={14} zoomControl={false} style={{ height: '100%', width: '100%' }}>
              <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapResizeFix />
              <FitBothMarkers
                a={[userLat, userLng]}
                b={photographerLat !== null && photographerLng !== null ? [photographerLat, photographerLng] : null}
              />
              <MapMarker lat={userLat} lng={userLng} color="#4338ca" label="You" />
              {photographerLat !== null && photographerLng !== null && (
                <MapMarker lat={photographerLat} lng={photographerLng} color="#15803d" label={booking?.photographer_name || 'Photographer'} />
              )}
            </MapContainer>
          </div>
        )}

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
      </div>

      {needsPayment && (
        <div style={{ padding: '16px 24px 24px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={onPayNow}
            style={{ width: '100%', height: 52, background: 'var(--accent)', color: '#fff', borderRadius: 14, fontSize: 15, fontWeight: 500 }}
          >
            Session complete — Pay {booking ? `₹${parseFloat(booking.total_amount).toFixed(2)}` : ''} now
          </button>
        </div>
      )}
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
