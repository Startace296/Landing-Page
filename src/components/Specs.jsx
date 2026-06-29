import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const SPECS = [
  { label: 'Driver',         value: '40mm Dynamic Driver',   icon: <DriverIcon /> },
  { label: 'Tần số đáp ứng', value: '20 Hz – 20,000 Hz',    icon: <FreqIcon /> },
  { label: 'Thời lượng pin', value: '40 giờ (ANC bật)',      icon: <BatteryIcon /> },
  { label: 'Bluetooth',      value: 'v5.3 · aptX HD · AAC',  icon: <BluetoothIcon /> },
  { label: 'Trọng lượng',    value: '250 g',                 icon: <WeightIcon /> },
  { label: 'Chống nước',     value: 'IPX4',                  icon: <WaterIcon /> },
]

export default function Specs() {
  const headingRef = useRef(null)
  const tableRef   = useRef(null)
  const headingInView = useInView(headingRef, { once: true, margin: '0px 100px -60px 0px' })
  const tableInView   = useInView(tableRef,   { once: true, margin: '0px 100px -60px 0px' })

  return (
    <section id="specs" className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Heading */}
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 24 }}
          animate={headingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <span className="inline-block mb-3 text-xs font-semibold tracking-widest uppercase text-purple-500 dark:text-purple-400">
            Chi tiết sản phẩm
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Thông Số{' '}
            <span className="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Kỹ Thuật
            </span>
          </h2>
        </motion.div>

        {/* Table */}
        <motion.div
          ref={tableRef}
          initial={{ opacity: 0, y: 32 }}
          animate={tableInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="rounded-2xl border border-gray-200 dark:border-gray-700/60 overflow-hidden shadow-sm"
        >
          {/* Table header */}
          <div className="grid grid-cols-2 bg-gray-100 dark:bg-gray-800 px-5 py-3 border-b border-gray-200 dark:border-gray-700">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Thông số
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Giá trị
            </span>
          </div>

          {/* Rows */}
          {SPECS.map(({ label, value, icon }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -16 }}
              animate={tableInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 + i * 0.07 }}
              className={[
                'grid grid-cols-2 items-center px-5 py-4 gap-4',
                'border-b border-gray-100 dark:border-gray-800 last:border-0',
                i % 2 === 0
                  ? 'bg-white dark:bg-gray-900'
                  : 'bg-gray-50/80 dark:bg-gray-800/40',
              ].join(' ')}
            >
              {/* Label */}
              <div className="flex items-center gap-3">
                <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-500 dark:text-purple-400">
                  {icon}
                </span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {label}
                </span>
              </div>

              {/* Value */}
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {value}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={tableInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-5 text-center text-xs text-gray-400 dark:text-gray-600"
        >
          * Thông số có thể thay đổi tùy theo điều kiện sử dụng thực tế.
        </motion.p>

      </div>
    </section>
  )
}

/* ── Icons ── */
function DriverIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function FreqIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h2l3-8 4 16 3-10 2 5 2-3h4"/>
    </svg>
  )
}

function BatteryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="6" width="18" height="12" rx="2"/>
      <path d="M23 13v-2"/>
      <path d="M6 10v4M10 10v4M14 10v4"/>
    </svg>
  )
}

function BluetoothIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6.5 6.5 11 11L12 23V1l5.5 5.5-11 11"/>
    </svg>
  )
}

function WeightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12l4 6-10 13L2 9z"/>
      <path d="M11 3 8 9l4 13 4-13-3-6"/>
      <path d="M2 9h20"/>
    </svg>
  )
}

function WaterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6 2 2 8.5 2 13a10 10 0 0 0 20 0c0-4.5-4-11-10-11z"/>
    </svg>
  )
}
