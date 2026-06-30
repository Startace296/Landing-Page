import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import products from '../data/products'
import { useCart } from '../context/CartContext'

const CATEGORIES = [
  { key: 'all',         label: 'Tất cả' },
  { key: 'over-ear',    label: 'Over-ear' },
  { key: 'earbuds',     label: 'Earbuds / TWS' },
  { key: 'gaming',      label: 'Gaming' },
  { key: 'speaker',     label: 'Loa' },
  { key: 'accessories', label: 'Phụ kiện' },
]

const CATEGORY_LABEL = {
  'over-ear':    'Tai nghe Over-ear',
  'earbuds':     'True Wireless',
  'gaming':      'Gaming',
  'speaker':     'Loa Bluetooth',
  'accessories': 'Phụ kiện',
}

const fmt = n =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

const cardVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, scale: 0.96, transition: { duration: 0.2 } },
}

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const { addToCart, addToWishlist, removeFromWishlist, wishlistItems } = useCart()

  const filtered = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory)

  function handleAddToCart(product) {
    addToCart(product, 1)
    toast.success('Đã thêm vào giỏ hàng!', { icon: '🛒', duration: 2500 })
  }

  function handleToggleWishlist(product) {
    const saved = wishlistItems.some(i => i.id === product.id)
    if (saved) {
      removeFromWishlist(product.id)
      toast('Đã xóa khỏi yêu thích', { icon: '💔', duration: 2000 })
    } else {
      addToWishlist(product)
      toast.success('Đã thêm vào yêu thích!', { duration: 2000 })
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-16">

      {/* Page header */}
      <div className="bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 flex flex-col items-center text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-purple-200 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeftIcon /> Về trang chủ
          </Link>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Tất Cả Sản Phẩm
          </h1>
          <p className="mt-3 text-purple-200 text-sm max-w-md mx-auto text-center">
            Khám phá toàn bộ dòng sản phẩm âm thanh cao cấp từ SoundAura — {products.length} sản phẩm
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={[
                'px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200',
                activeCategory === cat.key
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400',
              ].join(' ')}
            >
              {cat.label}
              <span className={[
                'ml-1.5 text-[10px] font-bold',
                activeCategory === cat.key ? 'text-purple-200' : 'text-gray-400 dark:text-gray-500',
              ].join(' ')}>
                {cat.key === 'all' ? products.length : products.filter(p => p.category === cat.key).length}
              </span>
            </button>
          ))}
        </div>

        {/* Product grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map(product => {
              const saved    = wishlistItems.some(i => i.id === product.id)
              const discount = product.originalPrice
                ? Math.round((1 - product.price / product.originalPrice) * 100)
                : null

              return (
                <motion.article
                  key={product.id}
                  layout
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="group relative flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-500/5 transition-shadow duration-300"
                >
                  {/* Badge */}
                  {product.badge && (
                    <span className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white shadow-sm">
                      {product.badge}
                    </span>
                  )}

                  {/* Wishlist toggle */}
                  <button
                    onClick={() => handleToggleWishlist(product)}
                    aria-label={saved ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                    className={[
                      'absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all duration-200',
                      saved
                        ? 'bg-rose-500 text-white'
                        : 'bg-white/90 dark:bg-gray-800/90 text-gray-300 dark:text-gray-600 hover:text-rose-500 dark:hover:text-rose-400 hover:scale-110',
                    ].join(' ')}
                  >
                    <HeartIcon filled={saved} />
                  </button>

                  {/* Image */}
                  <div className="relative h-44 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800 flex items-center justify-center px-6 py-4">
                    {product.image
                      ? <img src={product.image} alt={product.name} className="h-full w-full object-contain drop-shadow-md group-hover:scale-[1.06] transition-transform duration-500" />
                      : <BoxIcon />
                    }
                    {discount && (
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500 text-white">
                        -{discount}%
                      </span>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="flex flex-col flex-1 p-4 gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-purple-500 dark:text-purple-400">
                      {CATEGORY_LABEL[product.category] ?? product.category}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Stars rating={product.rating} />
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">
                        ({product.reviews.toLocaleString('vi-VN')})
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-auto pt-1">
                      <span className="text-base font-extrabold text-gray-900 dark:text-white">
                        {fmt(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          {fmt(product.originalPrice)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-[0.97] text-white text-xs font-semibold transition-all duration-200"
                    >
                      <CartIcon /> Thêm vào giỏ
                    </button>
                  </div>
                </motion.article>
              )
            })}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400 dark:text-gray-600">
            <p className="text-lg font-medium">Không có sản phẩm nào trong danh mục này.</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Icons ── */
function Stars({ rating }) {
  const full    = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < full ? 'text-yellow-400 text-xs' : i === full && hasHalf ? 'text-yellow-300 text-xs' : 'text-gray-200 dark:text-gray-700 text-xs'}>★</span>
      ))}
    </span>
  )
}

function HeartIcon({ filled }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  )
}

function BoxIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 dark:text-gray-600">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  )
}
