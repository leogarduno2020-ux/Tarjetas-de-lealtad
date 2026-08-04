import { requireOperador } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Tarjeta, TarjetaCuerpo, TarjetaEncabezado } from "@/components/ui/tarjeta";
import { Aviso } from "@/components/ui/aviso";

export const metadata = { title: "Métricas — Operación" };

function Metrica({ valor, etiqueta }: { valor: number; etiqueta: string }) {
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

export default async function MetricasPage() {
  await requireOperador();
  const admin = createAdminClient();

  const [negocios, activos, tarjetas, clientes] = await Promise.all([
    admin.from("businesses").select("id", { count: "exact", head: true }),
    admin
      .from("businesses")
      .select("id", { count: "exact", head: true })
      .eq("status", "activo"),
    admin.from("cards").select("id", { count: "exact", head: true }),
    admin.from("customers").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Métricas</h1>
        <p className="mt-0.5 text-sm text-[var(--color-tinta-suave)]">
          Estado general de la plataforma.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metrica valor={negocios.count ?? 0} etiqueta="Negocios" />
        <Metrica valor={activos.count ?? 0} etiqueta="Negocios activos" />
        <Metrica valor={tarjetas.count ?? 0} etiqueta="Tarjetas emitidas" />
        <Metrica valor={clientes.count ?? 0} etiqueta="Clientes registrados" />
      </div>

      <Tarjeta>
        <TarjetaEncabezado titulo="Ingresos" />
        <TarjetaCuerpo>
          <Aviso tono="pendiente">
            El MRR y el uso por negocio llegan en el Sprint 5, junto con el
            resto del panel de operación. Al inicio el cobro es por
            transferencia, así que todavía no hay nada que calcular solo.
          </Aviso>
        </TarjetaCuerpo>
      </Tarjeta>
    </div>
  );
}
