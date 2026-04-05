import UnicornScene from 'unicornstudio-react'

export default function HeroBackground() {
  return (
    <div className="unicorn-bg" aria-hidden="true">
      <UnicornScene
        projectId="aJOPkPvEYQunmpCDDDaK"
        className="unicorn-bg-scene"
        width="100vw"
        height="100vh"
        scale={1}
        dpi={1.5}
        sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@2.1.6/dist/unicornStudio.umd.js"
      />
    </div>
  )
}
