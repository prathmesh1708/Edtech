/* =============================================
   Study Wisely — useGSAP Hook
   ============================================= */
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

/**
 * Custom hook that wraps GSAP animations with proper cleanup.
 * Uses gsap.context() for automatic cleanup on unmount.
 *
 * @param {Function} animationFn - Function that creates GSAP animations
 * @param {Array} dependencies - Dependency array for re-running animations
 * @returns {React.RefObject} - Ref to attach to the container element
 */
export const useGSAP = (animationFn, dependencies = []) => {
  const containerRef = useRef(null);
  const contextRef = useRef(null);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) return;

    // Create GSAP context scoped to the container
    contextRef.current = gsap.context(() => {
      animationFn(gsap, ScrollTrigger);
    }, containerRef);

    // Cleanup on unmount
    return () => {
      if (contextRef.current) {
        contextRef.current.revert();
      }
    };
  }, dependencies);

  return containerRef;
};

export default useGSAP;
