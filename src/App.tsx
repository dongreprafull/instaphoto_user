import { useState } from 'react'
import Home from './screens/Home'
import Search from './screens/Search'
import Payment from './screens/Payment'
import Confirmed from './screens/Confirmed'

type Screen = 'home' | 'search' | 'payment' | 'confirmed'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')

  return (
    <div className="phone-frame">
      {screen === 'home' && <Home onFindPhotographer={() => setScreen('search')} />}
      {screen === 'search' && (
        <Search onBack={() => setScreen('home')} onCancel={() => setScreen('home')} onFound={() => setScreen('payment')} />
      )}
      {screen === 'payment' && <Payment onBack={() => setScreen('search')} onPay={() => setScreen('confirmed')} />}
      {screen === 'confirmed' && <Confirmed onBackHome={() => setScreen('home')} />}
    </div>
  )
}
