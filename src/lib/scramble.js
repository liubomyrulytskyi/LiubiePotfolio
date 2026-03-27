/**
 * scramble.js — pure-JS scramble text engine.
 *
 * No GSAP Club plugins needed. Uses requestAnimationFrame for smooth
 * timing and IntersectionObserver for viewport-triggered effects.
 *
 * API
 *   scramble(el, options)           → cancelFn
 *   scrambleOnVisible(el, options)  → cancelFn
 *   scrambleOnHover(trigger, target, options) → cancelFn
 */

const CHARS_UPPER   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const CHARS_SYMBOLS = '◊▯∆|'

/**
 * Build one frame of scrambled text.
 * Characters are revealed left-to-right as `progress` (0→1) advances.
 * Non-alphanumeric characters (spaces, *, commas, parens) stay in place.
 */
function buildFrame(original, progress, chars, speed) {
  let out = ''
  for (let i = 0; i < original.length; i++) {
    const ch = original[i]
    if (!/[A-Za-z0-9]/.test(ch)) { out += ch; continue }
    // Reveal threshold for this character position
    const threshold = ((i + 1) / original.length) * speed
    out += progress >= threshold
      ? ch
      : chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}

/**
 * Run a scramble animation on a single DOM element.
 *
 * @param {HTMLElement} el
 * @param {object}      opts
 * @param {number}      opts.duration  - seconds (default 1.2)
 * @param {string}      opts.chars     - scramble character pool
 * @param {number}      opts.speed     - reveal speed, 0.25–1 (default 0.85)
 * @param {number}      opts.delay     - seconds before start (default 0)
 * @param {Function}    opts.onComplete
 * @returns {Function} cancel — stops animation and restores original text
 */
export function scramble(el, {
  duration   = 1.2,
  chars      = CHARS_UPPER,
  speed      = 0.85,
  delay      = 0,
  onComplete,
} = {}) {
  const original  = el.textContent
  let   rafId
  let   timeoutId
  let   cancelled = false

  const run = () => {
    const startMs = performance.now()
    const durationMs = duration * 1000

    const tick = (now) => {
      if (cancelled) return
      const progress = Math.min((now - startMs) / durationMs, 1)
      el.textContent = buildFrame(original, progress, chars, speed)
      if (progress < 1) {
        rafId = requestAnimationFrame(tick)
      } else {
        el.textContent = original
        onComplete?.()
      }
    }
    rafId = requestAnimationFrame(tick)
  }

  if (delay > 0) {
    timeoutId = setTimeout(run, delay * 1000)
  } else {
    run()
  }

  return () => {
    cancelled = true
    clearTimeout(timeoutId)
    cancelAnimationFrame(rafId)
    if (el.isConnected) el.textContent = original
  }
}

/**
 * Trigger a scramble once when the element enters the viewport.
 * In a non-scrolling layout this fires on mount; the `delay` option
 * lets you stagger multiple elements.
 */
export function scrambleOnVisible(el, options = {}) {
  let cancel

  const observer = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return
    observer.disconnect()
    cancel = scramble(el, options)
  }, { threshold: 0 })

  observer.observe(el)

  return () => {
    observer.disconnect()
    cancel?.()
  }
}

/**
 * Add scramble animations to mouseenter / mouseleave on a trigger element.
 *
 * @param {HTMLElement} triggerEl  - element that receives the mouse events
 * @param {HTMLElement} targetEl   - element whose text is scrambled (often same)
 * @param {object}      opts
 * @param {number}      opts.enterDuration
 * @param {number}      opts.leaveDuration
 * @param {string}      opts.enterChars
 * @param {string}      opts.leaveChars
 */
export function scrambleOnHover(triggerEl, targetEl = triggerEl, {
  enterDuration = 1,
  leaveDuration = 0.6,
  enterChars    = CHARS_SYMBOLS,
  leaveChars    = '◊▯∆',
} = {}) {
  const original = targetEl.textContent
  let cancel

  const onEnter = () => {
    cancel?.()
    cancel = scramble(targetEl, { duration: enterDuration, chars: enterChars, speed: 1 })
  }

  const onLeave = () => {
    cancel?.()
    cancel = scramble(targetEl, { duration: leaveDuration, chars: leaveChars, speed: 2 })
  }

  triggerEl.addEventListener('mouseenter', onEnter)
  triggerEl.addEventListener('mouseleave', onLeave)

  return () => {
    triggerEl.removeEventListener('mouseenter', onEnter)
    triggerEl.removeEventListener('mouseleave', onLeave)
    cancel?.()
    if (targetEl.isConnected) targetEl.textContent = original
  }
}
