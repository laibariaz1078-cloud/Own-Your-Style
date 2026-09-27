"use client";

import Image from "next/image";
import { useState } from "react";
import { FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

export default function TeamGrid({ members = [] }) {
  const [activeDot, setActiveDot] = useState(2);

  const defaultMembers = [
    {
      id: 1,
      name: "Tom Cruise",
      role: "Founder & Chairman",
      image: "/pr3.png",
      twitter: "#",
      instagram: "#",
      linkedin: "#",
    },
    {
      id: 2,
      name: "Will Smith",
      role: "Product Designer",
      image: "/pr2.png",
      twitter: "#",
      instagram: "#",
      linkedin: "#",
    },
    {
      id: 3,
      name: "Emma Watson",
      role: "Managing Director",
      image: "/pr1.png",
      twitter: "#",
      instagram: "#",
      linkedin: "#",
    },
  ];

  const list = members.length > 0 ? members : defaultMembers;

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((member) => (
          <div
            key={member.id}
            className="group flex flex-col items-start text-left"
          >
            {/* Image Container with Zoom effect */}
            <div className="relative mb-8 flex h-[430px] w-full items-end justify-center overflow-hidden rounded bg-[#F5F5F5] pt-10">
              <div className="relative h-full w-full">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 370px"
                  className="object-contain object-bottom transition-transform duration-300 ease-in-out group-hover:scale-105"
                />
              </div>
            </div>

            {/* Info (Max font size 2xl) */}
            <h3 className="text-2xl font-medium tracking-wide text-black">
              {member.name}
            </h3>
            <p className="mt-2 text-base text-black">{member.role}</p>

            {/* Social Icons (No hover effect) */}
            <div className="mt-4 flex items-center gap-4 text-black">
              <a href={member.twitter || "#"}>
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href={member.instagram || "#"}>
                <FaInstagram className="h-5 w-5" />
              </a>
              <a href={member.linkedin || "#"}>
                <FaLinkedinIn className="h-5 w-5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="flex items-center justify-center gap-3 pt-4">
        {[0, 1, 2, 3, 4].map((index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActiveDot(index)}
            className={`h-3 w-3 rounded-full transition-all ${
              activeDot === index
                ? "ring-2 ring-black/40 ring-offset-2 bg-[#DB4444]"
                : "bg-black/30 hover:bg-black/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}