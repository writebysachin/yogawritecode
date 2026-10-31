"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const words = ["Yoga", "Write", "Code"] as const;

const letterGroups = words.map((word, wordIndex) => {
  const startIndex = words
    .slice(0, wordIndex)
    .reduce((total, previousWord) => total + previousWord.length, 0);

  return word.split("").map((letter, index) => ({
    letter,
    key: `${wordIndex}-${index}`,
    delay: (startIndex + index) * 0.055,
  }));
});

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
          className="flex w-full items-baseline justify-between whitespace-nowrap font-heading text-[clamp(2.25rem,11vw,10rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.05em] text-ink"
        >
          {letterGroups.map((letters, wordIndex) => (
            <span key={wordIndex} className="inline-flex">
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
          ))}
        </span>
      </Link>
    </div>
  );
}
