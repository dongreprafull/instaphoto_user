import { initializeApp, getApps } from 'firebase/app'
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth'
import { firebaseConfig } from './firebaseConfig'

function app() {
  return getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
}

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId)
}

let recaptchaVerifier: RecaptchaVerifier | null = null

// Call once a <div id="recaptcha-container"> is mounted in the DOM.
export function getRecaptchaVerifier(containerId = 'recaptcha-container'): RecaptchaVerifier {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(getAuth(app()), containerId, { size: 'invisible' })
  }
  return recaptchaVerifier
}

// mobile: bare 10-digit Indian number. Returns a ConfirmationResult whose
// .confirm(code) resolves to a UserCredential with a Firebase ID token.
export async function sendOtp(mobile: string): Promise<ConfirmationResult> {
  const verifier = getRecaptchaVerifier()
  return signInWithPhoneNumber(getAuth(app()), `+91${mobile}`, verifier)
}
