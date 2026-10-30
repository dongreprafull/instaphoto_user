import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

/**
 * Forces Leaflet to re-measure its container after mount. Needed because in
 * an Android WebView the map's parent can report a stale/zero size on the
 * very first paint (especially right after a screen transition), which
 * makes the map render only partially or at the wrong size until the user
 * interacts with it. Call this once per <MapContainer>.
 */
export default function MapResizeFix() {
  const map = useMap()
  useEffect(() => {
    const timers = [100, 300, 600].map((ms) => setTimeout(() => map.invalidateSize(), ms))
    return () => timers.forEach(clearTimeout)
  }, [map])
  return null
}
