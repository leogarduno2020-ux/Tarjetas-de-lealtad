"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Campo, Input, Select } from "@/components/ui/campo";
import { Aviso } from "@/components/ui/aviso";
import { Tarjeta, TarjetaCuerpo, TarjetaEncabezado } from "@/components/ui/tarjeta";
import { slugify } from "@/lib/utils";
import { crearNegocio, type EstadoAlta } from "./acciones";

function BotonCrear() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" ancho="completo" disabled={pending}>
      {pending ? "Creando negocio…" : "Crear negocio"}
    </Button>
  );
}

function LigaInvitacion({ liga }: { liga: string }) {
  const [copiado, setCopiado] = useState(false);

  return (
    <div className="space-y-2">
      <p className="text-sm">
        Mándale esta liga al dueño por WhatsApp. Con ella crea su contraseña
        y entra a su panel. Vence en unas horas: si tarda, se genera otra.
      </p>
      <div className="rounded-lg border border-[var(--color-borde)] bg-white p-2">
        <code className="block break-all text-xs text-[var(--color-tinta-suave)]">
          {liga}
        </code>
      </div>
      <Button
        type="button"
        variant="secundario"
        size="sm"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(liga);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
          } catch {
            setCopiado(false);
          }
        }}
      >
        {copiado ? "Copiada" : "Copiar liga"}
      </Button>
    </div>
  );
}

export function FormularioAlta() {
  const [estado, accion] = useActionState<EstadoAlta, FormData>(
    crearNegocio,
    {},
  );
  const [abierto, setAbierto] = useState(false);
  const [slugAuto, setSlugAuto] = useState("");

  if (estado.exito) {
    return (
      <Tarjeta>
        <TarjetaEncabezado
          titulo={`${estado.exito.nombre} ya está dado de alta`}
          descripcion={`Liga de registro: /r/${estado.exito.slug}`}
        />
        <TarjetaCuerpo className="space-y-4">
          <Aviso tono="exito">
            Se creó el negocio, su plantilla de lealtad inicial y el acceso de{" "}
            {estado.exito.emailDuenio}.
          </Aviso>

          {estado.exito.ligaInvitacion ? (
            <LigaInvitacion liga={estado.exito.ligaInvitacion} />
          ) : (
            <Aviso tono="pendiente">
              No se pudo generar la liga de invitación. El dueño puede entrar
              con la opción de recuperar contraseña desde /login.
            </Aviso>
          )}

          <Button
            type="button"
            variant="secundario"
            onClick={() => window.location.reload()}
          >
            Dar de alta otro negocio
          </Button>
        </TarjetaCuerpo>
      </Tarjeta>
    );
  }

  if (!abierto) {
    return (
      <Button size="lg" ancho="completo" onClick={() => setAbierto(true)}>
        Dar de alta un negocio
      </Button>
    );
  }

  return (
    <Tarjeta>
      <TarjetaEncabezado
        titulo="Nuevo negocio"
        descripcion="Lo mínimo para que quede operando. El resto lo configura el dueño."
      />
      <TarjetaCuerpo>
        <form action={accion} className="space-y-4">
          {estado.error && <Aviso tono="error">{estado.error}</Aviso>}

          <Campo etiqueta="Nombre del negocio" htmlFor="nombre" requerido>
            <Input
              id="nombre"
              name="nombre"
              required
              placeholder="Café del Centro"
              onChange={(evento) => setSlugAuto(slugify(evento.target.value))}
            />
          </Campo>

          <Campo
            etiqueta="Liga del negocio"
            htmlFor="slug"
            ayuda={`Así se verá: /r/${slugAuto || "cafe-del-centro"}. Déjalo vacío para usar el nombre.`}
          >
            <Input
              id="slug"
              name="slug"
              placeholder={slugAuto || "cafe-del-centro"}
              inputMode="url"
              autoCapitalize="none"
            />
          </Campo>

          <Campo
            etiqueta="Correo del dueño"
            htmlFor="emailDuenio"
            ayuda="A este correo se liga su acceso al panel."
            requerido
          >
            <Input
              id="emailDuenio"
              name="emailDuenio"
              type="email"
              inputMode="email"
              autoCapitalize="none"
              required
              placeholder="dueno@negocio.com"
            />
          </Campo>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Plan" htmlFor="plan" requerido>
              <Select id="plan" name="plan" defaultValue="basico" required>
                <option value="basico">Básico</option>
                <option value="pro">Pro</option>
                <option value="comercio">Comercio</option>
              </Select>
            </Campo>

            <Campo
              etiqueta="Sellos para el premio"
              htmlFor="sellosRequeridos"
              requerido
            >
              <Input
                id="sellosRequeridos"
                name="sellosRequeridos"
                type="number"
                inputMode="numeric"
                min={1}
                max={50}
                defaultValue={8}
                required
              />
            </Campo>
          </div>

          <Campo
            etiqueta="Premio"
            htmlFor="premio"
            ayuda="Como se lo va a leer el cliente en su tarjeta."
            requerido
          >
            <Input
              id="premio"
              name="premio"
              required
              placeholder="Un café americano gratis"
            />
          </Campo>

          <Campo etiqueta="Dirección" htmlFor="direccion">
            <Input
              id="direccion"
              name="direccion"
              placeholder="Calle 60 x 55, Centro, Mérida"
            />
          </Campo>

          <Campo
            etiqueta="WhatsApp del dueño"
            htmlFor="whatsapp"
            ayuda="A 10 dígitos. Aquí llega el reporte de los lunes."
          >
            <Input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              inputMode="tel"
              placeholder="9991772754"
            />
          </Campo>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secundario"
              onClick={() => setAbierto(false)}
            >
              Cancelar
            </Button>
            <BotonCrear />
          </div>
        </form>
      </TarjetaCuerpo>
    </Tarjeta>
  );
}
