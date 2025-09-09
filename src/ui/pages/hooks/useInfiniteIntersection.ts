import { useEffect, useRef } from "react";

export function useInfiniteIntersection(onIntersect) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        onIntersect();
      }
    });
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [onIntersect]);

  return ref;
}
