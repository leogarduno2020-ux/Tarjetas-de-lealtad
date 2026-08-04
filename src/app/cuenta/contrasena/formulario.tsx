"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Campo, Input } from "@/components/ui/campo";
import { Aviso } from "@/components/ui/aviso";
import { Tarjeta, TarjetaCuerpo } from "@/components/ui/tarjeta";
import { guardarContrasena, type EstadoContrasena } from "./actions";

function BotonGuardar() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" ancho="completo" disabled={pending}>
      {pending ? "Guardando…" : "Guardar y entrar"}
    </Button>
  );
}

export function FormularioContrasena() {
  const [estado, accion] = useActionState<EstadoContrasena, FormData>(
    guardarContrasena,
    {},
  );

  return (
    <Tarjeta>
      <TarjetaCuerpo>
        <form action={accion} className="space-y-4">
          {estado.error && <Aviso tono="error">{estado.error}</Aviso>}

          <Campo
            etiqueta="Contraseña nueva"
            htmlFor="password"
            ayuda="Mínimo 10 caracteres."
            requerido
          >
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={10}
              required
            />
          </Campo>

          <Campo etiqueta="Repite la contraseña" htmlFor="confirmacion" requerido>
            <Input
              id="confirmacion"
              name="confirmacion"
              type="password"
              autoComplete="new-password"
              minLength={10}
              required
            />
          </Campo>

          <BotonGuardar />
        </form>
      </TarjetaCuerpo>
    </Tarjeta>
  );
}
