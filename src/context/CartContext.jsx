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
    const currentUid = user?.id ?? null
    prevUidRef.current = currentUid

    if (!currentUid) {
      if (prevUid) {
        // Logout: xóa state, data vẫn an toàn trong Supabase
        setCartItems([])
        setWishlistItems([])
      }
      return
    }

    // Đăng nhập hoặc refresh trang khi đã login → tải lại từ Supabase
    loadFromSupabase(currentUid)
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Supabase load ──────────────────────────────────────────

  async function loadFromSupabase(uid) {
    const [{ data: cartRows, error: cartErr }, { data: wishRows, error: wishErr }] = await Promise.all([
      supabase.from('cart').select('product_id, quantity').eq('user_id', uid),
      supabase.from('wishlist').select('product_id').eq('user_id', uid),
    ])

    if (cartErr) console.error('[Cart] load cart error:', cartErr.message)
    if (wishErr) console.error('[Cart] load wishlist error:', wishErr.message)

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
  // Trả về: true = thành công | false = chưa login | 'error' = lỗi Supabase

  async function addToCart(product, qty = 1) {
    if (!user) return false

    const existing = cartItems.find(i => i.id === product.id)
    const newQty   = (existing?.quantity ?? 0) + qty

    // Ghi vào Supabase TRƯỚC, chỉ update state khi thành công
    const { error } = await supabase.from('cart').upsert(
      { user_id: user.id, product_id: product.id, quantity: newQty },
      { onConflict: 'user_id,product_id' }
    )

    if (error) {
      console.error('[Cart] addToCart failed:', error.message, error)
      return 'error'
    }

    setCartItems(prev => {
      const exists = prev.find(i => i.id === product.id)
      return exists
        ? prev.map(i => i.id === product.id ? { ...i, quantity: newQty } : i)
        : [...prev, { ...product, quantity: qty }]
    })
    return true
  }

  async function removeFromCart(productId) {
    if (!user) return
    const { error } = await supabase.from('cart').delete().eq('user_id', user.id).eq('product_id', productId)
    if (error) { console.error('[Cart] removeFromCart failed:', error.message); return }
    setCartItems(prev => prev.filter(i => i.id !== productId))
  }

  async function updateQuantity(productId, qty) {
    if (qty < 1) return removeFromCart(productId)
    if (!user) return
    const { error } = await supabase.from('cart').update({ quantity: qty }).eq('user_id', user.id).eq('product_id', productId)
    if (error) { console.error('[Cart] updateQuantity failed:', error.message); return }
    setCartItems(prev => prev.map(i => i.id === productId ? { ...i, quantity: qty } : i))
  }

  // ── Wishlist ───────────────────────────────────────────────

  async function addToWishlist(product) {
    if (!user) return false
    if (wishlistItems.find(i => i.id === product.id)) return true

    const { error } = await supabase.from('wishlist').insert(
      { user_id: user.id, product_id: product.id }
    )

    if (error) {
      if (error.code === '23505') return true // đã tồn tại
      console.error('[Cart] addToWishlist failed:', error.message, error)
      return 'error'
    }

    setWishlistItems(prev => [...prev, product])
    return true
  }

  async function removeFromWishlist(productId) {
    if (!user) return
    const { error } = await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', productId)
    if (error) { console.error('[Cart] removeFromWishlist failed:', error.message); return }
    setWishlistItems(prev => prev.filter(i => i.id !== productId))
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
