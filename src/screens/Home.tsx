import { useEffect, useState } from 'react'
import { apiFetch, getProfile } from '../lib/api'
import { getCurrentLocation } from '../lib/location'
import { CameraIcon, PinIcon, CheckIcon, SearchIcon } from './Icons'

interface ApiPackage {
  id: number
  name: string
  price: number
  photos_count: number
  duration_mins: number
  delivery_note: string
}

export default function Home({ onBooked }: { onBooked: (bookingId: number) => void }) {
  const [pkg, setPkg] = useState<ApiPackage | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const profile = getProfile()

  useEffect(() => {
    apiFetch<{ packages: ApiPackage[] }>('/packages/list.php', { auth: false })
      .then((data) => setPkg(data.packages[0] ?? null))
      .catch(() => setError('Could not load packages. Check your connection.'))
  }, [])

  async function handleFindPhotographer() {
    if (!pkg) return
    setError('')
    setLoading(true)
    try {
      const loc = await getCurrentLocation()
      const data = await apiFetch<{ booking_id: number; status: string }>('/bookings/create.php', {
        method: 'POST',
        body: { package_id: pkg.id, lat: loc.lat, lng: loc.lng },
      })
      onBooked(data.booking_id)
    } catch (e: any) {
      setError(e?.message || 'Could not start search. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              display: 'flex', width: 28, height: 28, alignItems: 'center', justifyContent: 'center',
              background: 'var(--accent)', borderRadius: 8, color: '#fff',
            }}
          >
            <CameraIcon />
          </span>
          <span style={{ fontSize: 17, fontWeight: 500 }}>Instant Photo</span>
        </div>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface)',
            border: '1px solid var(--border)', borderRadius: 999, padding: '6px 12px',
          }}
        >
          <PinIcon color="var(--text-muted)" />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Current location</span>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 500 }}>Hi{profile ? ` ${profile.name.split(' ')[0]}` : ''}</h1>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>Book a photographer near you in minutes</p>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>
            Choose a package
          </div>

          {pkg ? (
            <div style={{ position: 'relative', background: 'var(--accent-bg)', border: '2px solid var(--accent)', borderRadius: 16, padding: 20 }}>
              <span
                style={{
                  position: 'absolute', top: 16, right: 16, background: 'var(--accent)', color: '#fff',
                  fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 999,
                }}
              >
                Selected
              </span>
              <div style={{ fontSize: 16, fontWeight: 500 }}>{pkg.name}</div>
              <div style={{ fontSize: 26, fontWeight: 500, color: 'var(--accent)', marginTop: 2 }}>₹{pkg.price}</div>
              <div style={{ height: 1, background: 'var(--accent-border)', margin: '14px 0' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Feature text={`${pkg.photos_count} photographs`} />
                <Feature text={`${pkg.duration_mins}-minute session`} />
                <Feature text={pkg.delivery_note} />
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading packages…</div>
          )}
          <p style={{ margin: '10px 2px 0', fontSize: 12, color: 'var(--text-muted)' }}>18% GST applies at checkout</p>
        </div>

        {error && <div style={{ color: '#c0392b', fontSize: 13 }}>{error}</div>}
      </div>

      <div style={{ padding: '16px 24px 24px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={handleFindPhotographer}
          disabled={!pkg || loading}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52,
            background: 'var(--accent)', color: '#fff', borderRadius: 14, fontSize: 15, fontWeight: 500,
            opacity: !pkg || loading ? 0.7 : 1,
          }}
        >
          <SearchIcon />
          {loading ? 'Starting search…' : 'Find photographer near me'}
        </button>
      </div>
    </div>
  )
}

function Feature({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <CheckIcon color="var(--accent)" />
      <span style={{ fontSize: 13 }}>{text}</span>
    </div>
  )
}
