"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  /** Shown until the children mount. Should reserve the same space. */
  placeholder: React.ReactNode;
  /** Start loading this far before the element scrolls into view. */
  rootMargin?: string;
  /** Also wait for the browser to be idle, so heavy widgets never compete with first paint. */
  waitForIdle?: boolean;
};

/**
 * Mounts heavy, below-the-fold widgets (map, tweet embeds) only when they are
 * about to be seen. Keeps their JavaScript and images off the critical path.
 */
export default function DeferredMount({
  children,
  placeholder,
  rootMargin = "400px",
  waitForIdle = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [idle, setIdle] = useState(!waitForIdle);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  useEffect(() => {
    if (!waitForIdle) return;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setIdle(true), { timeout: 2500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(() => setIdle(true), 1200);
    return () => window.clearTimeout(t);
  }, [waitForIdle]);

  return (
    <div ref={ref} className="h-full w-full">
      {visible && idle ? children : placeholder}
    </div>
  );
}
