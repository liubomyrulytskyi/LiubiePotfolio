/**
 * splitTextReveal.js
 *
 * Line-mask SplitText reveal system powered by GSAP + ScrollTrigger + SplitText.
 * Faithful ES-module conversion of the advanced implementation reference provided.
 *
 * Usage
 * ─────
 * Add to any text element:
 *   data-split="heading"
 *   data-split-reveal="lines|words|chars"   (default: lines)
 *   data-split-delay="0.35"                 (seconds before animation starts)
 *
 * For contact-card expanded items that play on card open, not on scroll:
 *   also add: data-split-manual
 *
 * Entry points
 * ────────────
 *   initSplitTextReveal()           – call once after document.fonts.ready
 *   playManualElements(container)   – call when the expanded card opens
 *   resetManualElements(container)  – call when the expanded card closes
 */

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(SplitText, ScrollTrigger)

// Per-type animation config — mirrors the advanced reference exactly
const SPLIT_CONFIG = {
  lines: { duration: 0.8, stagger: 0.08 },
  words: { duration: 0.6, stagger: 0.06 },
  chars: { duration: 0.4, stagger: 0.01 },
}

// ── Per-element init ─────────────────────────────────────────────────────────

function initElement(el) {
  const type     = el.dataset.splitReveal || 'lines'
  const isManual = el.hasAttribute('data-split-manual')
  const delay    = parseFloat(el.getAttribute('data-split-delay')) || 0

  // Restore visibility (was hidden by CSS rule) before SplitText measures.
  // Lines will be below the mask (yPercent: 110) so text stays invisible
  // until the tween plays — no raw text flash.
  gsap.set(el, { autoAlpha: 1 })

  el._str = {} // splitTextReveal state bag

  const typesToSplit =
    type === 'lines' ? ['lines'] :
    type === 'words' ? ['lines', 'words'] :
    ['lines', 'words', 'chars']

  const split = SplitText.create(el, {
    type:       typesToSplit.join(', '),
    mask:       'lines',           // overflow:hidden wrapper per line — the core of the reveal
    autoSplit:  true,              // re-splits on container-width changes
    linesClass: 'split-line',
    wordsClass: 'split-word',
    charsClass: 'split-char',

    onSplit(instance) {
      // onSplit fires on init AND on every autoSplit re-split.
      // Kill previous tween so there are no duplicate animations.
      const ref = el._str
      ref.tween?.kill()

      const targets = instance[type]
      const config  = SPLIT_CONFIG[type]

      if (isManual) {
        // Paused tween — played explicitly via playManualElements().
        const tween = gsap.from(targets, {
          yPercent: 110,
          duration: config.duration,
          stagger:  config.stagger,
          ease:     'expo.out',
          paused:   true,
        })
        ref.tween = tween
        return tween // GSAP uses the return value to kill on next re-split
      }

      // Scroll-triggered tween (fires immediately for fixed layouts with no scroll)
      const tween = gsap.from(targets, {
        yPercent: 110,
        duration: config.duration,
        stagger:  config.stagger,
        ease:     'expo.out',
        delay,
        scrollTrigger: {
          trigger: el,
          start:   'clamp(top 80%)',
          once:    true,
        },
      })
      ref.tween = tween
      return tween
    },
  })

  el._str.split = split

  return () => {
    el._str?.tween?.kill()
    el._str?.pendingTimer?.kill()
    split.revert()
    delete el._str
  }
}

// ── Batch init ───────────────────────────────────────────────────────────────

export function initSplitTextReveal(container = document) {
  // Honour prefers-reduced-motion — skip animation, show everything instantly
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    container.querySelectorAll('[data-split="heading"]').forEach((el) => {
      gsap.set(el, { autoAlpha: 1 })
    })
    return () => {}
  }

  const cleanups = []
  container.querySelectorAll('[data-split="heading"]').forEach((el) => {
    cleanups.push(initElement(el))
  })
  return () => cleanups.forEach((fn) => fn?.())
}

// ── Manual trigger API (contact card expanded items) ─────────────────────────

export function playManualElements(container) {
  if (!container) return
  container.querySelectorAll('[data-split-manual]').forEach((el) => {
    const delay = parseFloat(el.getAttribute('data-split-delay')) || 0
    if (!el._str?.tween) return

    el._str.pendingTimer?.kill()

    if (delay > 0) {
      el._str.pendingTimer = gsap.delayedCall(delay, () => {
        gsap.set(el, { autoAlpha: 1 })
        el._str?.tween?.play(0)
      })
    } else {
      gsap.set(el, { autoAlpha: 1 })
      el._str.tween.play(0)
    }
  })
}

export function resetManualElements(container) {
  if (!container) return
  container.querySelectorAll('[data-split-manual]').forEach((el) => {
    el._str?.pendingTimer?.kill()
    el._str?.tween?.progress(0).pause() // reset lines to yPercent:110 (below mask)
    gsap.set(el, { autoAlpha: 0 })
  })
}
