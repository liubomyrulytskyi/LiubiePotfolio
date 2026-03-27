import { useEffect, useRef } from 'react'
import HeroBackground from './HeroBackground.jsx'

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
  const containerRef = useRef(null)

  // Scale the fixed 1440×900 canvas to fill the viewport
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

  return (
    <>
      {/* ── Scene background — lives outside scale-root so it fills the true viewport ── */}
      <HeroBackground />

    <div ref={containerRef} className="scale-root">

      {/* ── Hero name (top-left, blurred) ── */}
      <h1 className="hero-name">
        LIUBIE
        <br />
        ULYTSKYI
      </h1>

      {/* ── Projects list (centered) ── */}
      <ul className="projects-list" aria-label="Selected works">
        {PROJECTS.map(({ name, year, nda }) => (
          <li key={`${name}-${year}`} className="project-row">
            <div className="project-title">
              <span className="bracket">//</span>
              <span className="project-name">
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
          <a href="mailto:hello@liubie.com" className="email-link">
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
        ].map(({ label, href }) => (
          <a key={label} href={href} className="social-link">
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
