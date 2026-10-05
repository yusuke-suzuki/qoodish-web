import { useEffect, useEffectEvent, useRef } from 'react';

export default function useLoadMoreOnVisible<T extends Element>(
  loadMore: () => void,
  active: boolean,
  progress: string | number | null
) {
  const ref = useRef<T>(null);
  const triedAt = useRef<{ progress: string | number | null } | null>(null);
  const onVisible = useEffectEvent(loadMore);

  useEffect(() => {
    const target = ref.current;

    if (!target || !active || triedAt.current?.progress === progress) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        triedAt.current = { progress };
        onVisible();
      }
    });

    observer.observe(target);

    return () => observer.disconnect();
  }, [active, progress]);

  return ref;
}
