"use client";

import Image from "next/image";
import Link from "next/link";

// High quality product images URLs
const IMAGES = {
  ps5: "/adspeaker.png",
  women: "/attwoman.png",
  speakers: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
  perfume: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80",
};

export default function NewArrivalGrid() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* PS5 Main Feature Banner (Left Big Card) */}
      <div className="relative flex h-[580px] flex-col justify-end overflow-hidden rounded-md bg-black p-8 text-white sm:p-10">
        <div className="absolute inset-0 flex items-end justify-center">
          <div className="relative h-full w-full">
            <Image
              src={IMAGES.ps5}
              alt="PlayStation 5"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 600px"
              className="object-cover object-center opacity-85 transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Text Overlay */}
        <div className="relative z-10 flex flex-col gap-3">
          <h3 className="text-2xl font-semibold tracking-wider text-white">
            PlayStation 5
          </h3>
          <p className="max-w-[240px] text-xs leading-relaxed text-[#FAFAFA]">
            Black and White version of the PS5 coming out on sale.
          </p>
          <Link
            href="/shop"
            className="w-fit text-base font-medium text-white underline underline-offset-8 transition-opacity hover:opacity-80"
          >
            Shop Now
          </Link>
        </div>
      </div>

      {/* Secondary Grid (Right Side Banners) */}
      <div className="flex flex-col gap-8">
        {/* Women's Collection Banner (Top Wide Card) */}
        <div className="relative flex h-[284px] flex-col justify-end overflow-hidden rounded-md bg-[#0D0D0D] p-6 text-white sm:p-8">
          <div className="absolute right-0 top-0 h-full w-full">
            <Image
              src={IMAGES.women}
              alt="Women's Collections"
              fill
              sizes="(max-width: 1024px) 100vw, 500px"
              className="object-cover object-top opacity-80 transition-transform duration-500 hover:scale-105"
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />

          <div className="relative z-10 flex flex-col gap-2">
            <h3 className="text-2xl font-semibold tracking-wider text-white">
              Women&apos;s Collections
            </h3>
            <p className="max-w-[240px] text-xs text-[#FAFAFA]">
              Featured woman collections that give you another vibe.
            </p>
            <Link
              href="/shop"
              className="w-fit text-base font-medium text-white underline underline-offset-8 transition-opacity hover:opacity-80"
            >
              Shop Now
            </Link>
          </div>
        </div>

        {/* Bottom Split (Speakers & Perfume Cards) */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {/* Speakers Card */}
          <div className="relative flex h-[263px] flex-col justify-end overflow-hidden rounded-md bg-[#0D0D0D] p-6 text-white">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-full w-full">
                <Image
                  src={IMAGES.speakers}
                  alt="Speakers"
                  fill
                  sizes="(max-width: 640px) 100vw, 300px"
                  className="object-cover opacity-75 transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

            <div className="relative z-10 flex flex-col gap-2">
              <h4 className="text-2xl font-semibold tracking-wider text-white">
                Speakers
              </h4>
              <p className="text-xs text-[#FAFAFA]">Amazon wireless speakers</p>
              <Link
                href="/shop"
                className="w-fit text-base font-medium text-white underline underline-offset-8 transition-opacity hover:opacity-80"
              >
                Shop Now
              </Link>
            </div>
          </div>

          {/* Perfume Card */}
          <div className="relative flex h-[263px] flex-col justify-end overflow-hidden rounded-md bg-[#0D0D0D] p-6 text-white">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-full w-full">
                <Image
                  src={IMAGES.perfume}
                  alt="Perfume"
                  fill
                  sizes="(max-width: 640px) 100vw, 300px"
                  className="object-cover opacity-75 transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

            <div className="relative z-10 flex flex-col gap-2">
              <h4 className="text-2xl font-semibold tracking-wider text-white">
                Perfume
              </h4>
              <p className="text-xs text-[#FAFAFA]">GUCCI INTENSE OUD EDP</p>
              <Link
                href="/shop"
                className="w-fit text-base font-medium text-white underline underline-offset-8 transition-opacity hover:opacity-80"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}