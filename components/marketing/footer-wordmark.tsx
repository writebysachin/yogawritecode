"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const wordmark = "YogaWriteCode";

const letters = Array.from(wordmark).map((letter, index) => ({
  letter,
  key: index,
  delay: index * 0.055,
}));

export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const frame = requestAnimationFrame(() => setPlaying(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setPlaying(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="mx-auto mt-10 max-w-[1160px] overflow-hidden">
      <Link href="/" aria-label="Yoga Write Code home" className="block">
        <span
          aria-hidden="true"
          className="flex w-full items-baseline justify-between whitespace-nowrap font-heading text-[clamp(1.6rem,8.6vw,8rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.06em] text-ink"
        >
          {letters.map(({ letter, key, delay }) => (
            <span
              key={key}
              className={`inline-block ${
                playing ? "footer-letter-drop" : "translate-y-[-110%] opacity-0"
              }`}
              style={{ animationDelay: `${delay}s` }}
            >
              {letter}
            </span>
          ))}
        </span>
      </Link>
    </div>
  );
}
