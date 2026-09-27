"use client";

import Image from "next/image";
import { useState } from "react";

const defaultImages = [
  "/1.png",
  "/2.png",
  "/3.png",
  "/4.png",
];

export default function ProductGallery({ images, productName = "Havic HV G-92 Gamepad" }) {
  const [active, setActive] = useState(0);

  const galleryImages = Array.isArray(images) && images.length > 0 ? images : defaultImages;

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      {/* Side Thumbnails List */}
      <div className="flex flex-row gap-4 sm:flex-col">
        {galleryImages.map((image, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActive(index)}
            className={`relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded bg-[#F5F5F5] p-2 transition-all sm:h-24 sm:w-28 ${active === index ? "border-2 border-black" : "border border-transparent opacity-80 hover:opacity-100"
              }`}
          >
            <Image
              src={image}
              alt={`${productName} view ${index + 1}`}
              fill
              sizes="112px"
              className="object-contain p-2"
            />
          </button>
        ))}
      </div>

      {/* Main Image  */}
      <div className="relative flex h-[500px] flex-1 min-w-[520px] items-center justify-center overflow-hidden rounded bg-[#F5F5F5] p-8 sm:h-[500px]">
        <div className="relative h-full w-full">
          <Image
            src={galleryImages[active]}
            alt={productName}
            fill
            sizes="100vw"
            priority
            className="object-contain"
          />
        </div>


      </div>
    </div>

  );
}