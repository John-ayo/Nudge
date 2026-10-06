import { useEffect, useRef, useState } from "react";

/**
 * ScrollReveal wrapper component.
 * Uses IntersectionObserver to trigger animations when the element scrolls into view.
 * 
 * @param {React.ReactNode} children - Elements to animate
 * @param {string} animationClass - Optional custom animation class to apply when visible (defaults to "reveal-visible")
 * @param {string} hiddenClass - Optional custom hidden class (defaults to "reveal-hidden")
 * @param {number} threshold - How much of the element must be visible (0 to 1)
 * @param {number} delay - Animation delay in ms
 * @param {string} className - Optional container className
 */
export default function ScrollReveal({
  children,
  animationClass = "reveal-visible",
  hiddenClass = "reveal-hidden",
  threshold = 0.1,
  delay = 0,
  className = ""
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const currentRef = ref.current;
    
    // Fallback if IntersectionObserver is not supported
    if (!window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Unobserve once visible so animation only plays once per page load
          if (currentRef) observer.unobserve(currentRef);
        }
      },
      { threshold }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`${className} ${isVisible ? animationClass : hiddenClass}`}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: "0.8s",
        transitionProperty: "opacity, transform, filter",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)"
      }}
    >
      {children}
    </div>
  );
}
