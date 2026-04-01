import { useEffect, useRef, useState } from 'react'
import HeroBackground from './HeroBackground.jsx'
import {
  useScrambleOnHover,
  useScrambleHoverArray,
} from './hooks/useScramble.js'
import {
  initSplitTextReveal,
  playManualElements,
  resetManualElements,
} from './lib/splitTextReveal.js'

const CUSTOM_PANEL_IMAGE_URL = '/image.png'

// Portrait assets — valid ~7 days from Figma export
const PORTRAIT_URL    = 'https://www.figma.com/api/mcp/asset/443e1956-8c50-4dba-a804-37dfe6958ae1'
const PORTRAIT_BW_URL = 'https://www.figma.com/api/mcp/asset/a5c3f19f-b57e-4fbe-963e-2ea3e080426b'

const PROJECTS = [
  { name: 'Constructive Bio', year: '2022', nda: true },
  { name: 'Sound OF',         year: '2022', nda: true },
  { name: 'One Day, You',     year: '2023', nda: false },
  { name: 'Octelle',          year: '2024', nda: true },
  { name: 'Elecctro',         year: '2025', nda: false },
  { name: "D'oism Systems",   year: '2025', nda: true },
  { name: 'PtP',              year: '2026', nda: true },
]

// Horizontal ticker — two identical copies so translateX(-50%) loops seamlessly.
const TICKER_TEXT = 'UI/UX\u00a0*\u00a0Art-Direction\u00a0*\u00a0Motion\u00a0*\u00a0'

