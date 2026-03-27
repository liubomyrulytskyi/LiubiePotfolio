import UnicornScene from 'unicornstudio-react'

/**
 * Full-viewport Unicorn Studio background.
 * Rendered outside the scaled content layer so it fills the true
 * viewport size regardless of how the content canvas is scaled.
 */
export default function HeroBackground() {
  return (
    <div className="unicorn-bg">
      <UnicornScene
        projectId="gCd33Va0gggsJRUEDN4W"
        scale={1}
        dpi={1.5}
        sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@2.1.5/dist/unicornStudio.umd.js"
      />
    </div>
  )
}
