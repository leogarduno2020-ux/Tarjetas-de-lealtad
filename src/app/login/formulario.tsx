"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Campo, Input } from "@/components/ui/campo";
import { Aviso } from "@/components/ui/aviso";
import { Tarjeta, TarjetaCuerpo } from "@/components/ui/tarjeta";
import { iniciarSesion, type EstadoLogin } from "./actions";

function BotonEntrar() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" ancho="completo" disabled={pending}>
      {pending ? "Entrando…" : "Entrar"}
    </Button>
  );
}

export function FormularioLogin({ redirigir }: { redirigir?: string }) {
  const [estado, accion] = useActionState<EstadoLogin, FormData>(
    iniciarSesion,
    {},
  );

  return (
    <Tarjeta>
      <TarjetaCuerpo>
        <form action={accion} className="space-y-4">
          {redirigir && <input type="hidden" name="redirigir" value={redirigir} />}

          {estado.error && <Aviso tono="error">{estado.error}</Aviso>}

          <Campo etiqueta="Correo" htmlFor="email" requerido>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              required
              placeholder="tu@correo.com"
            />
          </Campo>

          <Campo etiqueta="Contraseña" htmlFor="password" requerido>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
            />
          </Campo>

          <BotonEntrar />
        </form>
      </TarjetaCuerpo>
    </Tarjeta>
  );
}