export default function App() {
  // ── Layout scale ─────────────────────────────────────────
  const containerRef = useRef(null)

  useEffect(() => {
    const scale = () => {
      const el = containerRef.current
      if (!el) return
      const s = Math.min(window.innerWidth / 1440, window.innerHeight / 900)
      el.style.transform = `scale(${s})`
      el.style.left = `${(window.innerWidth  - 1440 * s) / 2}px`
      el.style.top  = `${(window.innerHeight - 900  * s) / 2}px`
      el.style.setProperty('--scene-scale', `${s}`)
    }
    scale()
    window.addEventListener('resize', scale)
    return () => window.removeEventListener('resize', scale)
  }, [])

  // ── SplitText line-mask reveal ────────────────────────────────────────────
  // Waits for fonts so SplitText measures line breaks correctly (no bad splits).
  useEffect(() => {
    let cleanup
    document.fonts.ready.then(() => {
      cleanup = initSplitTextReveal()
    })
    return () => cleanup?.()
  }, [])

  // ── Hover scramble (separate system — kept, no conflict with SplitText) ────
  const socialRefs = useRef([null, null, null])
  const emailRef   = useRef(null)

  useScrambleHoverArray(socialRefs, {
    enterDuration: 0.8,
    leaveDuration: 0.5,
    enterChars: '◊▯∆|',
    leaveChars: '◊▯∆',
  })
  useScrambleOnHover(emailRef, {
    enterDuration: 0.7,
    leaveDuration: 0.4,
    enterChars: '◊▯∆|',
    leaveChars: '◊▯∆',
  })

  // ── Contact card expansion ────────────────────────────────────────────────
  const [contactExpanded, setContactExpanded] = useState(false)
  const [hasCustomPanelImage, setHasCustomPanelImage] = useState(true)
  const contactCardRef = useRef(null)

  const openContact = () => {
    if (!contactCardRef.current) return
    setContactExpanded(true)
    setCursorVisible(false)
  }

  const closeContact = () => {
    setContactExpanded(false)
  }

  // Play / reset manual SplitText items when card expands or collapses
  useEffect(() => {
    const card = contactCardRef.current
    if (!card) return
    if (contactExpanded) {
      playManualElements(card)
    } else {
      resetManualElements(card)
    }
  }, [contactExpanded])

  // Close on click outside — only active when expanded
  useEffect(() => {
    if (!contactExpanded) return
    const handler = (e) => {
      if (contactCardRef.current && !contactCardRef.current.contains(e.target)) {
        closeContact()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [contactExpanded]) // eslint-disable-line react-hooks/exhaustive-deps

  // Close on ESC
  useEffect(() => {
    if (!contactExpanded) return
    const handler = (e) => {
      if (e.key === 'Escape') closeContact()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [contactExpanded]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Custom expand cursor ──────────────────────────────────────────────────
  const [cursorPos, setCursorPos]         = useState({ x: -200, y: -200 })
  const [cursorVisible, setCursorVisible] = useState(false)

  useEffect(() => {
    const handler = (e) => setCursorPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  const handleCustomPanelImageError = () => {
    setHasCustomPanelImage(false)
  }

  return (
    <>
      {/* ── Custom expand cursor — screen space, outside scaled container ── */}
      <div
        className={`contact-expand-cursor${cursorVisible && !contactExpanded ? ' contact-expand-cursor--visible' : ''}`}
        style={{ transform: `translate(${cursorPos.x}px, ${cursorPos.y}px)` }}
        aria-hidden="true"
      >
        + expand
      </div>

      {/* ── Scene background ── */}
      <HeroBackground />

      <div
        ref={containerRef}
        className={`scale-root${contactExpanded ? ' contact-is-expanded' : ''}`}
      >

        {/* ── Hero name (top-left, blurred) ──────────────────────────────────
            Each span is one SplitText element → one masked line that slides up.
            The h1's filter:blur(7px) is inherited by both the mask and the line,
            keeping the blurred aesthetic while the line reveals from below.   ── */}
        <h1 className="hero-name">
          <span data-split="heading" data-split-delay="0.10">LIUBIE</span>
          <br />
          <span data-split="heading" data-split-delay="0.22">ULYTSKYI</span>
        </h1>

        {/* ── Mid-screen editorial copy ─────────────────────────────────────── */}
        <section className="projects-stage" aria-label="Selected works and recognition">
          <ul className="projects-list projects-list--names" aria-hidden="true">
            {PROJECTS.map(({ name, year, nda }, i) => (
              <li
                key={`${name}-${year}-name`}
                className="project-row project-row--name"
                style={{ animationDelay: `${0.35 + i * 0.07}s` }}
              >
                <span className="project-inline-bracket">//</span>
                <span className="project-name">
                  {name}{nda ? ' (NDA)' : ''}
                </span>
              </li>
            ))}
          </ul>

          <div
            className="role-card"
            aria-hidden="true"
          >
            <span className="plus-deco">+</span>
            <div className="role-inner">
              <div className="role-title-row">
                <span className="bracket">//</span>
                <span className="role-title">Creative Digital Designer</span>
                <span className="bracket-r">\\</span>
              </div>
              <p className="award-text">Awwwards Young Jury 25&apos;26</p>
            </div>
            <span className="plus-deco">+</span>
          </div>

          <ul className="projects-list projects-list--years" aria-hidden="true">
            {PROJECTS.map(({ name, year }, i) => (
              <li
                key={`${name}-${year}-year`}
                className="project-row project-row--year"
                style={{ animationDelay: `${0.35 + i * 0.07}s` }}
              >
                <span className="year">{year}</span>
                <span className="project-inline-bracket project-inline-bracket--right">\\</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Go rage indicator (bottom-center) ── */}
        <div className="go-rage">
          <div className="go-rage-dot-wrap">
            <div className="go-rage-dot" />
          </div>
          {/* SplitText: single-line text, slides up from below its mask */}
          <span
            className="go-rage-text"
            data-split="heading"
            data-split-delay="0.65"
          >go rage</span>
        </div>
        {/* ── Center-left plus decoration ── */}
        <span
          className="plus-center-left"
          aria-hidden="true"
          data-split="heading"
          data-split-delay="0.38"
        >+</span>

      </div>

      <div className={`viewport-ui${contactExpanded ? ' contact-is-expanded' : ''}`}>
        {/* ── Contact card (top-right, expandable) ── */}
        <div
          ref={contactCardRef}
          className="contact-card"
          data-contact-status={contactExpanded ? 'active' : 'not-active'}
          onClick={openContact}
          onMouseEnter={() => { if (!contactExpanded) setCursorVisible(true) }}
          onMouseLeave={() => setCursorVisible(false)}
        >

          {/* ── Collapsed view ── */}
          <div className="contact-collapsed-view">
            <div className="contact-photo-wrap">
              <img
                src={hasCustomPanelImage ? CUSTOM_PANEL_IMAGE_URL : PORTRAIT_URL}
                alt="Liubie Ulytskyi"
                className="contact-photo"
                onError={handleCustomPanelImageError}
              />
            </div>
            <div className="contact-info">
              <div className="contact-role-row">
                <span className="plus-sm">+</span>
                <span className="contact-role">Creative Digital<br />Designer</span>
              </div>
              <a
                href="mailto:hello@liubie.com"
                className="email-link"
                ref={emailRef}
                onClick={e => e.stopPropagation()}
              >
                Email me
              </a>
            </div>
          </div>

          <div
            className="contact-expanded-view"
            aria-hidden={contactExpanded ? 'false' : 'true'}
          >
            <div className="contact-exp-inner">
              <div className="contact-exp-top">
                <div
                  className="contact-exp-header"
                  data-split="heading"
                  data-split-manual
                  data-split-delay="0.3"
                >
                  <div className="contact-exp-role-block">
                    <span className="contact-exp-plus" aria-hidden="true">+</span>
                    <div className="contact-exp-role-stack">
                      <span className="contact-role">Creative Digital Designer</span>
                      <span className="contact-location">Lviv, Ukraine</span>
                    </div>
                  </div>
                  <a
                    href="mailto:hello@liubie.com"
                    className="email-link"
                    onClick={e => e.stopPropagation()}
                  >
                    Email me
                  </a>
                </div>

                <p
                  className="contact-bio"
                  data-split="heading"
                  data-split-manual
                  data-split-delay="0.5"
                >
                  Curious mind. Sharp thinking. A constant urge to question how things work
                  and rebuild them better. Complex ideas turned into clear structures and
                  bold digital interfaces that actually serve a purpose.
                  <br /><br />
                  A design approach driven by clarity, systems thinking, and visual impact
                  — where aesthetics support function and every element earns its place.
                </p>
              </div>

              <div className="contact-exp-portrait">
                {hasCustomPanelImage ? (
                  <img
                    src={CUSTOM_PANEL_IMAGE_URL}
                    alt=""
                    className="contact-exp-portrait-main"
                    onError={handleCustomPanelImageError}
                  />
                ) : (
                  <>
                    <img src={PORTRAIT_URL} alt="" className="contact-exp-portrait-color" />
                    <img src={PORTRAIT_BW_URL} alt="" className="contact-exp-portrait-bw" />
                  </>
                )}
              </div>
            </div>

            <button
              className="contact-close-btn"
              onClick={e => { e.stopPropagation(); closeContact() }}
              aria-label="Close contact panel"
              data-contact-toggle="close"
            />
          </div>
        </div>

        <nav className="social-links" aria-label="Social links">
          {[
            { label: 'LD', href: '#linkedin' },
            { label: 'IG', href: '#instagram' },
            { label: 'DR', href: '#dribbble' },
          ].map(({ label, href }, i) => (
            <a
              key={label}
              href={href}
              className="social-link"
              ref={(el) => { socialRefs.current[i] = el }}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="disciplines-ticker" aria-label="Disciplines">
          <div className="ticker-track">
            <span className="disc-text">{TICKER_TEXT}</span>
            <span className="disc-text">{TICKER_TEXT}</span>
          </div>
        </div>
      </div>
    </>
  )
}
