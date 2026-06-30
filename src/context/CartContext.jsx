import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { PRODUCT_MAP } from '../data/products'

const CART_KEY     = 'sa_cart'
const WISHLIST_KEY = 'sa_wishlist'
const RECENT_KEY   = 'sa_recently'

function lsGet(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}
function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) }
  catch {}
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
    const prevUid    = prevUidRef.current
    const currentUid = user?.id ?? null
    prevUidRef.current = currentUid

    if (!currentUid) {
      if (prevUid) {
        // Logout → persist in-memory items to localStorage for guest session
        setCartItems(prev => { lsSet(CART_KEY, prev); return [] })
        setWishlistItems(prev => { lsSet(WISHLIST_KEY, prev); return [] })
      } else {
        // Initial mount, no user → load from localStorage
        setCartItems(lsGet(CART_KEY))
        setWishlistItems(lsGet(WISHLIST_KEY))
      }
      return
    }

    // Logged in → merge any guest localStorage items into Supabase, then reload
    syncOnLogin(currentUid)
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Supabase helpers ────────────────────────────────────────

  async function loadFromSupabase(uid) {
    const [{ data: cartRows, error: cErr }, { data: wishRows, error: wErr }] = await Promise.all([
      supabase.from('cart').select('product_id, quantity').eq('user_id', uid),
      supabase.from('wishlist').select('product_id').eq('user_id', uid),
    ])
    if (cErr) console.error('[Cart] load failed:', cErr.message)
    if (wErr) console.error('[Wishlist] load failed:', wErr.message)

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

    try {
      const merges = []
      if (localCart.length > 0) {
        merges.push(
          supabase.from('cart').upsert(
            localCart.map(i => ({ user_id: uid, product_id: i.id, quantity: i.quantity ?? 1 })),
            { onConflict: 'user_id,product_id' }
          )
        )
      }
      if (localWishlist.length > 0) {
        merges.push(
          supabase.from('wishlist').upsert(
            localWishlist.map(i => ({ user_id: uid, product_id: i.id })),
            { onConflict: 'user_id,product_id' }
          )
        )
      }

      const results = await Promise.all(merges)
      const failed  = results.find(r => r.error)
      if (failed) {
        console.error('[Cart] syncOnLogin failed:', failed.error.message)
      } else {
        // Only clear localStorage after confirmed Supabase write
        if (localCart.length > 0)     localStorage.removeItem(CART_KEY)
        if (localWishlist.length > 0) localStorage.removeItem(WISHLIST_KEY)
      }
    } catch (err) {
      console.error('[Cart] syncOnLogin error:', err)
    }

    await loadFromSupabase(uid)
  }

  // ── Cart ────────────────────────────────────────────────────

  async function addToCart(product, qty = 1) {
    const existing = cartItems.find(i => i.id === product.id)
    const newQty   = (existing?.quantity ?? 0) + qty
    const next     = existing
      ? cartItems.map(i => i.id === product.id ? { ...i, quantity: newQty } : i)
      : [...cartItems, { ...product, quantity: qty }]

    // Optimistic update — always update state immediately
    setCartItems(next)

    if (user) {
      const { error } = await supabase.from('cart').upsert(
        { user_id: user.id, product_id: product.id, quantity: newQty },
        { onConflict: 'user_id,product_id' }
      )
      if (error) {
        console.error('[Cart] addToCart Supabase failed:', error.message, error)
        // Revert optimistic update on failure
        setCartItems(cartItems)
        return false
      }
    } else {
      // Guest: persist to localStorage
      lsSet(CART_KEY, next)
    }
    return true
  }

  async function removeFromCart(productId) {
    const next = cartItems.filter(i => i.id !== productId)
    setCartItems(next)

    if (user) {
      const { error } = await supabase.from('cart').delete()
        .eq('user_id', user.id).eq('product_id', productId)
      if (error) {
        console.error('[Cart] removeFromCart failed:', error.message)
        setCartItems(cartItems) // revert
      }
    } else {
      lsSet(CART_KEY, next)
    }
  }

  async function updateQuantity(productId, qty) {
    if (qty < 1) return removeFromCart(productId)
    const next = cartItems.map(i => i.id === productId ? { ...i, quantity: qty } : i)
    setCartItems(next)

    if (user) {
      const { error } = await supabase.from('cart').update({ quantity: qty })
        .eq('user_id', user.id).eq('product_id', productId)
      if (error) {
        console.error('[Cart] updateQuantity failed:', error.message)
        setCartItems(cartItems) // revert
      }
    } else {
      lsSet(CART_KEY, next)
    }
  }

  // ── Wishlist ────────────────────────────────────────────────

  async function addToWishlist(product) {
    if (wishlistItems.find(i => i.id === product.id)) return true
    const next = [...wishlistItems, product]
    setWishlistItems(next) // optimistic

    if (user) {
      const { error } = await supabase.from('wishlist').insert(
        { user_id: user.id, product_id: product.id }
      )
      if (error) {
        if (error.code === '23505') return true // duplicate, already exists — OK
        console.error('[Wishlist] addToWishlist failed:', error.message, error)
        setWishlistItems(wishlistItems) // revert
        return false
      }
    } else {
      lsSet(WISHLIST_KEY, next)
    }
    return true
  }

  async function removeFromWishlist(productId) {
    const next = wishlistItems.filter(i => i.id !== productId)
    setWishlistItems(next)

    if (user) {
      const { error } = await supabase.from('wishlist').delete()
        .eq('user_id', user.id).eq('product_id', productId)
      if (error) {
        console.error('[Wishlist] removeFromWishlist failed:', error.message)
        setWishlistItems(wishlistItems) // revert
      }
    } else {
      lsSet(WISHLIST_KEY, next)
    }
  }

  // ── Recently viewed (always localStorage) ──────────────────

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
