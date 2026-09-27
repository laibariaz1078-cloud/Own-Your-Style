"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Send } from "lucide-react";
import { showModal } from "../lib/modal";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

const supportLinks = [
  "111 Bijoy sarani, Dhaka,",
  "DH 1515, Bangladesh.",
];

const accountLinks = [
  { label: "My Account", href: "/account" },
  { label: "Login / Register", href: "/login" },
  { label: "Cart", href: "/cart" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Shop", href: "/shop" },
];

const quickLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms Of Use", href: "/terms" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (email) {
      await showModal({ variant: "success", title: "Subscribed", message: `Subscribed successfully with: ${email}` });
      setEmail("");
    }
  };

  return (
    <footer className="w-full bg-black text-white">
      <div className="mx-auto md:mx-7 lg:mx-auto max-w-6xl py-20 lg:px-3">
        <div className="mx-5 md:mx-0 grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          
          {/* Column 1: Exclusive Subscribe */}
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-bold tracking-wide">Exclusive</h3>
            <h4 className="text-xl font-medium">Subscribe</h4>
            <p className="text-base text-[#FAFAFA]">Get 10% off your first order</p>
            <form
              onSubmit={handleSubscribe}
              className="mt-1 flex items-center rounded border-2 border-white bg-transparent px-4 py-3"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full bg-transparent text-base text-white outline-none placeholder:text-gray-500"
              />
              <button
                type="submit"
                aria-label="Subscribe email"
                className="ml-2 text-white transition-opacity hover:opacity-80"
              >
                <Send className="h-5 w-5 shrink-0" />
              </button>
            </form>
          </div>

          {/* Column 2: Support */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xl font-medium">Support</h4>
            <div className="flex flex-col gap-1 text-base text-[#FAFAFA]">
              {supportLinks.map((line) => (
                <p key={line} className="leading-relaxed">
                  {line}
                </p>
              ))}
              <a
                href="mailto:exclusive@gmail.com"
                className="transition-opacity hover:opacity-80"
              >
                exclusive@gmail.com
              </a>
              <a
                href="tel:+88015888889999"
                className="transition-opacity hover:opacity-80"
              >
                +88015-88888-9999
              </a>
            </div>
          </div>

          {/* Column 3: Account */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xl font-medium">Account</h4>
            <div className="flex flex-col gap-1 text-base text-[#FAFAFA]">
              {accountLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="w-fit transition-opacity hover:opacity-80"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 4: Quick Link */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xl font-medium">Quick Link</h4>
            <div className="flex flex-col gap-1 text-base text-[#FAFAFA]">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="w-fit transition-opacity hover:opacity-80"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 5: Download App */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xl font-medium">Download App</h4>
            <p className="text-xs font-medium text-gray-400">
              Save $3 with App New User Only
            </p>

            {/* QR Code + Store Badges Grid */}
            <div className="flex items-center gap-3">
              {/* QR Code */}
              <div className="relative h-20 w-20 shrink-0 bg-white p-1">
                <Image
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://example.com"
                  alt="QR Code"
                  fill
                  sizes="80px"
                  unoptimized
                  className="object-contain"
                />
              </div>

              {/* Store Buttons */}
              <div className="flex flex-col gap-2">
                <a
                  href="https://play.google.com/store"
                  target="_blank"
                  rel="noreferrer"
                  className="relative h-9 w-[110px]"
                >
                  <Image
                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                    alt="Get it on Google Play"
                    fill
                    sizes="110px"
                    unoptimized
                    className="object-contain"
                  />
                </a>
                <a
                  href="https://www.apple.com/app-store/"
                  target="_blank"
                  rel="noreferrer"
                  className="relative h-9 w-[110px]"
                >
                  <Image
                    src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                    alt="Download on the App Store"
                    fill
                    sizes="110px"
                    unoptimized
                    className="object-contain"
                  />
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-6 pt-2">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="text-white hover:opacity-80">
                <FaFacebookF className="h-5 w-5" />
              </a>
              <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="text-white hover:opacity-80">
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-white hover:opacity-80">
                <FaInstagram className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="text-white hover:opacity-80">
                <FaLinkedinIn className="h-5 w-5" />
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/10 py-4 text-center text-base text-[#363738]/60">
        <p className="text-gray-500">
          &copy; Copyright Rimel 2022. All right reserved
        </p>
      </div>
    </footer>
  );
}