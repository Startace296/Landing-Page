import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`

const SYSTEM_PROMPT = `Bạn là tư vấn viên chuyên nghiệp cho tai nghe SoundAura Pro. Nhiệm vụ của bạn là giúp khách hàng tìm hiểu sản phẩm và giải đáp thắc mắc một cách ngắn gọn, thân thiện.

Thông tin sản phẩm SoundAura Pro:
- Driver: 40mm Dynamic Driver
- Tần số đáp ứng: 20 Hz – 20,000 Hz
- Pin: 40 giờ (khi bật ANC)
- Bluetooth: v5.3 · aptX HD · AAC
- Trọng lượng: 250g
- Chống nước: IPX4
- Tính năng: Chống ồn chủ động (ANC), Spatial Audio, kết nối đa thiết bị
- Đánh giá: 4.9/5 từ 12.000+ khách hàng
- Miễn phí ship toàn quốc

Hướng dẫn trả lời:
- Chỉ trả lời bằng tiếng Việt
- Giới hạn 2-3 câu ngắn gọn mỗi lần
- Nếu khách hỏi giá, mời đăng ký newsletter để nhận giảm 15%
- Không bịa đặt thông tin ngoài dữ liệu trên`

const GREETING = 'Xin chào! Tôi là tư vấn viên SoundAura Pro 👋 Bạn muốn biết gì về tai nghe của chúng tôi?'

export default function Chatbot() {
  const [isOpen, setIsOpen]   = useState(false)
  const [messages, setMessages] = useState([{ role: 'model', text: GREETING }])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 280)
  }, [isOpen])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    const next = [...messages, { role: 'user', text }]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      // Gemini requires contents to start with a user turn
      const firstUser = next.findIndex(m => m.role === 'user')
      const contents = next.slice(firstUser).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }))

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { maxOutputTokens: 256, temperature: 0.7 },
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data  = await res.json()
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
                    ?? 'Xin lỗi, tôi không thể trả lời lúc này. Vui lòng thử lại!'

      setMessages(prev => [...prev, { role: 'model', text: reply }])
    } catch (err) {
      console.error('[Chatbot] Gemini error:', err)
      setMessages(prev => [
        ...prev,
        { role: 'model', text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <>
      {/* ── Chat window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-80 sm:w-[360px] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-900"
            style={{ maxHeight: '34rem' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-violet-600 shrink-0">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <HeadphonesIcon />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white leading-tight">SoundAura Pro</p>
                <p className="text-[11px] text-purple-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Tư vấn trực tuyến
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Đóng"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0 scrollbar-thin">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {msg.role === 'model' && (
                    <div className="w-6 h-6 shrink-0 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-500 dark:text-purple-400">
                      <BotIcon />
                    </div>
                  )}
                  <div
                    className={[
                      'max-w-[76%] px-3.5 py-2.5 text-sm leading-relaxed break-words',
                      msg.role === 'user'
                        ? 'bg-purple-600 text-white rounded-2xl rounded-br-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-sm',
                    ].join(' ')}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex items-end gap-2">
                  <div className="w-6 h-6 shrink-0 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-500 dark:text-purple-400">
                    <BotIcon />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
                    {[0, 150, 300].map(delay => (
                      <span
                        key={delay}
                        className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-800 flex gap-2 items-center shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Nhập câu hỏi..."
                disabled={loading}
                className="flex-1 min-w-0 px-3.5 py-2 rounded-xl text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 border border-transparent focus:border-purple-400 dark:focus:border-purple-500 outline-none transition-colors disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="shrink-0 w-9 h-9 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center text-white transition-all duration-200"
                aria-label="Gửi"
              >
                <SendIcon />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toggle button ── */}
      <motion.button
        onClick={() => setIsOpen(v => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-5 right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/40 flex items-center justify-center"
        aria-label={isOpen ? 'Đóng chat' : 'Mở tư vấn'}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isOpen ? 'close' : 'chat'}
            initial={{ rotate: isOpen ? -90 : 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: isOpen ? 90 : -90, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex items-center justify-center"
          >
            {isOpen ? <CloseIcon size={22} /> : <ChatIcon size={22} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </>
  )
}

/* ── Icons ── */
function ChatIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )
}

function CloseIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4 20-7z"/>
      <path d="M22 2 11 13"/>
    </svg>
  )
}

function BotIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8"/>
      <rect width="16" height="12" x="4" y="8" rx="2"/>
      <path d="M2 14h2M20 14h2M9 13v2M15 13v2"/>
    </svg>
  )
}

function HeadphonesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
    </svg>
  )
}
