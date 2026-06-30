import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import LoginModal from './Auth/LoginModal'
import RegisterModal from './Auth/RegisterModal'

const NAV_LINKS = [
  { label: 'Features',   href: '/#features' },
  { label: 'Specs',      href: '/#specs' },
  { label: 'Newsletter', href: '/#newsletter' },
]

export default function Navbar({ cartCount = 0, onCartOpen, onWishlistOpen }) {
  const { user, loading, signOut } = useAuth()
  const [modal, setModal] = useState(null) // null | 'login' | 'register'

  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark')
  )
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0]

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
    <header
      className={[
        'fixed top-0 inset-x-0 z-50 transition-all duration-300 backdrop-blur-md',
        scrolled
          ? 'shadow-lg bg-white/80 dark:bg-gray-950/80 border-b border-gray-200/60 dark:border-gray-800/60'
          : 'bg-transparent',
      ].join(' ')}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold tracking-tight text-gray-900 dark:text-white select-none"
        >
          <span className="text-blue-900 dark:text-orange-400 transition-colors duration-300">Sound</span><span className="text-purple-500">Aura</span>
          <span className="ml-1 text-xs font-semibold text-purple-400 align-super">PRO</span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                className="text-sm font-medium text-gray-600 hover:text-purple-500 dark:text-gray-300 dark:hover:text-purple-400 transition-colors duration-200"
              >
                {label}
              </a>
            </li>
          ))}
          <li>
            <Link
              to="/products"
              className="text-sm font-medium text-gray-600 hover:text-purple-500 dark:text-gray-300 dark:hover:text-purple-400 transition-colors duration-200"
            >
              Products
            </Link>
          </li>
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-1">

          {/* Dark mode toggle */}
          <button
            onClick={() => setIsDark(d => !d)}
            aria-label="Toggle dark mode"
            className="p-2 rounded-lg text-gray-500 hover:text-purple-500 dark:text-gray-400 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Wishlist */}
          <button
            onClick={onWishlistOpen}
            aria-label="Yêu thích"
            className="p-2 rounded-lg text-gray-500 hover:text-rose-500 dark:text-gray-400 dark:hover:text-rose-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <HeartIcon />
          </button>

          {/* Cart */}
          <button
            onClick={onCartOpen}
            aria-label="Giỏ hàng"
            className="relative p-2 rounded-lg text-gray-500 hover:text-purple-500 dark:text-gray-400 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <CartIcon />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>

          {/* Auth */}
          {!loading && (
            <>
              {user ? (
                <div className="hidden md:flex items-center gap-2 ml-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                    {displayName}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setModal('login')}
                  className="hidden md:flex items-center gap-1.5 ml-1 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-semibold transition-all duration-200"
                >
                  Đăng nhập
                </button>
              )}
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            {menuOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800"
          >
            <ul className="px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center py-2.5 px-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-gray-800 hover:text-purple-500 dark:hover:text-purple-400 transition-colors duration-200"
                  >
                    {label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  to="/products"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center py-2.5 px-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-gray-800 hover:text-purple-500 dark:hover:text-purple-400 transition-colors duration-200"
                >
                  Products
                </Link>
              </li>

              {/* Mobile auth */}
              {!loading && (
                <li className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-1">
                  {user ? (
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {displayName}
                      </span>
                      <button
                        onClick={() => { signOut(); setMenuOpen(false) }}
                        className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setModal('login'); setMenuOpen(false) }}
                      className="w-full py-2.5 px-3 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
                    >
                      Đăng nhập
                    </button>
                  )}
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>

    {/* Auth modals */}
    <LoginModal
      isOpen={modal === 'login'}
      onClose={() => setModal(null)}
      onSwitchToRegister={() => setModal('register')}
    />
    <RegisterModal
      isOpen={modal === 'register'}
      onClose={() => setModal(null)}
      onSwitchToLogin={() => setModal('login')}
    />
  </>
  )
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )
}
