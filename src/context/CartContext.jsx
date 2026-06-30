import { createContext, useContext, useEffect, useRef, useState } from 'react'
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
  catch { /* quota exceeded */ }
}

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cartItems,      setCartItems]      = useState([])
  const [wishlistItems,  setWishlistItems]  = useState([])
  const [recentlyViewed, setRecentlyViewed] = useState(() => lsGet(RECENT_KEY))

  const prevUidRef = useRef(null)

  useEffect(() => {
    lsSet(RECENT_KEY, recentlyViewed.slice(0, 10))
  }, [recentlyViewed])

  useEffect(() => {
    const prevUid = prevUidRef.current
    prevUidRef.current = user?.id ?? null

    if (!user?.id) {
      if (prevUid) {
        // Logout: xóa state khỏi memory, data vẫn an toàn trong Supabase
        setCartItems([])
        setWishlistItems([])
      }
      return
    }

    // Login: tải dữ liệu từ Supabase
    loadFromSupabase(user.id)
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadFromSupabase(uid) {
    const [{ data: cartRows, error: cartErr }, { data: wishRows, error: wishErr }] = await Promise.all([
      supabase.from('cart').select('product_id, quantity').eq('user_id', uid),
      supabase.from('wishlist').select('product_id').eq('user_id', uid),
    ])

    if (cartErr) console.warn('[Cart] load cart failed:', cartErr.message)
    if (wishErr) console.warn('[Cart] load wishlist failed:', wishErr.message)

    setCartItems(
      (cartRows ?? [])
        .map(r => PRODUCT_MAP[r.product_id] ? { ...PRODUCT_MAP[r.product_id], quantity: r.quantity } : null)
        .filter(Boolean)
    )
    setWishlistItems(
      (wishRows ?? [])
        .map(r => PRODUCT_MAP[r.product_id] ?? null)
        .filter(Boolean)
    )
  }

  // ── Cart ───────────────────────────────────────────────────
  // Trả về false nếu chưa login (để UI mở modal đăng nhập)

  async function addToCart(product, qty = 1) {
    if (!user) return false

    const existing = cartItems.find(i => i.id === product.id)
    const newQty   = (existing?.quantity ?? 0) + qty
    const next     = existing
      ? cartItems.map(i => i.id === product.id ? { ...i, quantity: newQty } : i)
      : [...cartItems, { ...product, quantity: qty }]

    setCartItems(next)

    const { error } = await supabase.from('cart').upsert(
      { user_id: user.id, product_id: product.id, quantity: newQty },
      { onConflict: 'user_id,product_id' }
    )
    if (error) console.warn('[Cart] addToCart failed:', error.message)
    return true
  }

  async function removeFromCart(productId) {
    if (!user) return
    setCartItems(prev => prev.filter(i => i.id !== productId))
    const { error } = await supabase.from('cart').delete().eq('user_id', user.id).eq('product_id', productId)
    if (error) console.warn('[Cart] removeFromCart failed:', error.message)
  }

  async function updateQuantity(productId, qty) {
    if (qty < 1) return removeFromCart(productId)
    if (!user) return
    setCartItems(prev => prev.map(i => i.id === productId ? { ...i, quantity: qty } : i))
    const { error } = await supabase.from('cart').update({ quantity: qty }).eq('user_id', user.id).eq('product_id', productId)
    if (error) console.warn('[Cart] updateQuantity failed:', error.message)
  }

  // ── Wishlist ───────────────────────────────────────────────

  async function addToWishlist(product) {
    if (!user) return false
    if (wishlistItems.find(i => i.id === product.id)) return true

    setWishlistItems(prev => [...prev, product])

    const { error } = await supabase.from('wishlist').insert(
      { user_id: user.id, product_id: product.id }
    )
    if (error && error.code !== '23505') {
      console.warn('[Cart] addToWishlist failed:', error.message)
    }
    return true
  }

  async function removeFromWishlist(productId) {
    if (!user) return
    setWishlistItems(prev => prev.filter(i => i.id !== productId))
    const { error } = await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', productId)
    if (error) console.warn('[Cart] removeFromWishlist failed:', error.message)
  }

  // ── Recently viewed (không cần login) ─────────────────────

  function addToRecentlyViewed(product) {
    setRecentlyViewed(prev => [product, ...prev.filter(i => i.id !== product.id)].slice(0, 10))
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
