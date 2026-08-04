import { requireNegocio } from "@/lib/auth";
import { BotonSalir } from "@/components/boton-salir";
import { Tarjeta, TarjetaCuerpo } from "@/components/ui/tarjeta";

export const metadata = { title: "Caja" };

export default async function CajaPage() {
  const { activo } = await requireNegocio();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-5">
      <header className="mb-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold leading-tight">
            {activo.business.name}
          </p>
          <p className="text-xs text-[var(--color-tinta-suave)]">Caja</p>
        </div>
        <BotonSalir />
      </header>

      <Tarjeta className="flex-1">
        <TarjetaCuerpo className="flex h-full flex-col items-center justify-center gap-3 text-center">
          <p className="font-medium">El escáner llega en el Sprint 3</p>
          <p className="max-w-xs text-sm leading-relaxed text-[var(--color-tinta-suave)]">
            Aquí vas a abrir la cámara, escanear el código del cliente y
            ponerle su sello. Funciona aunque se caiga el internet: los
            sellos se guardan en el teléfono y se sincronizan solos.
          </p>
        </TarjetaCuerpo>
      </Tarjeta>
    </main>
  );
}
