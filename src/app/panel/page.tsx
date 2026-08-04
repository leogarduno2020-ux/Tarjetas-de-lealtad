import { requireDuenio } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Tarjeta, TarjetaCuerpo, TarjetaEncabezado } from "@/components/ui/tarjeta";
import { Aviso } from "@/components/ui/aviso";
import type { DashboardStats } from "@/lib/types/database";

export const metadata = { title: "Resumen — Panel" };

function Metrica({
  valor,
  etiqueta,
}: {
  valor: number;
  etiqueta: string;
}) {
  return (
    <Tarjeta>
      <TarjetaCuerpo className="py-4">
        <p className="text-2xl font-semibold tabular-nums">{valor}</p>
        <p className="mt-0.5 text-sm text-[var(--color-tinta-suave)]">
          {etiqueta}
        </p>
      </TarjetaCuerpo>
    </Tarjeta>
  );
}

export default async function ResumenPage() {
  const { activo } = await requireDuenio();
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("business_dashboard_stats", {
    p_business_id: activo.businessId,
    p_days: 7,
  });

  const stats = (Array.isArray(data) ? data[0] : data) as
    | DashboardStats
    | undefined;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Resumen</h1>
        <p className="mt-0.5 text-sm text-[var(--color-tinta-suave)]">
          Últimos 7 días de {activo.business.name}.
        </p>
      </div>

      {error && (
        <Aviso tono="error">
          No se pudieron cargar las métricas. Vuelve a intentarlo en un momento.
        </Aviso>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metrica valor={stats?.visitas_periodo ?? 0} etiqueta="Visitas" />
        <Metrica valor={stats?.clientes_nuevos ?? 0} etiqueta="Clientes nuevos" />
        <Metrica valor={stats?.canjes_periodo ?? 0} etiqueta="Premios canjeados" />
        <Metrica
          valor={stats?.clientes_inactivos ?? 0}
          etiqueta="Clientes inactivos"
        />
      </div>

      <Tarjeta>
        <TarjetaEncabezado
          titulo="Tu negocio en la plataforma"
          descripcion="Estado de la cuenta y del programa de lealtad."
        />
        <TarjetaCuerpo>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[var(--color-tinta-suave)]">Tarjetas emitidas</dt>
              <dd className="font-medium tabular-nums">
                {stats?.tarjetas_totales ?? 0}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-tinta-suave)]">Clientes activos</dt>
              <dd className="font-medium tabular-nums">
                {stats?.clientes_activos ?? 0}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-tinta-suave)]">Plan</dt>
              <dd className="font-medium capitalize">{activo.business.plan}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-tinta-suave)]">Liga de registro</dt>
              <dd className="font-medium break-all">/r/{activo.business.slug}</dd>
            </div>
          </dl>
        </TarjetaCuerpo>
      </Tarjeta>

      <Aviso tono="pendiente" titulo="Todavía no puedes recibir clientes">
        La página de registro y los pases de Wallet se construyen en el
        Sprint 2. Por ahora el panel ya está listo y tu negocio ya existe.
      </Aviso>
    </div>
  );
}
