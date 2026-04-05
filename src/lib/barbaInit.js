import gsap from 'gsap'
import { devLog } from './debug.js'

export function initBarba() {
  if (typeof window.barba === 'undefined') {
    console.warn('⚠️ Barba.js not loaded')
    return
  }

  devLog('🚀 Initializing Barba.js...');

  // Register CustomEase if available (from CDN)
  if (typeof window.GSAPCustomEase !== 'undefined' && !gsap.plugins.get('CustomEase')) {
    gsap.registerPlugin(window.GSAPCustomEase)
    devLog('✅ CustomEase registered');
  }

  // Register ScrollTrigger if available
  if (typeof window.ScrollTrigger !== 'undefined' && !gsap.plugins.get('ScrollTrigger')) {
    gsap.registerPlugin(window.ScrollTrigger);
    devLog('✅ ScrollTrigger registered');
  }

  history.scrollRestoration = "manual";

  let lenis = null;
  let nextPage = document;
  let onceFunctionsInitialized = false;

  const hasLenis = typeof window.Lenis !== "undefined";
  const hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";

  devLog(`📦 Libraries loaded - Lenis: ${hasLenis}, ScrollTrigger: ${hasScrollTrigger}`);

  const rmMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = rmMQ.matches;
  rmMQ.addEventListener?.("change", e => (reducedMotion = e.matches));
  rmMQ.addListener?.(e => (reducedMotion = e.matches));

  const has = (s) => !!nextPage.querySelector(s);

  let staggerDefault = 0.05;
  let durationDefault = 0.6;

  // Create custom ease or use default
  try {
    gsap.parseEase("0.625, 0.05, 0, 1");
    gsap.defaults({ ease: "0.625, 0.05, 0, 1", duration: durationDefault });
  } catch (e) {
    gsap.defaults({ duration: durationDefault });
  }

  // -----------------------------------------
  // FUNCTION REGISTRY
  // -----------------------------------------

  function initOnceFunctions() {
    initLenis();
    if (onceFunctionsInitialized) return;
    onceFunctionsInitialized = true;
  }

  function initBeforeEnterFunctions(next) {
    nextPage = next || document;
  }

  function initAfterEnterFunctions(next) {
    nextPage = next || document;

    if (hasLenis) {
      lenis.resize();
    }

    if (hasScrollTrigger && typeof window.ScrollTrigger !== "undefined") {
      window.ScrollTrigger.refresh();
    }
  }

  // -----------------------------------------
  // PAGE TRANSITIONS
  // -----------------------------------------

  function runPageOnceAnimation(next) {
    const tl = gsap.timeline();

    tl.call(() => {
      resetPage(next);
    }, null, 0);

    return tl;
  }

  function runPageLeaveAnimation(current, next) {
    const transitionWrap = document.querySelector("[data-transition-wrap]");
    if (!transitionWrap) {
      console.warn('⚠️ Transition wrap not found');
      return new Promise(resolve => resolve());
    }
    
    const transitionColumns = transitionWrap.querySelectorAll("[data-transition-column]");
    if (!transitionColumns.length) {
      console.warn('⚠️ No transition columns found');
      return new Promise(resolve => resolve());
    }

    devLog('🎬 Page Leave Animation - Starting transition...');
    
    const tl = gsap.timeline({
      onComplete: () => {
        devLog('✅ Page Leave Animation Complete');
        current.remove();
      }
    });

    if (reducedMotion) {
      return tl.set(current, { autoAlpha: 0 });
    }

    tl.set(next, {
      autoAlpha: 0,
    }, 0);

    tl.fromTo(transitionColumns, {
      yPercent: 0
    }, {
      yPercent: 100,
      duration: 0.6,
      stagger: {
        each: 0.06,
        from: "end"
      },
      onStart: () => devLog('📍 Panels moving down...'),
      onComplete: () => devLog('✅ Panels animation complete')
    }, 0);

    return tl;
  }

  function runPageEnterAnimation(next) {
    const transitionWrap = document.querySelector("[data-transition-wrap]");
    if (!transitionWrap) {
      console.warn('⚠️ Transition wrap not found for enter');
      return new Promise(resolve => resolve());
    }
    
    const transitionColumns = transitionWrap.querySelectorAll("[data-transition-column]");
    if (!transitionColumns.length) {
      console.warn('⚠️ No transition columns found for enter');
      return new Promise(resolve => resolve());
    }

    devLog('🎬 Page Enter Animation - Starting...');

    const tl = gsap.timeline({
      onComplete: () => devLog('✅ Page Enter Animation Complete')
    });

    if (reducedMotion) {
      tl.set(next, { autoAlpha: 1 });
      tl.add("pageReady")
      tl.call(resetPage, [next], "pageReady");
      return new Promise(resolve => tl.call(resolve, null, "pageReady"));
    }

    tl.add("startEnter", 1);

    tl.set(next, {
      autoAlpha: 1,
    }, "startEnter");

    tl.to(transitionColumns, {
      yPercent: 200,
      duration: 0.6,
      stagger: 0.06,
      overwrite: "auto",
      onStart: () => devLog('📍 Panels moving up...'),
      onComplete: () => devLog('✅ Panels animation complete')
    }, "startEnter");

    tl.add("pageReady");
    tl.call(resetPage, [next], "pageReady");

    return new Promise(resolve => {
      tl.call(resolve, null, "pageReady");
    });
  }

  // -----------------------------------------
  // BARBA HOOKS + INIT
  // -----------------------------------------

  barba.hooks.beforeEnter(data => {
    gsap.set(data.next.container, {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
    });

    if (lenis && typeof lenis.stop === "function") {
      lenis.stop();
    }

    initBeforeEnterFunctions(data.next.container);
  });

  barba.hooks.afterLeave(() => {
    if (hasScrollTrigger && typeof window.ScrollTrigger !== "undefined") {
      window.ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    }
  });

  barba.hooks.afterEnter(data => {
    initAfterEnterFunctions(data.next.container);

    if (hasLenis) {
      lenis.resize();
      lenis.start();
    }

    if (hasScrollTrigger && typeof window.ScrollTrigger !== "undefined") {
      window.ScrollTrigger.refresh();
    }
  });

  barba.init({
    debug: false,
    timeout: 7000,
    preventRunning: true,
    transitions: [
      {
        name: "default",
        sync: true,

        async once(data) {
          devLog('🎯 Barba: First load');
          initOnceFunctions();
          return runPageOnceAnimation(data.next.container);
        },

        async leave(data) {
          devLog('👋 Barba: Page leaving');
          return runPageLeaveAnimation(data.current.container, data.next.container);
        },

        async enter(data) {
          devLog('👋 Barba: Page entering');
          return runPageEnterAnimation(data.next.container);
        }
      }
    ],
  });

  devLog('✅ Barba.js successfully initialized');

  // -----------------------------------------
  // GENERIC + HELPERS
  // -----------------------------------------

  function initLenis() {
    if (lenis) return;
    if (!hasLenis) return;

    lenis = new Lenis({
      lerp: 0.165,
      wheelMultiplier: 1.25,
    });

    if (hasScrollTrigger && typeof window.ScrollTrigger !== "undefined") {
      lenis.on("scroll", window.ScrollTrigger.update);
    }

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  function resetPage(container) {
    window.scrollTo(0, 0);
    gsap.set(container, { clearProps: "position,top,left,right" });

    if (hasLenis) {
      lenis.resize();
      lenis.start();
    }
  }

  function debounceOnWidthChange(fn, ms) {
    let last = innerWidth,
      timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (innerWidth !== last) {
          last = innerWidth;
          fn.apply(this, args);
        }
      }, ms);
    };
  }

  function initBarbaNavUpdate(data) {
    var tpl = document.createElement('template');
    tpl.innerHTML = data.next.html.trim();
    var nextNodes = tpl.content.querySelectorAll('[data-barba-update]');
    var currentNodes = document.querySelectorAll('nav [data-barba-update]');

    currentNodes.forEach(function (curr, index) {
      var next = nextNodes[index];
      if (!next) return;

      var newStatus = next.getAttribute('aria-current');
      if (newStatus !== null) {
        curr.setAttribute('aria-current', newStatus);
      } else {
        curr.removeAttribute('aria-current');
      }

      var newClassList = next.getAttribute('class') || '';
      curr.setAttribute('class', newClassList);
    });
  }
}
