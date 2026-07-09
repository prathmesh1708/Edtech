/* =============================================
   Study Wisely — useScrollAnimation Hook
   ============================================= */
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Pre-built ScrollTrigger animations.
 * Attach the returned ref to the container element.
 *
 * @param {string} animation - Animation type: 'fadeUp' | 'fadeDown' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'stagger'
 * @param {Object} options - Animation options
 */
export const useScrollAnimation = (animation = 'fadeUp', options = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion || !ref.current) return;

    const {
      duration = 0.8,
      delay = 0,
      stagger = 0.12,
      start = 'top 85%',
      end = 'bottom 20%',
      toggleActions = 'play none none none',
      markers = false,
    } = options;

    const el = ref.current;
    let tween;

    const scrollConfig = {
      trigger: el,
      start,
      end,
      toggleActions,
      markers,
    };

    switch (animation) {
      case 'fadeUp':
        tween = gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration, delay, ease: 'power3.out', scrollTrigger: scrollConfig }
        );
        break;

      case 'fadeDown':
        tween = gsap.fromTo(
          el,
          { opacity: 0, y: -30 },
          { opacity: 1, y: 0, duration, delay, ease: 'power3.out', scrollTrigger: scrollConfig }
        );
        break;

      case 'slideLeft':
        tween = gsap.fromTo(
          el,
          { opacity: 0, x: -50 },
          { opacity: 1, x: 0, duration, delay, ease: 'power3.out', scrollTrigger: scrollConfig }
        );
        break;

      case 'slideRight':
        tween = gsap.fromTo(
          el,
          { opacity: 0, x: 50 },
          { opacity: 1, x: 0, duration, delay, ease: 'power3.out', scrollTrigger: scrollConfig }
        );
        break;

      case 'scaleIn':
        tween = gsap.fromTo(
          el,
          { opacity: 0, scale: 0.85 },
          { opacity: 1, scale: 1, duration, delay, ease: 'back.out(1.7)', scrollTrigger: scrollConfig }
        );
        break;

      case 'stagger':
        tween = gsap.fromTo(
          el.children,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration, delay, stagger, ease: 'power3.out', scrollTrigger: scrollConfig }
        );
        break;

      default:
        break;
    }

    return () => {
      if (tween) tween.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === el) trigger.kill();
      });
    };
  }, [animation]);

  return ref;
};

export default useScrollAnimation;
