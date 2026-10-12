"use client";

import { useEffect, useState } from "react";

function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function Greeting({ name }: { name: string }) {
  // Server renders UTC hour; browser corrects to local time after mount.
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    setGreeting(greetingFor(new Date().getHours()));
  }, []);

  return (
    <h1 className="font-sans text-3xl font-semibold tracking-tight text-ink">
      {greeting}, {name}
    </h1>
  );
}
