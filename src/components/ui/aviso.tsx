import * as React from "react";
import { cn } from "@/lib/utils";

type Tono = "info" | "error" | "exito" | "pendiente";

const tonos: Record<Tono, string> = {
  info: "border-[var(--color-borde)] bg-white text-[var(--color-tinta)]",
  error:
    "border-red-200 bg-[var(--color-alerta-suave)] text-[var(--color-alerta)]",
  exito:
    "border-green-200 bg-[var(--color-exito-suave)] text-[var(--color-exito)]",
  pendiente:
    "border-amber-200 bg-[var(--color-aviso-suave)] text-[var(--color-aviso)]",
};

export function Aviso({
  tono = "info",
  titulo,
  children,
  className,
}: {
  tono?: Tono;
  titulo?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 text-sm leading-relaxed",
        tonos[tono],
        className,
      )}
      role={tono === "error" ? "alert" : undefined}
    >
      {titulo && <p className="font-semibold">{titulo}</p>}
      {children}
    </div>
  );
}
