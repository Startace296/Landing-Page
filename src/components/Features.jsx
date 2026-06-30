import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const FEATURES = [
  {
    icon: <ANCIcon />,
    title: 'Chống Ồn Chủ Động',
    description:
      'Công nghệ ANC thế hệ mới loại bỏ đến 98% tiếng ồn môi trường, cho phép bạn tập trung hoàn toàn vào âm nhạc dù đang ở bất kỳ đâu.',
    accent: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-100 dark:border-purple-800/40',
  },
  {
    icon: <BatteryIcon />,
    title: 'Pin 40 Giờ',
    description:
      'Sạc nhanh 15 phút cho 3 giờ nghe nhạc. Pin dung lượng lớn đi cùng bạn suốt chuyến đi dài mà không lo gián đoạn.',
    accent: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-100 dark:border-emerald-800/40',
  },
  {
    icon: <SpatialIcon />,
    title: 'Spatial Audio',
    description:
      'Âm thanh vòm 360° tái tạo không gian phòng thu chuẩn xác, mang lại cảm giác như đang ngồi giữa ban nhạc thực sự.',
    accent: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-100 dark:border-blue-800/40',
  },
  {
    icon: <MultiDeviceIcon />,
    title: 'Kết Nối Đa Thiết Bị',
    description:
      'Kết nối đồng thời 2 thiết bị qua Bluetooth 5.3. Chuyển đổi giữa điện thoại và laptop chỉ trong 1 giây, không cần ngắt kết nối.',
    accent: 'from-orange-500 to-amber-600',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-100 dark:border-orange-800/40',
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.12 },
  }),
}

function FeatureCard({ feature, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={[
        'group relative flex flex-col gap-4 p-6 rounded-2xl border',
        'transition-shadow duration-300 hover:shadow-xl',
        feature.bg,
        feature.border,
      ].join(' ')}
    >
      {/* Icon */}
      <div
        className={[
          'w-12 h-12 rounded-xl flex items-center justify-center',
          'bg-gradient-to-br text-white shadow-md',
          feature.accent,
        ].join(' ')}
      >
        {feature.icon}
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          {feature.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {feature.description}
        </p>
      </div>

      {/* Hover accent line */}
      <div
        className={[
          'absolute bottom-0 left-6 right-6 h-0.5 rounded-full bg-gradient-to-r scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left',
          feature.accent,
        ].join(' ')}
      />
    </motion.div>
  )
}

export default function Features() {
  const headingRef = useRef(null)
  const headingInView = useInView(headingRef, { once: true, margin: '-60px' })

  return (
    <section id="features" className="py-24 bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Heading */}
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 24 }}
          animate={headingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center text-center mb-14"
        >
          <span className="inline-block mb-3 text-xs font-semibold tracking-widest uppercase text-purple-500 dark:text-purple-400">
            Vì sao chọn SoundAura Pro
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Tính Năng{' '}
            <span className="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Nổi Bật
            </span>
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-2xl text-base text-center">
            Mỗi chi tiết được thiết kế để nâng tầm trải nghiệm nghe nhạc của bạn lên một đẳng cấp hoàn toàn mới.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>

      </div>
    </section>
  )
}

/* ── Icons ── */
function ANCIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13"/>
      <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

function BatteryIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="6" width="18" height="12" rx="2"/>
      <path d="M23 13v-2"/><path d="M5 10v4"/><path d="M9 10v4"/><path d="M13 10v4"/>
    </svg>
  )
}

function SpatialIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
      <path d="M2 12h20"/>
    </svg>
  )
}

function MultiDeviceIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2"/>
      <path d="M12 18h.01"/>
      <path d="M1 7h3"/><path d="M1 12h3"/><path d="M20 7h3"/><path d="M20 12h3"/>
    </svg>
  )
}
