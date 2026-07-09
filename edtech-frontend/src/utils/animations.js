/* =============================================
   Study Wisely — GSAP Animation Presets
   ============================================= */
import { gsap } from 'gsap';

/**
 * Fade in from below with opacity transition
 */
export const fadeInUp = (element, options = {}) => {
  const { delay = 0, duration = 0.8, y = 40, ease = 'power3.out' } = options;
  return gsap.fromTo(
    element,
    { opacity: 0, y },
    { opacity: 1, y: 0, duration, delay, ease }
  );
};

/**
 * Fade in from above
 */
export const fadeInDown = (element, options = {}) => {
  const { delay = 0, duration = 0.8, y = -30, ease = 'power3.out' } = options;
  return gsap.fromTo(
    element,
    { opacity: 0, y },
    { opacity: 1, y: 0, duration, delay, ease }
  );
};

/**
 * Slide in from left
 */
export const slideInLeft = (element, options = {}) => {
  const { delay = 0, duration = 0.8, x = -50, ease = 'power3.out' } = options;
  return gsap.fromTo(
    element,
    { opacity: 0, x },
    { opacity: 1, x: 0, duration, delay, ease }
  );
};

/**
 * Slide in from right
 */
export const slideInRight = (element, options = {}) => {
  const { delay = 0, duration = 0.8, x = 50, ease = 'power3.out' } = options;
  return gsap.fromTo(
    element,
    { opacity: 0, x },
    { opacity: 1, x: 0, duration, delay, ease }
  );
};

/**
 * Scale in with fade
 */
export const scaleIn = (element, options = {}) => {
  const { delay = 0, duration = 0.6, scale = 0.85, ease = 'back.out(1.7)' } = options;
  return gsap.fromTo(
    element,
    { opacity: 0, scale },
    { opacity: 1, scale: 1, duration, delay, ease }
  );
};

/**
 * Stagger reveal for a group of elements
 */
export const staggerReveal = (elements, options = {}) => {
  const {
    delay = 0,
    duration = 0.7,
    stagger = 0.12,
    y = 30,
    ease = 'power3.out',
  } = options;
  return gsap.fromTo(
    elements,
    { opacity: 0, y },
    { opacity: 1, y: 0, duration, delay, stagger, ease }
  );
};

/**
 * Counter animation for numbers
 */
export const counterUp = (element, endValue, options = {}) => {
  const { duration = 2, ease = 'power2.out' } = options;
  const obj = { value: 0 };
  return gsap.to(obj, {
    value: endValue,
    duration,
    ease,
    onUpdate: () => {
      if (element) {
        element.textContent = Math.floor(obj.value).toLocaleString();
      }
    },
  });
};

/**
 * Parallax background effect
 */
export const parallaxBg = (element, options = {}) => {
  const { yPercent = -20 } = options;
  return {
    yPercent,
    ease: 'none',
    scrollTrigger: {
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  };
};

/**
 * Spring bounce animation
 */
export const springBounce = (element, options = {}) => {
  const { scale = 1.05, duration = 0.5 } = options;
  return gsap.to(element, {
    scale,
    duration,
    ease: 'elastic.out(1, 0.3)',
    yoyo: true,
    repeat: 1,
  });
};

/**
 * Text reveal by splitting words
 */
export const textReveal = (element, options = {}) => {
  const { delay = 0, stagger = 0.06, duration = 0.6 } = options;
  if (!element) return;

  const text = element.textContent;
  const words = text.split(' ');
  element.innerHTML = words
    .map((word) => `<span class="word-wrap" style="display:inline-block;overflow:hidden;"><span class="word" style="display:inline-block;transform:translateY(100%);opacity:0;">${word}</span></span>`)
    .join(' ');

  const wordElements = element.querySelectorAll('.word');
  return gsap.to(wordElements, {
    y: 0,
    opacity: 1,
    duration,
    delay,
    stagger,
    ease: 'power3.out',
  });
};

/**
 * Floating animation (continuous)
 */
export const floatAnimation = (element, options = {}) => {
  const { y = -12, duration = 3 } = options;
  return gsap.to(element, {
    y,
    duration,
    ease: 'power1.inOut',
    yoyo: true,
    repeat: -1,
  });
};

/**
 * Magnetic hover effect for buttons/elements
 */
export const magneticHover = (element) => {
  const handleMove = (e) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(element, {
      x: x * 0.2,
      y: y * 0.2,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleLeave = () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)',
    });
  };

  element.addEventListener('mousemove', handleMove);
  element.addEventListener('mouseleave', handleLeave);

  return () => {
    element.removeEventListener('mousemove', handleMove);
    element.removeEventListener('mouseleave', handleLeave);
  };
};
