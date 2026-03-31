import { useEffect, useRef, useState } from 'react'
import HeroBackground from './HeroBackground.jsx'
import {
  useScrambleOnLoad,
  useScrambleArrayOnVisible,
  useScrambleOnHover,
  useScrambleHoverArray,
} from './hooks/useScramble.js'

// Portrait assets — valid ~7 days from Figma export
const PORTRAIT_URL    = 'https://www.figma.com/api/mcp/asset/443e1956-8c50-4dba-a804-37dfe6958ae1'
const PORTRAIT_BW_URL = 'https://www.figma.com/api/mcp/asset/a5c3f19f-b57e-4fbe-963e-2ea3e080426b'

const PROJECTS = [
  { name: 'Co*struc*ive Bio', year: '2022', nda: true },
  { name: 'So*nd OF',         year: '2022', nda: true },
  { name: 'One Day, You',     year: '2023', nda: false },
  { name: 'Oct**le',          year: '2024', nda: true },
  { name: 'Elecctro',         year: '2025', nda: false },
  { name: 'D*oism Sys*ems',   year: '2025', nda: true },
  { name: 'P*P',              year: '2026', nda: true },
]

// Horizontal ticker — two identical copies so translateX(-50%) loops seamlessly.
const TICKER_TEXT = 'UI/UX Designer\u00a0*\u00a0Art-direction\u00a0*\u00a0'

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
    }
    scale()
    window.addEventListener('resize', scale)
    return () => window.removeEventListener('resize', scale)
  }, [])

  // ── Scramble refs ─────────────────────────────────────────
  const heroLine1Ref    = useRef(null)
  const heroLine2Ref    = useRef(null)
  const projectNameRefs = useRef(PROJECTS.map(() => null))
  const socialRefs      = useRef([null, null, null])
  const emailRef        = useRef(null)

  useScrambleOnLoad(heroLine1Ref, { duration: 1.2, speed: 0.85 })
  useScrambleOnLoad(heroLine2Ref, { duration: 1.2, speed: 0.85, delay: 0.1 })

  useScrambleArrayOnVisible(
    projectNameRefs,
    { duration: 1.4, speed: 0.9, delay: 0.5 },
    0.07
  )

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

  // ── Contact card expansion ────────────────────────────────
  // Uses data-contact-status="not-active|active" mirroring the
  // data-navigation-status pattern from the navigation system.
  const [contactExpanded, setContactExpanded] = useState(false)
  const contactCardRef = useRef(null)

  // Both states have explicit CSS widths (221px ↔ 480px) so no inline-style
  // locking is needed — the CSS transition animates directly between them.
  const openContact = () => {
    if (!contactCardRef.current) return
    setContactExpanded(true)
    setCursorVisible(false)
  }

  const closeContact = () => {
    setContactExpanded(false)
  }

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

  // Close on ESC — mirrors data-navigation-toggle="close" pattern
  useEffect(() => {
    if (!contactExpanded) return
    const handler = (e) => {
      if (e.key === 'Escape') closeContact()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [contactExpanded]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Nav-system stagger on expanded inner items ────────────
  // Mirrors: navigationInnerItems.forEach((item, i) => item.style.transitionDelay = `${i * 0.05}s`)
  // Base offset of 0.3s lets the card expand before content fades in.
  useEffect(() => {
    const card = contactCardRef.current
    if (!card) return
    card.querySelectorAll('[data-contact-item]').forEach((el, i) => {
      el.style.transitionDelay = `${0.3 + i * 0.05}s`
    })
  }, []) // set once on mount — delays are static

  // ── Custom expand cursor ──────────────────────────────────
  // Rendered in fixed/screen space outside scale-root so it
  // doesn't inherit the viewport scale transform.
  const [cursorPos, setCursorPos]         = useState({ x: -200, y: -200 })
  const [cursorVisible, setCursorVisible] = useState(false)

  useEffect(() => {
    const handler = (e) => setCursorPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

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

        {/* ── Hero name (top-left, blurred) ── */}
        <h1 className="hero-name">
          <span ref={heroLine1Ref}>LIUBIE</span>
          <br />
          <span ref={heroLine2Ref}>ULYTSKYI</span>
        </h1>

        {/* ── Projects list (centered) ── */}
        <ul className="projects-list" aria-label="Selected works">
          {PROJECTS.map(({ name, year, nda }, i) => (
            <li key={`${name}-${year}`} className="project-row">
              <div className="project-title">
                <span className="bracket">//</span>
                <span
                  className="project-name"
                  ref={(el) => { projectNameRefs.current[i] = el }}
                >
                  {name}{nda ? '\u00a0(NDA)' : ''}
                </span>
              </div>
              <div className="project-year-group">
                <span className="year">{year}</span>
                <span className="bracket-r">\</span>
              </div>
            </li>
          ))}
        </ul>

        {/* ── Role card (overlay on list center) ── */}
        <div className="role-card" aria-hidden="true">
          <span className="plus-deco">+</span>
          <div className="role-inner">
            <div className="role-title-row">
              <span className="bracket">//</span>
              <span className="role-title">Creative Digital Designer</span>
              <span className="bracket-r">\</span>
            </div>
            <p className="award-text">Awwwards Young Jury 25&apos;26</p>
          </div>
          <span className="plus-deco">+</span>
        </div>

        {/* ── Contact card (top-right, expandable) ──────────
            data-contact-status mirrors the data-navigation-status
            pattern from the navigation expansion system.
            Clicking anywhere inside triggers expansion EXCEPT the
            email <a> which stops propagation.                    ── */}
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
              <img src={PORTRAIT_URL} alt="Liubie Ulytskyi" className="contact-photo" />
            </div>
            <div className="contact-info">
              <div className="contact-role-row">
                <span className="plus-sm">+</span>
                <span className="contact-role">Creative Digital<br />Designer</span>
              </div>
              {/* emailRef: hover scramble via useScrambleOnHover */}
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

          {/* ── Expanded view ── */}
          <div
            className="contact-expanded-view"
            aria-hidden={contactExpanded ? 'false' : 'true'}
          >
            <div className="contact-exp-inner">

              <div className="contact-exp-top">

                {/* Header: role + location + email (90px tall, flex-col justify-between) */}
                <div className="contact-exp-header" data-contact-item>
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

                {/* Bio text — PP Editorial Ultralight */}
                <p className="contact-bio" data-contact-item>
                  Curious mind. Sharp thinking. A constant urge to question how things work
                  and rebuild them better. Complex ideas turned into clear structures and
                  bold digital interfaces that actually serve a purpose.
                  <br /><br />
                  A design approach driven by clarity, systems thinking, and visual impact
                  — where aesthetics support function and every element earns its place.
                </p>

              </div>

              {/* Portrait section */}
              <div className="contact-exp-portrait" data-contact-item>
                <img src={PORTRAIT_URL}    alt="" className="contact-exp-portrait-color" />
                <img src={PORTRAIT_BW_URL} alt="" className="contact-exp-portrait-bw"    />
              </div>

            </div>

            {/* Close button — data-contact-toggle="close" mirrors nav pattern */}
            <button
              className="contact-close-btn"
              onClick={e => { e.stopPropagation(); closeContact() }}
              aria-label="Close contact panel"
              data-contact-toggle="close"
            />

          </div>
        </div>

        {/* ── Social links (bottom-left) ── */}
        <nav className="social-links" aria-label="Social links">
          {[
            { label: 'LD', href: '#linkedin'  },
            { label: 'IG', href: '#instagram' },
            { label: 'DR', href: '#dribbble'  },
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

        {/* ── Go rage indicator (bottom-center) ── */}
        <div className="go-rage">
          <div className="go-rage-dot-wrap">
            <div className="go-rage-dot" />
          </div>
          <span className="go-rage-text">go rage</span>
        </div>

        {/* ── Disciplines horizontal ticker (bottom-right) ── */}
        <div className="disciplines-ticker" aria-label="Disciplines">
          <div className="ticker-track">
            <span className="disc-text">{TICKER_TEXT}</span>
            <span className="disc-text">{TICKER_TEXT}</span>
          </div>
        </div>

        {/* ── Center-left plus decoration ── */}
        <span className="plus-center-left" aria-hidden="true">+</span>

      </div>
    </>
  )
}
