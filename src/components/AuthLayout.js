"use client";

import Image from "next/image";

export default function AuthLayout({ children }) {
  return (
    <main className="flex min-h-195.25 w-full items-center pt-15 pb-35">
      {/* Left side banner flushed to the edge */}
      <div className="relative hidden h-176.5 w-201.25 shrink-0 overflow-hidden bg-[#CBE4E8] lg:block">
        <Image
          src="/SideImage.png"
          alt="Shopping cart and phone illustration"
          fill
          sizes="(max-width: 1024px) 0px, 806px"
          className="object-cover object-center"
        />
      </div>

      {/* Right side form block */}
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-92.75">{children}</div>
      </div>
    </main>
  );
}