import { motion } from 'framer-motion'
import headphonesImg from '../assets/headphones.svg'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
})

const floatAnim = { 
  animate: {
    y: [0, -14, 0],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white dark:bg-gray-950">

      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-purple-300/30 dark:bg-purple-900/25 blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-300/25 dark:bg-indigo-900/20 blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

        {/* ── Left: Text ── */}
        <div className="flex flex-col items-start gap-6 order-2 md:order-1">

          {/* Badge */}
          <motion.div {...fadeUp(0)}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-700/60">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
              New — SoundAura Pro Gen 2
            </span>
          </motion.div>

          {/* Tagline */}
          <motion.h1
            {...fadeUp(0.1)}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-none text-gray-900 dark:text-white"
          >
            Sound That{' '}
            <span className="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Moves You
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            {...fadeUp(0.2)}
            className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-md"
          >
            SoundAura Pro mang đến trải nghiệm âm thanh studio ngay trong tầm tay —
            chống ồn chủ động, pin 40 giờ, và thiết kế cao cấp dành cho những người
            thực sự yêu nhạc.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div {...fadeUp(0.3)} className="flex flex-wrap gap-3 pt-2">
            <a
              href="#newsletter"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-purple-500/30"
            >
              Mua ngay
              <CartIcon />
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 font-semibold text-sm bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm active:scale-95 transition-all duration-200"
            >
              Tìm hiểu thêm
              <ArrowIcon />
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            {...fadeUp(0.4)}
            className="flex gap-8 pt-4 border-t border-gray-100 dark:border-gray-800 w-full"
          >
            {[
              { value: '40h',   label: 'Pin sử dụng' },
              { value: 'ANC',   label: 'Chống ồn chủ động' },
              { value: 'Hi-Fi', label: 'Âm thanh lossless' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Right: Image ── */}
        <div className="relative flex justify-center items-center order-1 md:order-2">
          {/* Glow ring behind image */}
          <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-br from-purple-400/20 to-indigo-400/20 dark:from-purple-600/20 dark:to-indigo-600/20 blur-2xl" />

          <motion.div
            variants={floatAnim}
            animate="animate"
            className="relative z-10"
          >
            <motion.img
              src={headphonesImg}
              alt="SoundAura Pro headphones"
              width={420}
              height={360}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="w-72 sm:w-96 drop-shadow-2xl select-none"
              draggable={false}
            />
          </motion.div>

          {/* Floating badge: rating */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="absolute bottom-8 -left-2 sm:left-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl"
          >
            <span className="text-yellow-400 text-base">★★★★★</span>
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">4.9 / 5</p>
              <p className="text-[10px] text-gray-400 leading-none mt-0.5">12k+ đánh giá</p>
            </div>
          </motion.div>

          {/* Floating badge: free ship */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="absolute top-8 -right-2 sm:right-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl"
          >
            <span className="text-xl">🚚</span>
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">Miễn phí ship</p>
              <p className="text-[10px] text-gray-400 leading-none mt-0.5">Toàn quốc</p>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  )
}

function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  )
}
