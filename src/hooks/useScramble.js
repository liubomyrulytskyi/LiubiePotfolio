/**
 * useScramble.js — React hooks that wrap the scramble utility.
 *
 * Each hook manages its own RAF / observer / listener lifecycle
 * and returns cleanup via useEffect's return value.
 */
import { useEffect } from 'react'
import { scramble, scrambleOnVisible, scrambleOnHover } from '../lib/scramble.js'

/** Scramble a single element on mount (page-load effect). */
export function useScrambleOnLoad(ref, options = {}) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    return scramble(el, options)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Scramble an array of elements when each enters the viewport.
 * Pass a stagger (seconds) to offset each item.
 *
 * @param {React.MutableRefObject<HTMLElement[]>} refsRef
 * @param {object} options   - forwarded to scramble()
 * @param {number} stagger   - per-item delay increment in seconds
 */
export function useScrambleArrayOnVisible(refsRef, options = {}, stagger = 0.07) {
  useEffect(() => {
    const elements = refsRef.current.filter(Boolean)
    const cleanups = elements.map((el, i) =>
      scrambleOnVisible(el, {
        ...options,
        delay: (options.delay ?? 0) + i * stagger,
      })
    )
    return () => cleanups.forEach((fn) => fn?.())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}

/** Scramble on hover for a single element. */
export function useScrambleOnHover(ref, options = {}) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    return scrambleOnHover(el, el, options)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Scramble on hover for an array of elements.
 *
 * @param {React.MutableRefObject<HTMLElement[]>} refsRef
 * @param {object} options  - forwarded to scrambleOnHover()
 */
export function useScrambleHoverArray(refsRef, options = {}) {
  useEffect(() => {
    const elements = refsRef.current.filter(Boolean)
    const cleanups = elements.map((el) => scrambleOnHover(el, el, options))
    return () => cleanups.forEach((fn) => fn?.())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
