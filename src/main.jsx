import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import Preloader from './components/Preloader.jsx'
import { triggerTransitionAnimation } from './lib/transitionAnimation.js'
import { devLog } from './lib/debug.js'
import './index.css'

function Root() {
  const [preloaderComplete, setPreloaderComplete] = useState(false)
  const [hidePreloader, setHidePreloader] = useState(false)
  const transitionStarted = useRef(false)

  useEffect(() => {
    if (!preloaderComplete || transitionStarted.current) return

    transitionStarted.current = true
    devLog('🎬 Preloader done, starting transition...')

    const onTransitionCover = () => {
      devLog('📍 Screen covered: hiding preloader')
      setHidePreloader(true)
    }

    triggerTransitionAnimation({ onCoverComplete: onTransitionCover })
      .then(() => {
        devLog('✅ Transition complete')
      })
      .catch(err => {
        console.warn('Transition error:', err)
        setHidePreloader(true)
      })

    return undefined
  }, [preloaderComplete])

  return (
    <>
      {!hidePreloader && (
        <Preloader onComplete={() => {
          devLog('✅ Preloader progress complete')
          setPreloaderComplete(true)
        }} />
      )}
      {hidePreloader && (
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )}
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
