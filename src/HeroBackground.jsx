import UnicornScene from 'unicornstudio-react'

export default function HeroBackground() {
  return (
    <div className="unicorn-bg" aria-hidden="true">
      <UnicornScene
        projectId="aJOPkPvEYQunmpCDDDaK"
        width="1440px"
        height="900px"
        scale={1}
        dpi={1.5}
        sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@2.1.6/dist/unicornStudio.umd.js"
      />
    </div>
  )
}
