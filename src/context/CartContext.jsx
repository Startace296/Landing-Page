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
    const [{ data: cartRows }, { data: wishRows }] = await Promise.all([
      supabase.from('cart').select('product_id, quantity').eq('user_id', uid),
      supabase.from('wishlist').select('product_id').eq('user_id', uid),
    ])

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

  // ── Cart functions ─────────────────────────────────────────

  async function addToCart(product, qty = 1) {
    if (!user) {
      setRequiresLogin(true)
      return
    }
    const existing = cartItems.find(i => i.id === product.id)
    const newQty   = (existing?.quantity ?? 0) + qty
    const next     = existing
      ? cartItems.map(i => i.id === product.id ? { ...i, quantity: newQty } : i)
      : [...cartItems, { ...product, quantity: qty }]

    setCartItems(next)
    await supabase.from('cart').upsert(
      { user_id: user.id, product_id: product.id, quantity: newQty },
      { onConflict: 'user_id,product_id' }
    )
  }

  async function removeFromCart(productId) {
    if (!user) return
    const next = cartItems.filter(i => i.id !== productId)
    setCartItems(next)
    await supabase.from('cart').delete().eq('user_id', user.id).eq('product_id', productId)
  }

  async function updateQuantity(productId, qty) {
    if (qty < 1) return removeFromCart(productId)
    if (!user) return
    const next = cartItems.map(i => i.id === productId ? { ...i, quantity: qty } : i)
    setCartItems(next)
    await supabase.from('cart').update({ quantity: qty }).eq('user_id', user.id).eq('product_id', productId)
  }

  // ── Wishlist functions ─────────────────────────────────────

  async function addToWishlist(product) {
    if (!user) {
      setRequiresLogin(true)
      return
    }
    if (wishlistItems.find(i => i.id === product.id)) return
    const next = [...wishlistItems, product]
    setWishlistItems(next)
    await supabase.from('wishlist').upsert(
      { user_id: user.id, product_id: product.id },
      { onConflict: 'user_id,product_id' }
    )
  }

  async function removeFromWishlist(productId) {
    if (!user) return
    const next = wishlistItems.filter(i => i.id !== productId)
    setWishlistItems(next)
    await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', productId)
  }

  // ── Recently viewed ────────────────────────────────────────

  function addToRecentlyViewed(product) {
    setRecentlyViewed(prev => [product, ...prev.filter(i => i.id !== product.id)].slice(0, 10))
  }

  // ── Derived ────────────────────────────────────────────────

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
