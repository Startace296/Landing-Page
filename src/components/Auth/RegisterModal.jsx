import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const panelVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, scale: 0.95, y: 12, transition: { duration: 0.18 } },
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }) {
  const { signUp } = useAuth()
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ mode: 'onTouched' })

  const password = watch('password')

  async function onSubmit(data) {
    setAuthError('')
    setLoading(true)
    try {
      await signUp({ email: data.email, password: data.password, fullName: data.fullName })
      toast.success('Đăng ký thành công! Kiểm tra email để xác nhận tài khoản.', {
        duration: 5000,
        style: { maxWidth: '360px' },
      })
      onClose()
    } catch (err) {
      setAuthError(err.message ?? 'Đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="register-backdrop"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            key="register-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
          >
            {/* Header */}
            <div className="relative px-6 pt-6 pb-4">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tạo tài khoản</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Nhận ưu đãi độc quyền từ SoundAura Pro
                </p>
              </div>
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Đóng"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-6 pb-6 flex flex-col gap-4">

              {/* Auth error */}
              <AnimatePresence>
                {authError && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg px-3 py-2"
                  >
                    {authError}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Full name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Họ và tên
                </label>
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Nguyễn Văn A"
                  {...register('fullName', {
                    required: 'Vui lòng nhập họ tên.',
                    minLength: { value: 2, message: 'Họ tên cần ít nhất 2 ký tự.' },
                  })}
                  className={inputClass(!!errors.fullName)}
                />
                {errors.fullName && <FieldError message={errors.fullName.message} />}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="ban@example.com"
                  {...register('email', {
                    required: 'Vui lòng nhập email.',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email không hợp lệ.' },
                  })}
                  className={inputClass(!!errors.email)}
                />
                {errors.email && <FieldError message={errors.email.message} />}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Tối thiểu 6 ký tự"
                  {...register('password', {
                    required: 'Vui lòng nhập mật khẩu.',
                    minLength: { value: 6, message: 'Mật khẩu cần ít nhất 6 ký tự.' },
                  })}
                  className={inputClass(!!errors.password)}
                />
                {errors.password && <FieldError message={errors.password.message} />}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Nhập lại mật khẩu"
                  {...register('confirmPassword', {
                    required: 'Vui lòng xác nhận mật khẩu.',
                    validate: v => v === password || 'Mật khẩu không khớp.',
                  })}
                  className={inputClass(!!errors.confirmPassword)}
                />
                {errors.confirmPassword && <FieldError message={errors.confirmPassword.message} />}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 active:scale-[0.98] mt-1"
              >
                {loading ? <Spinner /> : 'Đăng ký'}
              </button>

              {/* Switch to login */}
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-purple-600 dark:text-purple-400 font-semibold hover:underline"
                >
                  Đăng nhập
                </button>
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function inputClass(hasError) {
  return [
    'w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-colors',
    'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100',
    'placeholder-gray-400 dark:placeholder-gray-500',
    hasError
      ? 'border-red-400 dark:border-red-500 focus:border-red-400'
      : 'border-gray-200 dark:border-gray-700 focus:border-purple-400 dark:focus:border-purple-500',
  ].join(' ')
}

function FieldError({ message }) {
  return (
    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
      <span>⚠</span> {message}
    </p>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
    </svg>
  )
}
