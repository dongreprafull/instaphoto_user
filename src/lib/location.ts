import { Geolocation } from '@capacitor/geolocation'

export interface LatLng {
  lat: number
  lng: number
}

// Fallback center used only if GPS genuinely can't produce a fix (permission
// denied, indoors with no signal, emulator with no mock location, etc.) —
// keeps booking flow working instead of showing a hard "Location
// unavailable" error. Falls back to the last fix we ever got on this
// device, then to a sane default.
export const DEFAULT_CENTER: LatLng = { lat: 18.5204, lng: 73.8567 }

const LAST_KNOWN_KEY = 'ip_last_known_location'

export async function getCurrentLocation(): Promise<LatLng> {
  try {
    const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 8000 })
    const loc: LatLng = { lat: pos.coords.latitude, lng: pos.coords.longitude }
    try {
      localStorage.setItem(LAST_KNOWN_KEY, JSON.stringify(loc))
    } catch {
      // localStorage can throw in some webview contexts — not fatal.
    }
    return loc
  } catch {
    try {
      const raw = localStorage.getItem(LAST_KNOWN_KEY)
      if (raw) return JSON.parse(raw)
    } catch {
      // ignore
    }
    return DEFAULT_CENTER
  }
}
