"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  {
    heading: "Manage My Account",
    items: [
      { label: "My Profile", href: "/account" },
      { label: "Address Book", href: "/account/address" },
      { label: "My Payment Options", href: "/account/payment" },
    ],
  },
  {
    heading: "My Orders",
    items: [
      { label: "My Returns", href: "/account/returns" },
      { label: "My Cancellations", href: "/account/cancellations" },
    ],
  },
  {
    heading: "My WishList",
    items: [],
    href: "/wishlist",
  },
];

export default function AccountSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex w-64 shrink-0 flex-col gap-6">
      {sections.map((section) => (
        <div key={section.heading} className="flex flex-col gap-3">
          {section.href ? (
            <Link
              href={section.href}
              className={`text-base font-medium transition-colors ${
                pathname === section.href ? "text-[#DB4444]" : "text-black hover:text-[#DB4444]"
              }`}
            >
              {section.heading}
            </Link>
          ) : (
            <h4 className="text-base font-medium text-black">{section.heading}</h4>
          )}

          {section.items.length > 0 && (
            <div className="flex flex-col gap-2 pl-9">
              {section.items.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-left text-base font-normal transition-colors ${
                      isActive ? "text-[#DB4444]" : "text-black/50 hover:text-black"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}