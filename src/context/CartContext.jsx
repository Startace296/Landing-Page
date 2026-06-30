import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { PRODUCT_MAP } from '../data/products'

// ── localStorage helpers ────────────────────────────────────
const CART_KEY     = 'sa_cart'
const WISHLIST_KEY = 'sa_wishlist'
const RECENT_KEY   = 'sa_recently'

function lsGet(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}
function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) }
  catch { /* quota exceeded – silently ignore */ }
}

// ── Context ─────────────────────────────────────────────────
const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cartItems,      setCartItems]      = useState([])
  const [wishlistItems,  setWishlistItems]  = useState([])
  const [recentlyViewed, setRecentlyViewed] = useState(() => lsGet(RECENT_KEY))

  // Persist recentlyViewed to localStorage (always local)
  useEffect(() => {
    lsSet(RECENT_KEY, recentlyViewed.slice(0, 10))
  }, [recentlyViewed])

  // Sync on auth change (user?.id goes undefined → uuid on login, uuid → undefined on logout)
  useEffect(() => {
    if (!user?.id) {
      setCartItems(lsGet(CART_KEY))
      setWishlistItems(lsGet(WISHLIST_KEY))
      return
    }
    // Logged in: merge localStorage → Supabase, then load fresh data
    syncOnLogin(user.id)
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Supabase helpers ───────────────────────────────────────

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

  async function syncOnLogin(uid) {
    const localCart     = lsGet(CART_KEY)
    const localWishlist = lsGet(WISHLIST_KEY)

    const merges = []

    if (localCart.length > 0) {
      merges.push(
        supabase.from('cart').upsert(
          localCart.map(i => ({ user_id: uid, product_id: i.id, quantity: i.quantity })),
          { onConflict: 'user_id,product_id' }
        )
      )
      localStorage.removeItem(CART_KEY)
    }
    if (localWishlist.length > 0) {
      merges.push(
        supabase.from('wishlist').upsert(
          localWishlist.map(i => ({ user_id: uid, product_id: i.id })),
          { onConflict: 'user_id,product_id' }
        )
      )
      localStorage.removeItem(WISHLIST_KEY)
    }

    await Promise.all(merges)
    await loadFromSupabase(uid)
  }

  // ── Cart functions ─────────────────────────────────────────

  async function addToCart(product, qty = 1) {
    const existing = cartItems.find(i => i.id === product.id)
    const newQty   = (existing?.quantity ?? 0) + qty
    const next     = existing
      ? cartItems.map(i => i.id === product.id ? { ...i, quantity: newQty } : i)
      : [...cartItems, { ...product, quantity: qty }]

    setCartItems(next)

    if (user) {
      await supabase.from('cart').upsert(
        { user_id: user.id, product_id: product.id, quantity: newQty },
        { onConflict: 'user_id,product_id' }
      )
    } else {
      lsSet(CART_KEY, next)
    }
  }

  async function removeFromCart(productId) {
    const next = cartItems.filter(i => i.id !== productId)
    setCartItems(next)
    if (user) {
      await supabase.from('cart').delete().eq('user_id', user.id).eq('product_id', productId)
    } else {
      lsSet(CART_KEY, next)
    }
  }

  async function updateQuantity(productId, qty) {
    if (qty < 1) return removeFromCart(productId)
    const next = cartItems.map(i => i.id === productId ? { ...i, quantity: qty } : i)
    setCartItems(next)
    if (user) {
      await supabase.from('cart').update({ quantity: qty }).eq('user_id', user.id).eq('product_id', productId)
    } else {
      lsSet(CART_KEY, next)
    }
  }

  // ── Wishlist functions ─────────────────────────────────────

  async function addToWishlist(product) {
    if (wishlistItems.find(i => i.id === product.id)) return
    const next = [...wishlistItems, product]
    setWishlistItems(next)
    if (user) {
      await supabase.from('wishlist').upsert(
        { user_id: user.id, product_id: product.id },
        { onConflict: 'user_id,product_id' }
      )
    } else {
      lsSet(WISHLIST_KEY, next)
    }
  }

  async function removeFromWishlist(productId) {
    const next = wishlistItems.filter(i => i.id !== productId)
    setWishlistItems(next)
    if (user) {
      await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', productId)
    } else {
      lsSet(WISHLIST_KEY, next)
    }
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
