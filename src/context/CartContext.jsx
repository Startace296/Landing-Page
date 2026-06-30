import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { PRODUCT_MAP } from '../data/products'

const RECENT_KEY = 'sa_recently'

function lsGet(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}
function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) }
  catch { /* quota exceeded – silently ignore */ }
}

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cartItems,      setCartItems]      = useState([])
  const [wishlistItems,  setWishlistItems]  = useState([])
  const [recentlyViewed, setRecentlyViewed] = useState(() => lsGet(RECENT_KEY))
  const [requiresLogin,  setRequiresLogin]  = useState(false)

  useEffect(() => {
    lsSet(RECENT_KEY, recentlyViewed.slice(0, 10))
  }, [recentlyViewed])

  useEffect(() => {
    if (!user?.id) {
      setCartItems([])
      setWishlistItems([])
      return
    }
    loadFromSupabase(user.id)
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadFromSupabase(uid) {
    const [
      { data: cartRows, error: cartErr },
      { data: wishRows, error: wishErr },
    ] = await Promise.all([
      supabase.from('cart').select('product_id, quantity').eq('user_id', uid),
      supabase.from('wishlist').select('product_id').eq('user_id', uid),
    ])

    if (cartErr) console.error('[Cart] loadCart error:', cartErr.message, cartErr)
    if (wishErr) console.error('[Cart] loadWishlist error:', wishErr.message, wishErr)

    setCartItems(
      (cartRows ?? [])
        .map(r => PRODUCT_MAP[r.product_id]
          ? { ...PRODUCT_MAP[r.product_id], quantity: r.quantity }
          : null)
        .filter(Boolean)
    )
    setWishlistItems(
      (wishRows ?? [])
        .map(r => PRODUCT_MAP[r.product_id] ?? null)
        .filter(Boolean)
    )
  }

  // ── Cart ────────────────────────────────────────────────────

  async function addToCart(product, qty = 1) {
    if (!user) { setRequiresLogin(true); return false }

    const existing = cartItems.find(i => i.id === product.id)
    const newQty   = (existing?.quantity ?? 0) + qty
    const next     = existing
      ? cartItems.map(i => i.id === product.id ? { ...i, quantity: newQty } : i)
      : [...cartItems, { ...product, quantity: qty }]

    setCartItems(next) // optimistic

    const { error } = await supabase.from('cart').upsert(
      { user_id: user.id, product_id: product.id, quantity: newQty },
      { onConflict: 'user_id,product_id' }
    )

    if (error) {
      console.error('[Cart] addToCart error:', error.message, error)
      setCartItems(cartItems) // revert
      return false
    }
    return true
  }

  async function removeFromCart(productId) {
    if (!user) return
    const prev = cartItems
    setCartItems(cartItems.filter(i => i.id !== productId))

    const { error } = await supabase.from('cart').delete()
      .eq('user_id', user.id).eq('product_id', productId)
    if (error) { console.error('[Cart] removeFromCart error:', error.message); setCartItems(prev) }
  }

  async function updateQuantity(productId, qty) {
    if (qty < 1) return removeFromCart(productId)
    if (!user) return
    const prev = cartItems
    setCartItems(cartItems.map(i => i.id === productId ? { ...i, quantity: qty } : i))

    const { error } = await supabase.from('cart').update({ quantity: qty })
      .eq('user_id', user.id).eq('product_id', productId)
    if (error) { console.error('[Cart] updateQuantity error:', error.message); setCartItems(prev) }
  }

  // ── Wishlist ────────────────────────────────────────────────

  async function addToWishlist(product) {
    if (!user) { setRequiresLogin(true); return false }
    if (wishlistItems.find(i => i.id === product.id)) return true

    const prev = wishlistItems
    setWishlistItems([...wishlistItems, product]) // optimistic

    const { error } = await supabase.from('wishlist').insert(
      { user_id: user.id, product_id: product.id }
    )

    if (error) {
      if (error.code === '23505') return true // duplicate — đã tồn tại, OK
      console.error('[Cart] addToWishlist error:', error.message, error)
      setWishlistItems(prev)
      return false
    }
    return true
  }

  async function removeFromWishlist(productId) {
    if (!user) return
    const prev = wishlistItems
    setWishlistItems(wishlistItems.filter(i => i.id !== productId))

    const { error } = await supabase.from('wishlist').delete()
      .eq('user_id', user.id).eq('product_id', productId)
    if (error) { console.error('[Cart] removeFromWishlist error:', error.message); setWishlistItems(prev) }
  }

  // ── Recently viewed ─────────────────────────────────────────

  function addToRecentlyViewed(product) {
    setRecentlyViewed(prev =>
      [product, ...prev.filter(i => i.id !== product.id)].slice(0, 10)
    )
  }

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      cartItems, wishlistItems, recentlyViewed,
      cartCount, cartTotal,
      addToCart, removeFromCart, updateQuantity,
      addToWishlist, removeFromWishlist,
      addToRecentlyViewed,
      requiresLogin,
      clearRequiresLogin: () => setRequiresLogin(false),
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart phải được dùng bên trong CartProvider')
  return ctx
}
