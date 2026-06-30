import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'

const fmt = n =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

export default function Cart({ isOpen, onClose }) {
  const { cartItems, cartTotal, removeFromCart, updateQuantity } = useCart()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            key="cart-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm flex flex-col bg-white dark:bg-gray-900 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-2">
                <CartIcon />
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Giỏ hàng</h2>
                {cartItems.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
                    {cartItems.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Đóng giỏ hàng"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-600">
                    <CartIcon size={28} />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Giỏ hàng trống.<br/>Hãy thêm sản phẩm để tiếp tục.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {cartItems.map(item => (
                    <li key={item.id} className="flex gap-4 px-5 py-4">
                      {/* Image */}
                      <div className="w-16 h-16 shrink-0 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                        {item.image
                          ? <img src={item.image} alt={item.name} className="w-12 h-12 object-contain" />
                          : <CartIcon size={24} />
                        }
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight truncate">
                          {item.name}
                        </p>
                        <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mt-0.5">
                          {fmt(item.price)}
                        </p>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-gray-600 dark:text-gray-300 flex items-center justify-center text-sm font-bold transition-colors"
                            aria-label="Giảm"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-gray-600 dark:text-gray-300 flex items-center justify-center text-sm font-bold transition-colors"
                            aria-label="Tăng"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Remove + subtotal */}
                      <div className="flex flex-col items-end justify-between shrink-0">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-300 dark:text-gray-600 hover:text-red-400 dark:hover:text-red-500 transition-colors"
                          aria-label="Xóa"
                        >
                          <CloseIcon size={14} />
                        </button>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                          {fmt(item.price * item.quantity)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="shrink-0 border-t border-gray-100 dark:border-gray-800 px-5 py-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Tổng cộng</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{fmt(cartTotal)}</span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Miễn phí vận chuyển toàn quốc · Đã bao gồm VAT
                </p>
                <button className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-semibold text-sm transition-all duration-200">
                  Tiến hành đặt hàng →
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors"
                >
                  Tiếp tục mua sắm
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

function CartIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )
}
