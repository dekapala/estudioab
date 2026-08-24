"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/inicio", label: "Inicio" },
  { href: "/mensajes", label: "Mensajes" },
  { href: "/leads", label: "Folio 01 · Leads" },
  { href: "/tramite", label: "Folio 02 · Trámite" },
  { href: "/cobros", label: "Folio 03 · Cobros" },
  { href: "/panel", label: "Panel" },
];

export function NavTabs() {
  const pathname = usePathname();

  return (
    <nav className="tabbar">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`tab${pathname.startsWith(tab.href) ? " active" : ""}`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
