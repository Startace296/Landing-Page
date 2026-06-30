import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'

const fmt = n =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

export default function Wishlist({ isOpen, onClose, onOpenCart }) {
  const { wishlistItems, removeFromWishlist, addToCart, cartItems } = useCart()

  async function handleAddToCart(item) {
    const ok = await addToCart(item, 1)
    if (ok !== false) { onOpenCart?.(); onClose() }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="wishlist-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            key="wishlist-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm flex flex-col bg-white dark:bg-gray-900 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-2">
                <HeartIcon />
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Yêu thích</h2>
                {wishlistItems.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
                    {wishlistItems.length}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Đóng"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {wishlistItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-600">
                    <HeartIcon size={28} />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Chưa có sản phẩm yêu thích.<br/>Nhấn ♡ để lưu sản phẩm.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {wishlistItems.map(item => {
                    const inCart = cartItems.some(i => i.id === item.id)
                    return (
                      <li key={item.id} className="flex gap-4 px-5 py-4">
                        {/* Image */}
                        <div className="w-16 h-16 shrink-0 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                          {item.image
                            ? <img src={item.image} alt={item.name} className="w-12 h-12 object-contain" />
                            : <HeartIcon size={24} />
                          }
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight truncate">
                              {item.name}
                            </p>
                            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mt-0.5">
                              {fmt(item.price)}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => handleAddToCart(item)}
                              className={[
                                'flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
                                inCart
                                  ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400'
                                  : 'bg-purple-600 hover:bg-purple-700 active:scale-95 text-white',
                              ].join(' ')}
                            >
                              {inCart ? '✓ Đã thêm' : 'Thêm vào giỏ'}
                            </button>
                            <button
                              onClick={() => removeFromWishlist(item.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-400 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              aria-label="Xóa khỏi yêu thích"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* Footer: only if items exist */}
            {wishlistItems.length > 0 && (
              <div className="shrink-0 border-t border-gray-100 dark:border-gray-800 px-5 py-4">
                <button
                  onClick={() => {
                    wishlistItems.forEach(item => addToCart(item, 1))
                    onOpenCart?.()
                    onClose()
                  }}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-semibold text-sm transition-all duration-200"
                >
                  Thêm tất cả vào giỏ hàng
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function CloseIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  )
}

function HeartIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14H6L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4h6v2"/>
    </svg>
  )
}
