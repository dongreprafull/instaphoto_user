import { useState, type CSSProperties } from 'react'
import type { ConfirmationResult } from 'firebase/auth'
import { sendOtp, isFirebaseConfigured } from '../lib/firebase'
import { apiFetch, setSession, ApiError } from '../lib/api'
import { CameraIcon } from './Icons'

type Step = 'phone' | 'otp' | 'name'

export default function Login({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [step, setStep] = useState<Step>('phone')
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null)
  const [idToken, setIdToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSendOtp() {
    setError('')
    if (mobile.length !== 10) return setError('Enter a valid 10-digit mobile number.')
    if (!isFirebaseConfigured()) {
      return setError('Firebase is not configured in this build yet (src/lib/firebaseConfig.ts is empty).')
    }
    setLoading(true)
    try {
      const result = await sendOtp(mobile)
      setConfirmation(result)
      setStep('otp')
    } catch (e: any) {
      setError(e?.message || 'Could not send OTP. Try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp() {
    setError('')
    if (!confirmation || otp.length !== 6) return setError('Enter the 6-digit code.')
    setLoading(true)
    try {
      const cred = await confirmation.confirm(otp)
      const token = await cred.user.getIdToken()
      setIdToken(token)
      await loginWithToken(token)
    } catch (e: any) {
      setError(e?.message || 'Incorrect or expired OTP.')
    } finally {
      setLoading(false)
    }
  }

  async function loginWithToken(token: string, nameOverride?: string) {
    try {
      const data = await apiFetch<{ token: string; user_id: number; name: string; mobile: string }>(
        '/auth/firebase-login.php',
        { method: 'POST', body: { id_token: token, purpose: 'user_login', name: nameOverride }, auth: false }
      )
      setSession(data.token, { userId: data.user_id, name: data.name, mobile: data.mobile })
      onLoggedIn()
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 422) {
        setStep('name')
      } else {
        setError(e?.message || 'Login failed.')
      }
    }
  }

  async function handleSubmitName() {
    setError('')
    if (name.trim() === '') return setError('Enter your name.')
    setLoading(true)
    try {
      await loginWithToken(idToken, name.trim())
    } catch (e: any) {
      setError(e?.message || 'Could not complete registration.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      <div id="recaptcha-container" />
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
            {step === 'phone' && 'Enter your mobile number to continue'}
            {step === 'otp' && `Enter the code sent to +91 ${mobile}`}
            {step === 'name' && "What's your name?"}
          </p>
        </div>

        <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {step === 'phone' && (
            <input
              inputMode="numeric"
              placeholder="10-digit mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              style={inputStyle}
            />
          )}
          {step === 'otp' && (
            <input
              inputMode="numeric"
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              style={inputStyle}
            />
          )}
          {step === 'name' && (
            <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          )}

          {error && <div style={{ color: '#c0392b', fontSize: 12 }}>{error}</div>}

          <button
            disabled={loading}
            onClick={step === 'phone' ? handleSendOtp : step === 'otp' ? handleVerifyOtp : handleSubmitName}
            style={{
              height: 48, background: 'var(--accent)', color: '#fff', borderRadius: 14,
              fontSize: 15, fontWeight: 500, opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Please wait…' : step === 'phone' ? 'Send OTP' : step === 'otp' ? 'Verify & continue' : 'Continue'}
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
