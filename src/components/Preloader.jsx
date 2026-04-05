import { useEffect, useState } from 'react'
import gsap from 'gsap'
import UnicornScene from 'unicornstudio-react'
import { devLog } from '../lib/debug.js'

export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    devLog('🔄 Preloader starting...')
    
    const progressObject = { value: 0 }

    const tl = gsap.to(progressObject, {
      value: 100,
      duration: 3,
      ease: 'none',
      onUpdate: () => {
        setProgress(Math.round(progressObject.value))
      },
      onComplete: () => {
        devLog('✅ Preloader complete')
        onComplete && onComplete()
      }
    })

    return () => {
      tl.kill()
    }
  }, [onComplete])

  return (
    <div className="preloader">
      <div className="unicorn-bg preloader__background" aria-hidden="true">
        <UnicornScene
          className="unicorn-bg-scene"
          jsonFilePath="/preloader-scene.json"
          width="1920px"
          height="1080px"
          scale={1}
          dpi={1.5}
          sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@2.1.6/dist/unicornStudio.umd.js"
        />
      </div>
      <div className="preloader__content">
        <p className="preloader__title">Your experience is Now Loading</p>
        <p className="preloader__subtitle">Get your sh*t ready</p>
      </div>
      <div className="preloader__percentage">
        {progress}
      </div>
    </div>
  )
}
