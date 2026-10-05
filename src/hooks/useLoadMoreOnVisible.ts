import { useEffect, useEffectEvent, useRef } from 'react';

export default function useLoadMoreOnVisible<T extends Element>(
  loadMore: () => void,
  active: boolean
) {
  const ref = useRef<T>(null);
  const onVisible = useEffectEvent(loadMore);

  useEffect(() => {
    const target = ref.current;

    if (!target || !active) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        onVisible();
      }
    });

    observer.observe(target);

    return () => observer.disconnect();
  }, [active]);

  return ref;
}
