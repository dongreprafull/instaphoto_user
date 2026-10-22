// Mock data for the UI-only pass. Once the PHP API is wired up, these
// will be replaced by real fetch() calls — see src/api/ (to be added)
// for the endpoints this mirrors: GET /packages/list.php,
// POST /photographers/nearby.php, POST /bookings/create.php.

export interface Package {
  id: string
  name: string
  price: number
  photos: number
  durationMins: number
  delivery: string
}

export const packages: Package[] = [
  {
    id: 'basic',
    name: 'Basic package',
    price: 499,
    photos: 10,
    durationMins: 30,
    delivery: 'Instant soft copy delivery',
  },
]

export const GST_RATE = 0.18
export const SEARCH_RADIUS_KM = 5
export const SEARCH_TIMEOUT_SECONDS = 30

export interface Photographer {
  id: string
  name: string
  initials: string
  rating: number
  bookingsCount: number
  distanceKm: number
  etaMins: number
  phoneMasked: string
}

export const mockPhotographer: Photographer = {
  id: 'ph_1024',
  name: 'Rohit Sharma',
  initials: 'RS',
  rating: 4.8,
  bookingsCount: 120,
  distanceKm: 1.2,
  etaMins: 8,
  phoneMasked: '+91 98XXXXXX12',
}

export interface Booking {
  id: string
  packageId: string
  photographer: Photographer
  status: 'assigned' | 'on_the_way' | 'arrived' | 'completed'
  dateLabel: string
  address: string
}

export const mockBooking: Booking = {
  id: '#IP10452',
  packageId: 'basic',
  photographer: mockPhotographer,
  status: 'assigned',
  dateLabel: 'Today, 6:45 PM',
  address: 'Kothrud, Pune',
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`
}
