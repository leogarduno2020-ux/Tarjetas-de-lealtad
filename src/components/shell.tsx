"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface ItemNav {
  href: string;
  etiqueta: string;
}

/**
 * Armazón de los paneles.
 *
 * En móvil la navegación es una tira horizontal deslizable bajo el
 * encabezado; a partir de `lg` se convierte en barra lateral fija.
 * Ocho secciones no caben en una barra inferior sin volverse ilegibles.
 */
export function Shell({
  titulo,
  subtitulo,
  items,
  cambiarNegocio,
  acciones,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  items: ItemNav[];
  cambiarNegocio?: React.ReactNode;
  acciones?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const estaActivo = (href: string) =>
    pathname === href ||
    // El índice del panel no debe encenderse en todas sus subrutas.
    (href !== "/panel" && href !== "/admin" && pathname.startsWith(`${href}/`));

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-[var(--color-borde)] bg-[var(--color-superficie)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate font-semibold leading-tight">{titulo}</p>
            {subtitulo && (
              <p className="truncate text-xs text-[var(--color-tinta-suave)]">
                {subtitulo}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {cambiarNegocio}
            {acciones}
          </div>
        </div>

        <nav
          aria-label="Secciones"
          className="mx-auto max-w-6xl overflow-x-auto px-2 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <ul className="flex w-max gap-1 pb-2">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={estaActivo(item.href) ? "page" : undefined}
                  className={cn(
                    "block rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                    estaActivo(item.href)
                      ? "bg-[var(--color-marca)] text-white"
                      : "text-[var(--color-tinta-suave)] hover:bg-[var(--color-fondo)]",
                  )}
                >
                  {item.etiqueta}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-5 lg:py-8">
        <nav
          aria-label="Secciones"
          className="hidden w-56 shrink-0 lg:block"
        >
          <ul className="sticky top-24 space-y-0.5">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={estaActivo(item.href) ? "page" : undefined}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    estaActivo(item.href)
                      ? "bg-[var(--color-marca-suave)] text-[var(--color-marca-oscuro)]"
                      : "text-[var(--color-tinta-suave)] hover:bg-[var(--color-superficie)] hover:text-[var(--color-tinta)]",
                  )}
                >
                  {item.etiqueta}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
