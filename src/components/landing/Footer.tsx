import React from "react";
import Link from "next/link";

const LINKS: { heading: string; items: { label: string; href: string }[] }[] = [
  {
    heading: "Product",
    items: [
      { label: "Console", href: "/dashboard" },
      { label: "Pricing", href: "/pricing" },
      { label: "Simulation", href: "/dashboard" },
    ],
  },
  {
    heading: "Frameworks",
    items: [
      { label: "Opportunity Trees", href: "/dashboard" },
      { label: "The Mom Test", href: "/dashboard" },
      { label: "DVF-U Risk", href: "/dashboard" },
    ],
  },
  {
    heading: "Account",
    items: [
      { label: "Sign in", href: "/auth/signin" },
      { label: "Register", href: "/auth/register" },
      { label: "Profile", href: "/profile" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-12">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="text-lg font-bold tracking-tighter text-white"
            >
              Blueprint.AI
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-500">
              Turn vague ideas into structured, de-risked execution plans.
            </p>
          </div>

          {LINKS.map((col) => (
            <div key={col.heading}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                {col.heading}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-neutral-500 transition-colors hover:text-neutral-200"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} Blueprint.AI. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-mono tracking-tight">Engine ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
