import { useState } from 'react'
import Login from './screens/Login'
import Home from './screens/Home'
import Search from './screens/Search'
import Tracking from './screens/Tracking'
import Payment from './screens/Payment'
import Confirmed from './screens/Confirmed'
import { getToken } from './lib/api'

type Screen = 'login' | 'home' | 'search' | 'tracking' | 'payment' | 'confirmed'

export default function App() {
  const [screen, setScreen] = useState<Screen>(getToken() ? 'home' : 'login')
  const [bookingId, setBookingId] = useState<number | null>(null)

  return (
    <div className="phone-frame">
      {screen === 'login' && <Login onLoggedIn={() => setScreen('home')} />}
      {screen === 'home' && (
        <Home
          onBooked={(id) => {
            setBookingId(id)
            setScreen('search')
          }}
        />
      )}
      {screen === 'search' && bookingId && (
        <Search
          bookingId={bookingId}
          onBack={() => setScreen('home')}
          onCancel={() => setScreen('home')}
          onFound={() => setScreen('tracking')}
        />
      )}
      {screen === 'tracking' && bookingId && (
        <Tracking bookingId={bookingId} onPayNow={() => setScreen('payment')} />
      )}
      {screen === 'payment' && bookingId && (
        <Payment bookingId={bookingId} onBack={() => setScreen('tracking')} onPay={() => setScreen('confirmed')} />
      )}
      {screen === 'confirmed' && bookingId && <Confirmed bookingId={bookingId} onBackHome={() => setScreen('home')} />}
    </div>
  )
}
