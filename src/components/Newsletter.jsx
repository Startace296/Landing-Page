import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

// Thay bằng webhook URL thật của Make.com
const WEBHOOK_URL = 'https://hook.eu1.make.com/y6okfu25lewpy143yw56xql05axyt4du'

/* ── Toast ── */
function Toast({ toast }) {
  const isSuccess = toast.type === 'success'
  return (
    <AnimatePresence>
      {toast.visible && (
        <motion.div
          key="toast"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0,  scale: 1 }}
          exit={{ opacity: 0, y: 20,    scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={[
            'fixed bottom-6 right-6 z-50 flex items-start gap-3',
            'max-w-sm w-full px-4 py-3 rounded-xl shadow-xl border',
            isSuccess
              ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-700/50 text-red-800 dark:text-red-200',
          ].join(' ')}
          role="alert"
        >
          <span className="mt-0.5 shrink-0 text-lg">
            {isSuccess ? '✅' : '❌'}
          </span>
          <div>
            <p className="font-semibold text-sm">{toast.title}</p>
            <p className="text-xs mt-0.5 opacity-80">{toast.message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── Field error message ── */
function FieldError({ message }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1"
    >
      <span>⚠</span> {message}
    </motion.p>
  )
}

/* ── Main component ── */
export default function Newsletter() {
  const [loading, setLoading] = useState(false)
  const [toast, setToast]     = useState({ visible: false, type: '', title: '', message: '' })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ mode: 'onTouched' })

  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, margin: '-80px' })

  function showToast(type, title, message) {
    setToast({ visible: true, type, title, message })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 4500)
  }

  async function onSubmit(data) {
    setLoading(true)
    try {
      // 1. Insert vào Supabase — unique constraint tự bắt email trùng
      const { error } = await supabase
        .from('newsletter')
        .insert({ email: data.email, name: data.name })

      if (error) {
        if (error.code === '23505') {
          showToast('error', 'Email đã tồn tại', 'Email này đã được đăng ký trước đó rồi.')
        } else {
          showToast('error', 'Đã xảy ra lỗi', 'Không thể đăng ký. Vui lòng thử lại sau.')
        }
        return
      }

      // 2. Fire-and-forget Make.com webhook (data đã lưu Supabase nên không block)
      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ name: data.name, email: data.email }),
      }).catch(() => {})

      showToast(
        'success',
        'Đăng ký thành công!',
        'Chúng tôi sẽ gửi ưu đãi độc quyền đến email của bạn sớm nhất.'
      )
      reset()
    } catch {
      showToast(
        'error',
        'Đã xảy ra lỗi',
        'Không thể gửi thông tin. Vui lòng thử lại sau.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Toast toast={toast} />

      <section id="newsletter" className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          <motion.div
            ref={sectionRef}
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_60%)]" />

            {/* Decorative circles */}
            <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-white/5" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center px-8 sm:px-12 py-14">

              {/* Left: Copy */}
              <div className="flex flex-col gap-4">
                <span className="inline-flex items-center gap-2 w-fit px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white border border-white/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Ưu đãi có hạn
                </span>

                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  Nhận Ưu Đãi <br />
                  <span className="text-yellow-300">Độc Quyền</span>
                </h2>

                <p className="text-purple-100 text-sm leading-relaxed max-w-sm">
                  Đăng ký ngay để nhận{' '}
                  <strong className="text-white">giảm 15%</strong> cho đơn hàng đầu tiên,
                  cùng thông tin ra mắt sản phẩm mới nhất từ SoundAura Pro.
                </p>

                <ul className="flex flex-col gap-2 mt-1">
                  {['Không spam, chỉ nội dung có giá trị', 'Hủy đăng ký bất cứ lúc nào', 'Ưu đãi sớm nhất dành cho subscribers'].map(item => (
                    <li key={item} className="flex items-center gap-2 text-xs text-purple-200">
                      <span className="text-emerald-400">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: Form */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="flex flex-col gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/15"
              >
                {/* Name field */}
                <div>
                  <label className="block text-xs font-semibold text-purple-100 mb-1.5">
                    Họ và tên <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    autoComplete="name"
                    {...register('name', {
                      required: 'Vui lòng nhập họ tên.',
                      minLength: { value: 2, message: 'Họ tên cần ít nhất 2 ký tự.' },
                    })}
                    className={[
                      'w-full px-4 py-2.5 rounded-xl text-sm bg-white/15 text-white placeholder-purple-300',
                      'border transition-colors duration-200 outline-none',
                      'focus:bg-white/20 focus:border-white/60',
                      errors.name
                        ? 'border-red-400/70'
                        : 'border-white/20 hover:border-white/40',
                    ].join(' ')}
                  />
                  {errors.name && <FieldError message={errors.name.message} />}
                </div>

                {/* Email field */}
                <div>
                  <label className="block text-xs font-semibold text-purple-100 mb-1.5">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="ban@example.com"
                    autoComplete="email"
                    {...register('email', {
                      required: 'Vui lòng nhập địa chỉ email.',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Địa chỉ email không hợp lệ.',
                      },
                    })}
                    className={[
                      'w-full px-4 py-2.5 rounded-xl text-sm bg-white/15 text-white placeholder-purple-300',
                      'border transition-colors duration-200 outline-none',
                      'focus:bg-white/20 focus:border-white/60',
                      errors.email
                        ? 'border-red-400/70'
                        : 'border-white/20 hover:border-white/40',
                    ].join(' ')}
                  />
                  {errors.email && <FieldError message={errors.email.message} />}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  data-track="newsletter-dang-ky"
                  className="mt-1 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-purple-700 font-bold text-sm hover:bg-purple-50 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                >
                  {loading ? (
                    <>
                      <Spinner /> Đang gửi...
                    </>
                  ) : (
                    <>
                      Đăng ký ngay
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-purple-300">
                  Bằng cách đăng ký, bạn đồng ý với{' '}
                  <span className="underline cursor-pointer hover:text-white transition-colors">
                    Chính sách Bảo mật
                  </span>{' '}
                  của chúng tôi.
                </p>
              </form>

            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
    </svg>
  )
}
