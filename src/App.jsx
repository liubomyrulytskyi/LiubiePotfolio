import { useEffect, useRef } from 'react'
import HeroBackground from './HeroBackground.jsx'
import {
  useScrambleOnLoad,
  useScrambleArrayOnVisible,
  useScrambleOnHover,
  useScrambleHoverArray,
} from './hooks/useScramble.js'

// Asset from Figma (valid ~7 days from design export)
const PORTRAIT_URL =
  'https://www.figma.com/api/mcp/asset/443e1956-8c50-4dba-a804-37dfe6958ae1'

const PROJECTS = [
  { name: 'Co*struc*ive Bio', year: '2022', nda: true },
  { name: 'So*nd OF',         year: '2022', nda: true },
  { name: 'One Day, You',     year: '2023', nda: false },
  { name: 'Oct**le',          year: '2024', nda: true },
  { name: 'Elecctro',         year: '2025', nda: false },
  { name: 'D*oism Sys*ems',   year: '2025', nda: true },
  { name: 'P*P',              year: '2026', nda: true },
]

// Ticker items repeated enough for a seamless infinite loop.
// We render 2× the set and animate translateY(-50%).
const DISCIPLINES = ['UI/UX', 'Art-Direction', 'Motion']
const TICKER_ROWS = Array.from({ length: 24 }, (_, i) => DISCIPLINES[i % DISCIPLINES.length])

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
  const heroLine1Ref    = useRef(null)   // "LIUBIE"
  const heroLine2Ref    = useRef(null)   // "ULYTSKYI"
  const projectNameRefs = useRef(PROJECTS.map(() => null))
  const socialRefs      = useRef([null, null, null])
  const emailRef        = useRef(null)

  // ── Scramble on load — hero heading ──────────────────────
  useScrambleOnLoad(heroLine1Ref, { duration: 1.2, speed: 0.85 })
  useScrambleOnLoad(heroLine2Ref, { duration: 1.2, speed: 0.85, delay: 0.1 })

  // ── Scramble on visible — project names (staggered) ──────
  // Base delay of 0.5 s lets the hero finish first; each row
  // adds 0.07 s to create a clean cascade.
  useScrambleArrayOnVisible(
    projectNameRefs,
    { duration: 1.4, speed: 0.9, delay: 0.5 },
    0.07
  )

  // ── Scramble on hover — social links + email ─────────────
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

  return (
    <>
      {/* ── Scene background — lives outside scale-root so it fills the true viewport ── */}
      <HeroBackground />

      <div ref={containerRef} className="scale-root">

        {/* ── Hero name (top-left, blurred) ─────────────────
            Each line wrapped in a span so scramble can set
            textContent without destroying the <br> between them. */}
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
                {/* ref callback populates the pre-allocated array slot */}
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

        {/* ── Contact card (top-right) ── */}
        <div className="contact-card">
          <div className="contact-photo-wrap">
            <img
              src={PORTRAIT_URL}
              alt="Liubie Ulytskyi"
              className="contact-photo"
            />
          </div>
          <div className="contact-info">
            <div className="contact-role-row">
              <span className="plus-sm">+</span>
              <span className="contact-role">Creative Digital Designer</span>
            </div>
            {/* email-link: hover scramble via emailRef */}
            <a href="mailto:hello@liubie.com" className="email-link" ref={emailRef}>
              Email me
            </a>
          </div>
        </div>

        {/* ── Social links (bottom-left, mix-blend-difference) ── */}
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

        {/* ── Go rage indicator (bottom-center) ── */}
        <div className="go-rage">
          <div className="go-rage-dot-wrap">
            <div className="go-rage-dot" />
          </div>
          <span className="go-rage-text">go rage</span>
        </div>

        {/* ── Disciplines vertical ticker (bottom-right) ── */}
        <div className="disciplines-ticker" aria-label="Disciplines">
          <div className="ticker-track">
            {TICKER_ROWS.map((item, i) => (
              <div key={i} className="ticker-item">
                <span className="disc-text">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Center-left plus decoration ── */}
        <span className="plus-center-left" aria-hidden="true">+</span>

      </div>
    </>
  )
}
