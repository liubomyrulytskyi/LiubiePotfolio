import UnicornScene from 'unicornstudio-react'

// Updated scene — wrapper preserved for position:fixed / z-index layering.
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
