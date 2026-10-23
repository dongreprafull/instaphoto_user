// Thin fetch wrapper for the live backend at instantphoto.in. Stores the
// bearer token issued by /api/auth/firebase-login.php in localStorage so a
// relaunch of the app doesn't force a re-login.
export const API_BASE = 'https://instantphoto.in/api'

const TOKEN_KEY = 'ip_user_token'
const PROFILE_KEY = 'ip_user_profile'

export interface UserProfile {
  userId: number
  name: string
  mobile: string
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getProfile(): UserProfile | null {
  const raw = localStorage.getItem(PROFILE_KEY)
  return raw ? JSON.parse(raw) : null
}

export function setSession(token: string, profile: UserProfile) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(PROFILE_KEY)
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function apiFetch<T = any>(
  path: string,
  options: { method?: string; body?: any; auth?: boolean } = {}
): Promise<T> {
  const { method = 'GET', body, auth = true } = options
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok || data?.success === false) {
    throw new ApiError(data?.message || `Request failed (${res.status})`, res.status)
  }
  return data
}
