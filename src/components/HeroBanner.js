"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Apple, ArrowRight } from "lucide-react";

const slides = [
  {
    eyebrow: "iPhone 14 Series",
    title: "Up to 10%\noff Voucher",
    image: "/heroImg.png",
    hasAppleIcon: true,
  },
  {
    eyebrow: "Smart Accessories",
    title: "Enhance Your\nExperience",
    image: "/heroImg.png",
    hasAppleIcon: false,
  },
];

const shopbtn = () => {
  return (
    <Link
      href="/shop"
    >
  
    </Link>
  );
}

export default function HeroBanner() {
  const [active, setActive] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isHovered]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex h-[364px] w-full flex-col justify-between overflow-hidden bg-black px-10 pt-10 pb-6 text-white sm:px-14 sm:pt-12"
    >
      <div className="flex flex-1 items-center justify-between gap-4">
       
        <div className="z-10 flex flex-col items-start justify-center gap-5">
         
          <div className="flex items-center gap-6">
            {slides[active].hasAppleIcon ? (
              <Apple className="h-10 w-10 text-white fill-white" />
            ) : (
              <span className="h-3 w-3 rounded-full bg-white animate-pulse" />
            )}
            <span className="text-base text-gray-200 tracking-wide font-normal">
              {slides[active].eyebrow}
            </span>
          </div>

          {/* Title */}
          <h1 className="whitespace-pre-line text-4xl font-semibold leading-[1.2] tracking-wider text-white sm:text-5xl">
            {slides[active].title}
          </h1>

          
          <Link
            href="/shop"
            className="group mt-2 inline-flex items-center gap-2 text-base font-medium text-white"
          >
            <span className="border-b border-white pb-1 transition-opacity group-hover:opacity-80">
              Shop Now
            </span>
            <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Right Image Container */}
        <div className="relative hidden h-full w-[300px] shrink-0 sm:block md:w-[400px]">
          <Image
            key={active}
            src={slides[active].image}
            alt="Hero Banner Image"
            fill
            sizes="(max-width: 640px) 0px, 400px"
            className="object-fill object-bottom-right "
            priority
          />
        </div>
      </div>

      {/* Pagination Dots (Exact Replica) */}
      <div className="z-10 flex items-center justify-center gap-3 pt-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setActive(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`transition-all duration-300 ${
              index === active
                ? "h-3.5 w-3.5 rounded-full border-2 border-white bg-[#DB4444] p-[2px]"
                : "h-3 w-3 rounded-full bg-gray-500 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}