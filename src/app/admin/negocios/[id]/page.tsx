import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOperador } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Tarjeta,
  TarjetaCuerpo,
  TarjetaEncabezado,
  Etiqueta,
} from "@/components/ui/tarjeta";
import { formatearFecha } from "@/lib/utils";
import type { Business } from "@/lib/types/database";
import { FormularioEdicion } from "./formulario";
import { BotonImpersonar } from "./impersonar";

export const metadata = { title: "Negocio — Operación" };

export default async function NegocioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOperador();
  const { id } = await params;

  const admin = createAdminClient();

  const { data } = await admin
    .from("businesses")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const negocio = data as Business;

  const [{ count: clientes }, { count: plantillas }, { data: equipo }] =
    await Promise.all([
      admin
        .from("customers")
        .select("id", { count: "exact", head: true })
        .eq("business_id", id),
      admin
        .from("card_templates")
        .select("id", { count: "exact", head: true })
        .eq("business_id", id),
      admin
        .from("business_users")
        .select("user_id, role, created_at")
        .eq("business_id", id)
        .order("created_at", { ascending: true }),
    ]);

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/negocios"
          className="text-sm text-[var(--color-tinta-suave)] underline underline-offset-4"
        >
          ← Todos los negocios
        </Link>
        <h1 className="mt-2 text-xl font-semibold tracking-tight">
          {negocio.name}
        </h1>
        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-[var(--color-tinta-suave)]">
          <span>/r/{negocio.slug}</span>
          <Etiqueta tono="marca">{negocio.plan}</Etiqueta>
          <Etiqueta tono={negocio.status === "activo" ? "exito" : "aviso"}>
            {negocio.status}
          </Etiqueta>
        </p>
      </div>

      <Tarjeta>
        <TarjetaEncabezado titulo="Datos" />
        <TarjetaCuerpo>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[var(--color-tinta-suave)]">Dirección</dt>
              <dd className="font-medium">{negocio.address ?? "Sin capturar"}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-tinta-suave)]">
                WhatsApp del dueño
              </dt>
              <dd className="font-medium">
                {negocio.whatsapp_phone ?? "Sin capturar"}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-tinta-suave)]">Clientes</dt>
              <dd className="font-medium tabular-nums">{clientes ?? 0}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-tinta-suave)]">Plantillas</dt>
              <dd className="font-medium tabular-nums">{plantillas ?? 0}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-tinta-suave)]">Zona horaria</dt>
              <dd className="font-medium">{negocio.timezone}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-tinta-suave)]">Alta</dt>
              <dd className="font-medium">{formatearFecha(negocio.created_at)}</dd>
            </div>
          </dl>
        </TarjetaCuerpo>
      </Tarjeta>

      <Tarjeta>
        <TarjetaEncabezado
          titulo="Equipo"
          descripcion="Quién tiene acceso a este negocio."
        />
        <ul className="divide-y divide-[var(--color-borde)]">
          {(equipo ?? []).map((miembro) => (
            <li
              key={miembro.user_id}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm sm:px-5"
            >
              <span className="truncate font-mono text-xs text-[var(--color-tinta-suave)]">
                {miembro.user_id}
              </span>
              <Etiqueta tono={miembro.role === "business_owner" ? "marca" : "neutro"}>
                {miembro.role === "business_owner" ? "Dueño" : "Empleado"}
              </Etiqueta>
            </li>
          ))}
        </ul>
      </Tarjeta>

      <FormularioEdicion
        businessId={negocio.id}
        plan={negocio.plan}
        status={negocio.status}
      />

      <Tarjeta>
        <TarjetaEncabezado
          titulo="Entrar como este negocio"
          descripcion="Abre su panel tal como lo ve el dueño, para dar soporte."
        />
        <TarjetaCuerpo>
          <BotonImpersonar businessId={negocio.id} />
        </TarjetaCuerpo>
      </Tarjeta>
    </div>
  );
}
