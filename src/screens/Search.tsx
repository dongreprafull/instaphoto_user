import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { apiFetch } from '../lib/api'
import { BackIcon } from './Icons'
import MapResizeFix from '../components/MapResizeFix'

interface BookingStatus {
  id: number
  status: 'searching' | 'no_photographer' | 'assigned' | 'on_the_way' | 'arrived' | 'completed' | 'cancelled'
  search_radius_km: string | number
  user_lat: string | number
  user_lng: string | number
}

function RecenterOnLoad({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], 15)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng])
  return null
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
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null)
  const [error, setError] = useState('')
  const foundRef = useRef(false)

  useEffect(() => {
    let active = true
    const poll = async () => {
      try {
        const data = await apiFetch<{ booking: BookingStatus }>(`/bookings/status.php?booking_id=${bookingId}`, { auth: false })
        if (!active) return
        setRadiusKm(Number(data.booking.search_radius_km) || 5)
        setCenter({ lat: Number(data.booking.user_lat), lng: Number(data.booking.user_lng) })
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
        {center ? (
          <MapContainer
            center={[center.lat, center.lng]}
            zoom={15}
            zoomControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            touchZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterOnLoad lat={center.lat} lng={center.lng} />
            <MapResizeFix />
          </MapContainer>
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: '#e3e8ee' }} />
        )}

        {status === 'searching' && (
          <>
            <div className="radar-ring delay" style={ringStyle} />
            <div className="radar-ring" style={ringStyle} />
          </>
        )}
        <div
          style={{
            position: 'absolute', left: '50%', top: '50%', width: 14, height: 14, transform: 'translate(-50%, -50%)',
            background: 'var(--accent)', borderRadius: '50%', border: '3px solid #fff', zIndex: 500,
            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
          }}
        />
        <span
          style={{
            position: 'absolute', left: '50%', top: 'calc(50% + 14px)', transform: 'translateX(-50%)', fontSize: 11,
            background: 'var(--text)', color: '#fff', padding: '3px 8px', borderRadius: 999, zIndex: 500,
          }}
        >
          You are here
        </span>
        <span
          style={{
            position: 'absolute', top: 14, left: 14, fontSize: 11, background: 'var(--surface)', padding: '5px 10px',
            borderRadius: 999, color: 'var(--text-muted)', zIndex: 500,
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
  border: '2px solid var(--accent)', borderRadius: '50%', background: 'rgba(67,56,202,0.15)', zIndex: 500,
}
