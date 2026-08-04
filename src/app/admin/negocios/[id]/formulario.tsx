"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Campo, Select } from "@/components/ui/campo";
import { Aviso } from "@/components/ui/aviso";
import { Tarjeta, TarjetaCuerpo, TarjetaEncabezado } from "@/components/ui/tarjeta";
import type { BusinessStatus, Plan } from "@/lib/types/database";
import { actualizarNegocio, type EstadoEdicion } from "../acciones";

function BotonGuardar() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando…" : "Guardar cambios"}
    </Button>
  );
}

export function FormularioEdicion({
  businessId,
  plan,
  status,
}: {
  businessId: string;
  plan: Plan;
  status: BusinessStatus;
}) {
  const [estado, accion] = useActionState<EstadoEdicion, FormData>(
    actualizarNegocio,
    {},
  );

  return (
    <Tarjeta>
      <TarjetaEncabezado
        titulo="Plan y estado"
        descripcion="Pausar deja el negocio sin emitir tarjetas nuevas."
      />
      <TarjetaCuerpo>
        <form action={accion} className="space-y-4">
          <input type="hidden" name="businessId" value={businessId} />

          {estado.error && <Aviso tono="error">{estado.error}</Aviso>}
          {estado.guardado && <Aviso tono="exito">Cambios guardados.</Aviso>}

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Plan" htmlFor="plan">
              <Select id="plan" name="plan" defaultValue={plan}>
                <option value="basico">Básico</option>
                <option value="pro">Pro</option>
                <option value="comercio">Comercio</option>
              </Select>
            </Campo>

            <Campo etiqueta="Estado" htmlFor="status">
              <Select id="status" name="status" defaultValue={status}>
                <option value="activo">Activo</option>
                <option value="pausado">Pausado</option>
                <option value="cancelado">Cancelado</option>
              </Select>
            </Campo>
          </div>

          <BotonGuardar />
        </form>
      </TarjetaCuerpo>
    </Tarjeta>
  );
}
