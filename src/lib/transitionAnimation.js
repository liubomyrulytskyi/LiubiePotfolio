import gsap from 'gsap'
import { devLog } from './debug.js'

export function triggerTransitionAnimation({ onCoverComplete } = {}) {
  return new Promise((resolve, reject) => {
    const transitionWrap = document.querySelector("[data-transition-wrap]");
    if (!transitionWrap) {
      console.warn('❌ Transition wrap not found');
      reject('No transition wrap');
      return;
    }
    
    const transitionColumns = transitionWrap.querySelectorAll("[data-transition-column]");
    if (!transitionColumns.length) {
      console.warn('❌ No transition columns found');
      reject('No transition columns');
      return;
    }

    devLog('🎬 Transition animation starting...');
    
    const tl = gsap.timeline({
      onComplete: () => {
        devLog('✅ Transition animation complete');
        resolve();
      }
    });

    // Panels slide DOWN to cover the screen
    tl.fromTo(transitionColumns, {
      yPercent: 0
    }, {
      yPercent: 100,
      duration: 0.6,
      stagger: {
        each: 0.06,
        from: "end"
      },
      onStart: () => devLog('📍 Panels sliding down to cover...'),
    }, 0);

    // Notify once the screen is fully covered so the preloader can be removed before reveal
    tl.call(() => {
      devLog('📍 Transition cover complete');
      if (typeof onCoverComplete === 'function') {
        onCoverComplete()
      }
    }, null, '+=0.6');

    // Pause briefly while panels cover everything
    tl.to({}, {}, 0.2, '+=0.6');

    // Panels slide UP to reveal the page
    tl.to(transitionColumns, {
      yPercent: 200,
      duration: 0.6,
      stagger: 0.06,
      onStart: () => devLog('📍 Panels sliding up to reveal...'),
    }, "+=0.2");
  });
}
