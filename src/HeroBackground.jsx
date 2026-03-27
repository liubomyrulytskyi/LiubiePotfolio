import { useEffect, useRef } from 'react'

const SDK_URL =
  'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@2.1.5/dist/unicornStudio.umd.js'
const PROJECT_ID = 'gCd33Va0gggsJRUEDN4W'
const ELEMENT_ID  = 'unicorn-hero-bg'

/**
 * Loads the Unicorn Studio SDK directly and mounts the scene onto the
 * .unicorn-bg container — the same element the browser targets for mouse
 * events. This matches the official embed approach and keeps the SDK's
 * mouse-coordinate math in sync with the actual hit-test target.
 */
export default function HeroBackground() {
  const containerRef = useRef(null)
  const sceneRef     = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.id = ELEMENT_ID

    const init = () => {
      if (!window.UnicornStudio?.addScene) return
      window.UnicornStudio.addScene({
        elementId:  ELEMENT_ID,
        projectId:  PROJECT_ID,
        scale:      1,
        dpi:        1.5,
        production: true,
        lazyLoad:   false,
      })
        .then((scene) => { sceneRef.current = scene })
        .catch(console.error)
    }

    const existing = document.querySelector(`script[src="${SDK_URL}"]`)

    if (existing) {
      // Script already in DOM — fire immediately if SDK is ready, else wait.
      window.UnicornStudio?.addScene ? init() : existing.addEventListener('load', init)
    } else {
      const script   = document.createElement('script')
      script.src     = SDK_URL
      script.async   = true
      script.onload  = init
      document.head.appendChild(script)
    }

    return () => {
      sceneRef.current?.destroy?.()
      sceneRef.current = null
    }
  }, [])

  return <div ref={containerRef} className="unicorn-bg" />
}
