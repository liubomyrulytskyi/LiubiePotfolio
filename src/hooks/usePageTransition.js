import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { triggerTransitionAnimation } from '../lib/transitionAnimation'
import { devLog } from '../lib/debug.js'

export function usePageTransition() {
  const location = useLocation()
  const isFirstLoad = useRef(true)

  useEffect(() => {
    // Skip transition on initial load
    if (isFirstLoad.current) {
      isFirstLoad.current = false
      devLog('📄 Initial page load - skipping transition')
      return
    }

    // Trigger transition animation only when navigating between pages
    devLog('🔄 Route changed to:', location.pathname)
    triggerTransitionAnimation().catch(err => {
      console.warn('Transition animation error:', err)
    })
  }, [location.pathname])
}
