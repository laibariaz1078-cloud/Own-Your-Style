import Link from "next/link";

export default function Breadcrumb({ items }) {
  return (
    <nav className="page-shell flex items-center gap-2 py-6 text-sm text-gray-500">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={item.label} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-black">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-black" : ""}>{item.label}</span>
            )}
            {!isLast && <span>/</span>}
          </span>
        );
      })}
    </nav>
  );
}