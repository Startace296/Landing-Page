import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Chatbot from './components/Chatbot'
import Cart from './components/Cart'
import Wishlist from './components/Wishlist'
import LandingPage from './pages/LandingPage'
import ProductsPage from './pages/ProductsPage'
import LoginModal from './components/Auth/LoginModal'
import RegisterModal from './components/Auth/RegisterModal'
import { useScrollTracker } from './hooks/useScrollTracker'
import { useCart } from './context/CartContext'
import './App.css'

function App() {
  useScrollTracker()
  const { cartCount, requiresLogin, clearRequiresLogin } = useCart()
  const [cartOpen,     setCartOpen]     = useState(false)
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [authModal,    setAuthModal]    = useState(null) // null | 'login' | 'register'

  useEffect(() => {
    if (requiresLogin) setAuthModal('login')
  }, [requiresLogin])

  function closeAuth() {
    setAuthModal(null)
    clearRequiresLogin()
  }

  return (
    <>
      <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />
      <Navbar
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        onWishlistOpen={() => setWishlistOpen(true)}
      />
      <Routes>
        <Route path="/"         element={<LandingPage />} />
        <Route path="/products" element={<ProductsPage />} />
      </Routes>
      <Chatbot />
      <Cart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
      />
      <Wishlist
        isOpen={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        onOpenCart={() => setCartOpen(true)}
      />
      <LoginModal
        isOpen={authModal === 'login'}
        onClose={closeAuth}
        onSwitchToRegister={() => setAuthModal('register')}
      />
      <RegisterModal
        isOpen={authModal === 'register'}
        onClose={closeAuth}
        onSwitchToLogin={() => setAuthModal('login')}
      />
    </>
  )
}

export default App
