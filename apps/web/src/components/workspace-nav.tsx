"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/app", label: "Projects", match: (path: string) => path === "/app" || /^\/app\/projects\/.+/.test(path) },
];

export function WorkspaceNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 text-xs text-muted-foreground md:gap-5" aria-label="Workspace navigation">
      {links.map((link) => {
        const active = link.match(pathname);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex min-h-11 cursor-pointer items-center rounded-md px-2 transition-[color,transform] duration-180 ease-spring hover:-translate-y-px hover:text-foreground md:px-0 ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
