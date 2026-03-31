/**
 * highlightMarkerReveal.js
 *
 * Highlight-marker text-reveal system powered by GSAP + ScrollTrigger + SplitText.
 * Faithful adaptation of the provided vanilla implementation for React/Vite/ES-module usage.
 *
 * Usage
 * -----
 * Add to any element:
 *   data-highlight-marker-reveal
 *   data-marker-direction="right|left|up|down"  (default: right)
 *   data-marker-theme="bg|card|white|pink"       (default: bg)
 *   data-marker-delay="0.3"                      (seconds before bar sweep starts)
 *   data-marker-stagger="100"                    (ms between lines within one element)
 *   data-marker-scroll-start="top bottom"        (ScrollTrigger start; default fires on init)
 *
 * For contact-card expanded items that should trigger manually (not on scroll):
 *   also add: data-marker-manual
 *
 * Call initHighlightMarkerTextReveal(container) after fonts are ready.
 * Call playManualElements(container)  when the expanded card opens.
 * Call resetManualElements(container) when the expanded card closes.
 */

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

// ── Defaults ────────────────────────────────────────────────────────────────

const DEFAULTS = {
  direction:   'right',
  theme:       'bg',
  scrollStart: 'top bottom',   // fires immediately on a non-scrolling layout
  stagger:     100,            // ms between lines within a single element
  barDuration: 0.6,
  barEase:     'power3.inOut',
}

// Bar colour per theme — bars should match the element's background so the
// sweep reads as a wipe-reveal rather than a coloured highlight.
const COLOR_MAP = {
  bg:   '#0c0c10',   // main page background
  card: '#000000',   // contact card background
  white: '#ffffff',
  pink:  '#C700EF',
}

const DIRECTION_MAP = {
  right: { prop: 'scaleX', origin: 'right center' },
  left:  { prop: 'scaleX', origin: 'left center'  },
  up:    { prop: 'scaleY', origin: 'center top'   },
  down:  { prop: 'scaleY', origin: 'center bottom'},
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function resolveColor(value) {
  if (COLOR_MAP[value]) return COLOR_MAP[value]
  if (typeof value === 'string' && value.startsWith('--'))
    return getComputedStyle(document.body).getPropertyValue(value).trim() || value
  return value
}

function createBar(color, origin) {
  const bar = document.createElement('div')
  bar.className = 'highlight-marker-bar'
  Object.assign(bar.style, { backgroundColor: color, transformOrigin: origin })
  return bar
}

// ── Per-element lifecycle ────────────────────────────────────────────────────

export function cleanupElement(el) {
  if (!el._hmr) return
  el._hmr.pendingTimer?.kill()
  el._hmr.timeline?.kill()
  el._hmr.scrollTrigger?.kill()
  el._hmr.split?.revert()
  el.querySelectorAll('.highlight-marker-bar').forEach((b) => b.remove())
  delete el._hmr
}

export function initElement(el) {
  cleanupElement(el)

  const direction   = el.getAttribute('data-marker-direction')    || DEFAULTS.direction
  const theme       = el.getAttribute('data-marker-theme')        || DEFAULTS.theme
  const scrollStart = el.getAttribute('data-marker-scroll-start') || DEFAULTS.scrollStart
  const delay       = parseFloat(el.getAttribute('data-marker-delay')) || 0
  const staggerOff  = (parseFloat(el.getAttribute('data-marker-stagger')) || DEFAULTS.stagger) / 1000
  const isManual    = el.hasAttribute('data-marker-manual')

  const color     = resolveColor(theme)
  const dirConfig = DIRECTION_MAP[direction] || DIRECTION_MAP.right

  el._hmr = {}

  // Non-manual elements start hidden; GSAP takes over visibility via autoAlpha.
  if (!isManual) {
    gsap.set(el, { autoAlpha: 0 })
  }

  const split = SplitText.create(el, {
    type: 'lines',
    linesClass: 'highlight-marker-line',
    autoSplit: true,
    onSplit(self) {
      const instance = el._hmr
      instance.pendingTimer?.kill()
      instance.timeline?.kill()
      instance.scrollTrigger?.kill()
      el.querySelectorAll('.highlight-marker-bar').forEach((b) => b.remove())

      const lines = self.lines
      const tl = gsap.timeline({ paused: true })

      lines.forEach((line, i) => {
        gsap.set(line, { position: 'relative', overflow: 'hidden' })
        const bar = createBar(color, dirConfig.origin)
        line.appendChild(bar)
        tl.to(bar, {
          [dirConfig.prop]: 0,
          duration: DEFAULTS.barDuration,
          ease: DEFAULTS.barEase,
        }, i * staggerOff)
      })

      if (!isManual) {
        // Make the element visible — bars cover the text until tl plays
        gsap.set(el, { autoAlpha: 1 })

        const play = () => {
          const dt = delay > 0
            ? gsap.delayedCall(delay, () => tl.play())
            : (tl.play(), null)
          if (dt) instance.pendingTimer = dt
        }

        const st = ScrollTrigger.create({
          trigger:  el,
          start:    scrollStart,
          once:     true,
          onEnter:  play,
        })
        instance.scrollTrigger = st
      }

      instance.timeline = tl
    },
  })

  el._hmr.split = split
  return () => cleanupElement(el)
}

// ── Batch init (called once after fonts ready) ───────────────────────────────

export function initHighlightMarkerTextReveal(container = document) {
  // Honour prefers-reduced-motion — skip animation, show everything immediately
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    container.querySelectorAll('[data-highlight-marker-reveal]').forEach((el) => {
      gsap.set(el, { autoAlpha: 1 })
    })
    return () => {}
  }

  const cleanups = []
  container.querySelectorAll('[data-highlight-marker-reveal]').forEach((el) => {
    cleanups.push(initElement(el))
  })
  return () => cleanups.forEach((fn) => fn?.())
}

// ── Manual trigger helpers (for contact card expanded items) ─────────────────

export function playManualElements(container) {
  if (!container) return
  container.querySelectorAll('[data-marker-manual]').forEach((el) => {
    if (!el._hmr?.timeline) return
    const d = parseFloat(el.getAttribute('data-marker-delay')) || 0
    el._hmr.pendingTimer?.kill()
    const dt = d > 0
      ? gsap.delayedCall(d, () => {
          gsap.set(el, { autoAlpha: 1 })
          el._hmr?.timeline?.play(0)
        })
      : (() => {
          gsap.set(el, { autoAlpha: 1 })
          el._hmr.timeline.play(0)
          return null
        })()
    if (dt) el._hmr.pendingTimer = dt
  })
}

export function resetManualElements(container) {
  if (!container) return
  container.querySelectorAll('[data-marker-manual]').forEach((el) => {
    el._hmr?.pendingTimer?.kill()
    el._hmr?.timeline?.pause(0)
    gsap.set(el, { autoAlpha: 0 })
  })
}
