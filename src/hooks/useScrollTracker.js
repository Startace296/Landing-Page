import { useEffect, useRef } from 'react'

const MILESTONES = [25, 50, 75, 100]

/**
 * @param {(event: {type, label, value}) => void} [onEvent]
 */
export function useScrollTracker(onEvent) {
  const firedRef   = useRef(new Set())   // milestones already fired
  const handlerRef = useRef(null)        // stable ref to onEvent

  // Keep handlerRef current without re-subscribing listeners
  useEffect(() => {
    handlerRef.current = onEvent ?? defaultLog
  })

  //Scroll depth
  useEffect(() => {
    function onScroll() {
      const scrolled = window.scrollY
      const total    = document.documentElement.scrollHeight - window.innerHeight
      if (total <= 0) return

      const pct = Math.round((scrolled / total) * 100)

      for (const milestone of MILESTONES) {
        if (pct >= milestone && !firedRef.current.has(milestone)) {
          firedRef.current.add(milestone)
          handlerRef.current({
            type:  'scroll_depth',
            label: `Scrolled ${milestone}%`,
            value: milestone,
          })
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  //CTA clicks 
  useEffect(() => {
    function onClick(e) {
      const target = e.target.closest('[data-track]')
      if (!target) return

      handlerRef.current({
        type:  'cta_click',
        label: target.dataset.track,
        value: target.href ?? target.textContent?.trim() ?? null,
      })
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
}

function defaultLog(event) {
  const icons = { scroll_depth: '📊', cta_click: '🖱️' }
  console.log(
    `%c[Analytics] ${icons[event.type] ?? '📌'} ${event.label}`,
    'color: #a855f7; font-weight: bold;',
    event.value !== null ? `→ ${event.value}` : ''
  )
}
