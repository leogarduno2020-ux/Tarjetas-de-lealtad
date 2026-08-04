import * as React from "react";
import { cn } from "@/lib/utils";

export function Tarjeta({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-tarjeta)] border border-[var(--color-borde)] bg-[var(--color-superficie)]",
        className,
      )}
      {...props}
    />
  );
}

export function TarjetaEncabezado({
  titulo,
  descripcion,
  accion,
}: {
  titulo: string;
  descripcion?: string;
  accion?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[var(--color-borde)] px-4 py-3.5 sm:px-5">
      <div className="min-w-0">
        <h2 className="text-base font-semibold">{titulo}</h2>
        {descripcion && (
          <p className="mt-0.5 text-sm text-[var(--color-tinta-suave)]">
            {descripcion}
          </p>
        )}
      </div>
      {accion}
    </div>
  );
}

export function TarjetaCuerpo({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4 py-4 sm:px-5", className)} {...props} />;
}

type Tono = "neutro" | "exito" | "alerta" | "aviso" | "marca";

const tonos: Record<Tono, string> = {
  neutro: "bg-zinc-100 text-zinc-700",
  exito: "bg-[var(--color-exito-suave)] text-[var(--color-exito)]",
  alerta: "bg-[var(--color-alerta-suave)] text-[var(--color-alerta)]",
  aviso: "bg-[var(--color-aviso-suave)] text-[var(--color-aviso)]",
  marca: "bg-[var(--color-marca-suave)] text-[var(--color-marca-oscuro)]",
};

export function Etiqueta({
  tono = "neutro",
  children,
}: {
  tono?: Tono;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tonos[tono],
      )}
    >
      {children}
    </span>
  );
}

/** Bloque para estados vacíos: explica qué falta y qué hacer. */
export function Vacio({
  titulo,
  descripcion,
  accion,
}: {
  titulo: string;
  descripcion: string;
  accion?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <p className="font-medium">{titulo}</p>
      <p className="max-w-sm text-sm text-[var(--color-tinta-suave)]">
        {descripcion}
      </p>
      {accion}
    </div>
  );
}
