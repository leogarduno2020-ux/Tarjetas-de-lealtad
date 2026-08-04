"use client";

import { useTransition } from "react";
import { Select } from "@/components/ui/campo";
import { cambiarNegocioActivo } from "@/app/panel/acciones";

/**
 * Cambia el negocio activo cuando un usuario pertenece a varios.
 * La selección se guarda en cookie, pero el servidor siempre la valida
 * contra las membresías reales antes de usarla.
 */
export function SelectorNegocio({
  membresias,
  activo,
}: {
  membresias: { id: string; nombre: string }[];
  activo: string;
}) {
  const [pendiente, iniciar] = useTransition();

  return (
    <Select
      aria-label="Negocio activo"
      defaultValue={activo}
      disabled={pendiente}
      className="h-9 max-w-40 text-sm"
      onChange={(evento) => {
        const id = evento.target.value;
        iniciar(() => {
          void cambiarNegocioActivo(id);
        });
      }}
    >
      {membresias.map((m) => (
        <option key={m.id} value={m.id}>
          {m.nombre}
        </option>
      ))}
    </Select>
  );
}
