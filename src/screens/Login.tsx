import { useState, type CSSProperties } from 'react'
import { apiFetch, setSession } from '../lib/api'
import { CameraIcon } from './Icons'

type Mode = 'login' | 'register'

export default function Login({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  async function handleLogin() {
    setError('')
    setInfo('')
    if (mobile.length !== 10) return setError('Enter a valid 10-digit mobile number.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    setLoading(true)
    try {
      const data = await apiFetch<{ token: string; user_id: number; name: string; mobile: string }>(
        '/auth/login.php',
        { method: 'POST', body: { mobile, password, purpose: 'user_login' }, auth: false }
      )
      setSession(data.token, { userId: data.user_id, name: data.name, mobile: data.mobile })
      onLoggedIn()
    } catch (e: any) {
      setError(e?.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword() {
    setError('')
    setInfo('')
    if (mobile.length !== 10) return setError('Enter your 10-digit mobile number above first.')
    setLoading(true)
    try {
      const data = await apiFetch<{ message: string }>('/auth/forgot-password.php', {
        method: 'POST',
        body: { mobile, purpose: 'user_login' },
        auth: false,
      })
      setInfo(data.message)
    } catch (e: any) {
      setError(e?.message || 'Could not send request.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister() {
    setError('')
    if (name.trim() === '') return setError('Enter your name.')
    if (mobile.length !== 10) return setError('Enter a valid 10-digit mobile number.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== confirmPassword) return setError('Passwords do not match.')
    setLoading(true)
    try {
      const data = await apiFetch<{ token: string; user_id: number; name: string; mobile: string }>(
        '/auth/user-register.php',
        { method: 'POST', body: { name: name.trim(), mobile, password }, auth: false }
      )
      setSession(data.token, { userId: data.user_id, name: data.name, mobile: data.mobile })
      onLoggedIn()
    } catch (e: any) {
      setError(e?.message || 'Could not create account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20 }}>
        <span
          style={{
            display: 'flex', width: 52, height: 52, alignItems: 'center', justifyContent: 'center',
            background: 'var(--accent)', borderRadius: 16, color: '#fff',
          }}
        >
          <CameraIcon />
        </span>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 500 }}>Instant Photo</h1>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
            {mode === 'login' ? 'Log in with your mobile number' : 'Create an account to get started'}
          </p>
        </div>

        <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'register' && (
            <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          )}
          <input
            inputMode="numeric"
            placeholder="10-digit mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          {mode === 'register' && (
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
            />
          )}

          {mode === 'login' && (
            <button
              onClick={handleForgotPassword}
              disabled={loading}
              style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--text-muted)', textAlign: 'right', padding: 0 }}
            >
              Forgot password?
            </button>
          )}

          {error && <div style={{ color: '#c0392b', fontSize: 12 }}>{error}</div>}
          {info && <div style={{ color: 'var(--accent)', fontSize: 12 }}>{info}</div>}

          <button
            disabled={loading}
            onClick={mode === 'login' ? handleLogin : handleRegister}
            style={{
              height: 48, background: 'var(--accent)', color: '#fff', borderRadius: 14,
              fontSize: 15, fontWeight: 500, opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>

          <button
            onClick={() => {
              setError('')
              setInfo('')
              setConfirmPassword('')
              setMode(mode === 'login' ? 'register' : 'login')
            }}
            style={{ background: 'none', border: 'none', fontSize: 13, color: 'var(--accent)', fontWeight: 500, padding: '4px 0' }}
          >
            {mode === 'login' ? "New here? Create an account" : 'Already have an account? Log in'}
          </button>
        </div>
      </div>
    </div>
  )
}

const inputStyle: CSSProperties = {
  height: 48,
  borderRadius: 14,
  border: '1px solid var(--border)',
  padding: '0 16px',
  fontSize: 15,
  background: 'var(--surface)',
}
