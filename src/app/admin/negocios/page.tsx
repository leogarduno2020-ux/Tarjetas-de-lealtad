import Link from "next/link";
import { requireOperador } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Tarjeta,
  TarjetaCuerpo,
  TarjetaEncabezado,
  Etiqueta,
  Vacio,
} from "@/components/ui/tarjeta";
import { Aviso } from "@/components/ui/aviso";
import { formatearFecha } from "@/lib/utils";
import type { Business, BusinessStatus } from "@/lib/types/database";
import { FormularioAlta } from "./formulario";

export const metadata = { title: "Negocios — Operación" };

const TONO_ESTADO: Record<BusinessStatus, "exito" | "aviso" | "alerta"> = {
  activo: "exito",
  pausado: "aviso",
  cancelado: "alerta",
};

export default async function NegociosPage() {
  await requireOperador();

  // El operador ve todos los negocios. RLS también se lo permitiría,
  // pero se usa el cliente de servidor para no depender de la sesión
  // del navegador en una vista de administración.
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("businesses")
    .select("*")
    .order("created_at", { ascending: false });

  const negocios = (data ?? []) as Business[];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Negocios</h1>
        <p className="mt-0.5 text-sm text-[var(--color-tinta-suave)]">
          {negocios.length === 1
            ? "1 negocio dado de alta."
            : `${negocios.length} negocios dados de alta.`}
        </p>
      </div>

      <FormularioAlta />

      {error && (
        <Aviso tono="error">
          No se pudo cargar la lista de negocios: {error.message}
        </Aviso>
      )}

      <Tarjeta>
        <TarjetaEncabezado titulo="Todos los negocios" />
        {negocios.length === 0 ? (
          <Vacio
            titulo="Todavía no hay negocios"
            descripcion="Da de alta el primero con el formulario de arriba. Toma menos de un minuto."
          />
        ) : (
          <ul className="divide-y divide-[var(--color-borde)]">
            {negocios.map((negocio) => (
              <li key={negocio.id}>
                <Link
                  href={`/admin/negocios/${negocio.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--color-fondo)] sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{negocio.name}</p>
                    <p className="truncate text-xs text-[var(--color-tinta-suave)]">
                      /r/{negocio.slug} · alta {formatearFecha(negocio.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Etiqueta tono="marca">{negocio.plan}</Etiqueta>
                    <Etiqueta tono={TONO_ESTADO[negocio.status]}>
                      {negocio.status}
                    </Etiqueta>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>
    </div>
  );
}
