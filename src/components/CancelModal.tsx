import { useState } from 'react'

export interface CancelResult {
  reason: string
  reasonText: string
}

const REASONS = [
  { value: 'not_receiving_call', label: 'Photographer not receiving call' },
  { value: 'not_moving', label: 'Photographer not moving towards location' },
  { value: 'vehicle_issue', label: 'Vehicle issue' },
  { value: 'other', label: 'Other' },
]

export default function CancelModal({
  title = 'Cancel booking',
  onClose,
  onConfirm,
  busy,
}: {
  title?: string
  onClose: () => void
  onConfirm: (result: CancelResult) => void
  busy?: boolean
}) {
  const [reason, setReason] = useState('')
  const [reasonText, setReasonText] = useState('')

  const canSubmit = reason !== '' && (reason !== 'other' || reasonText.trim().length > 2)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', zIndex: 1000 }}>
      <div style={{ width: '100%', background: 'var(--surface)', borderRadius: '20px 20px 0 0', padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 16, fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Please tell us why — this helps us keep the service reliable.</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {REASONS.map((r) => (
            <label
              key={r.value}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12,
                border: `1px solid ${reason === r.value ? 'var(--accent)' : 'var(--border)'}`,
                background: reason === r.value ? 'var(--accent-bg)' : 'transparent',
              }}
            >
              <input type="radio" name="cancel_reason" value={r.value} checked={reason === r.value} onChange={() => setReason(r.value)} />
              <span style={{ fontSize: 14 }}>{r.label}</span>
            </label>
          ))}
        </div>

        {reason === 'other' && (
          <textarea
            value={reasonText}
            onChange={(e) => setReasonText(e.target.value)}
            placeholder="Please describe the reason"
            rows={3}
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 12, fontSize: 14, resize: 'none' }}
          />
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button onClick={onClose} style={{ flex: 1, height: 48, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 14, fontWeight: 500 }}>
            Back
          </button>
          <button
            disabled={!canSubmit || busy}
            onClick={() => onConfirm({ reason, reasonText: reasonText.trim() })}
            style={{ flex: 1, height: 48, background: '#c0392b', color: '#fff', borderRadius: 12, fontSize: 14, fontWeight: 500, opacity: !canSubmit || busy ? 0.6 : 1 }}
          >
            {busy ? 'Cancelling…' : 'Confirm cancel'}
          </button>
        </div>
      </div>
    </div>
  )
}
