"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function MusicPromoBanner() {
  const [timeLeft, setTimeLeft] = useState({
    days: "05",
    hours: "23",
    minutes: "59",
    seconds: "35",
  });

  useEffect(() => {
    const target = Date.now() + 5 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000;

    const timer = setInterval(() => {
      const diff = target - Date.now();

      if (diff <= 0) {
        clearInterval(timer);
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft({
        days: String(d).padStart(2, "0"),
        hours: String(h).padStart(2, "0"),
        minutes: String(m).padStart(2, "0"),
        seconds: String(s).padStart(2, "0"),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative flex flex-col md:flex-row  items-center justify-between overflow-hidden rounded-none bg-black px-5 py-10 sm:px-8 sm:py-12 md:flex-row md:px-14 md:py-16 lg:px-20">

      <div className="pointer-events-none absolute right-4 top-1/2 h-[220px] w-[220px] -translate-y-1/2 rounded-full bg-white/10 blur-[70px] sm:h-[300px] sm:w-[300px] sm:blur-[90px] md:right-16 md:h-[350px] md:w-[350px]" />

      <div className="z-10 flex order-2 md:order-1 md:text-nowrap w-full flex-col items-start gap-5 sm:gap-8 md:w-auto">
        <span className="text-sm font-semibold text-[#00FF66] sm:text-base">
          Categories
        </span>

        <h2 className="max-w-md  text-2xl font-semibold leading-[1.2] text-white sm:text-4xl md:text-5xl">
          Enhance Your <br className="hidden sm:inline" /> Music Experience
        </h2>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full bg-white text-black sm:h-14 sm:w-14 md:h-[62px] md:w-[62px]">
            <span className="text-xs font-bold leading-none sm:text-sm md:text-base">{timeLeft.days}</span>
            <span className="text-[9px] font-normal leading-tight sm:text-[10px] md:text-[11px]">Days</span>
          </div>

          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full bg-white text-black sm:h-14 sm:w-14 md:h-[62px] md:w-[62px]">
            <span className="text-xs font-bold leading-none sm:text-sm md:text-base">{timeLeft.hours}</span>
            <span className="text-[9px] font-normal leading-tight sm:text-[10px] md:text-[11px]">Hours</span>
          </div>

          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full bg-white text-black sm:h-14 sm:w-14 md:h-[62px] md:w-[62px]">
            <span className="text-xs font-bold leading-none sm:text-sm md:text-base">{timeLeft.minutes}</span>
            <span className="text-[9px] font-normal leading-tight sm:text-[10px] md:text-[11px]">Minutes</span>
          </div>

          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full bg-white text-black sm:h-14 sm:w-14 md:h-[62px] md:w-[62px]">
            <span className="text-xs font-bold leading-none sm:text-sm md:text-base">{timeLeft.seconds}</span>
            <span className="text-[9px] font-normal leading-tight sm:text-[10px] md:text-[11px]">Seconds</span>
          </div>
        </div>

        <Link
          href="/shop"
          className="w-fit rounded bg-[#00FF66] px-8 py-3 text-sm font-medium text-black transition-transform duration-200 hover:bg-[#00e65c] active:scale-95 sm:px-10 sm:py-4 sm:text-base md:px-12"
        >
          Buy Now
        </Link>
      </div>

      <div className=" relative order-1 z-10 mt-8 h-56 w-full max-w-[320px] shrink-0 sm:h-72 sm:max-w-[420px] md:mt-0 md:h-[330px] md:w-[500px] md:max-w-[500px]">
        <Image
          src="/speaker1.png"
          alt="JBL Boombox Speaker"
          fill
          priority
          sizes="(max-width: 640px) 90vw, (max-width: 768px) 60vw, 500px"
          className="object-contain"
        />
      </div>
    </div>
  );
}