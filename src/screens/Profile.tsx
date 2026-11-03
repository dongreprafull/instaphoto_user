import { useEffect, useState, type CSSProperties } from 'react'
import { apiFetch, clearSession } from '../lib/api'
import { BackIcon, LogoutIcon } from './Icons'

interface UserMe {
  id: number
  name: string
  mobile: string
  address: string | null
  created_at: string
}

export default function Profile({ onBack, onMyBookings, onLogout }: { onBack: () => void; onMyBookings: () => void; onLogout: () => void }) {
  const [me, setMe] = useState<UserMe | null>(null)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    apiFetch<{ user: UserMe }>('/users/me.php')
      .then((data) => {
        setMe(data.user)
        setName(data.user.name)
        setAddress(data.user.address || '')
      })
      .catch(() => setError('Could not load profile.'))
  }, [])

  async function handleSave() {
    if (name.trim().length < 2) return
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      await apiFetch('/users/update-profile.php', { method: 'POST', body: { name: name.trim(), address: address.trim() } })
      setSuccess('Profile updated.')
    } catch (e: any) {
      setError(e?.message || 'Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  function handleLogout() {
    clearSession()
    onLogout()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 24px 16px' }}>
        <button onClick={onBack} aria-label="Back" style={{ display: 'flex', width: 32, height: 32, alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <BackIcon />
        </button>
        <span style={{ fontSize: 16, fontWeight: 500 }}>Profile</span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '4px 24px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '8px 0' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--accent-bg)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 500 }}>
            {(me?.name || '?').slice(0, 2).toUpperCase()}
          </div>
        </div>

        <Field label="Full name">
          <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        </Field>

        <Field label="Mobile number">
          <input value={me ? `+91 ${me.mobile}` : ''} disabled style={{ ...inputStyle, color: 'var(--text-muted)' }} />
        </Field>

        <Field label="Address">
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Add your address" style={inputStyle} />
        </Field>

        {error && <div style={{ color: '#c0392b', fontSize: 13 }}>{error}</div>}
        {success && <div style={{ color: 'var(--success)', fontSize: 13 }}>{success}</div>}

        <button onClick={onMyBookings} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 16, textAlign: 'left' }}>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>My bookings</div>
          <span style={{ fontSize: 12, color: 'var(--accent)' }}>View →</span>
        </button>

        <button
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', height: 46, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}
        >
          <LogoutIcon color="var(--text-muted)" />
          Log out
        </button>
      </div>

      <div style={{ padding: '16px 24px 24px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ width: '100%', height: 52, background: 'var(--accent)', color: '#fff', borderRadius: 14, fontSize: 15, fontWeight: 500, opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: CSSProperties = {
  width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
  padding: '14px 16px', fontSize: 15, outline: 'none',
}
