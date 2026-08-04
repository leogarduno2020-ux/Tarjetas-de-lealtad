import { Tarjeta, TarjetaCuerpo } from "@/components/ui/tarjeta";

/**
 * Sección navegable que todavía no se construye.
 * Es honesta a propósito: dice en qué sprint llega en vez de fingir
 * una pantalla vacía que parece rota.
 */
export function Pendiente({
  titulo,
  sprint,
  descripcion,
}: {
  titulo: string;
  sprint: string;
  descripcion: string;
}) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">{titulo}</h1>
      <Tarjeta>
        <TarjetaCuerpo className="space-y-2">
          <p className="text-sm font-medium text-[var(--color-marca-oscuro)]">
            Llega en el {sprint}
          </p>
          <p className="text-sm leading-relaxed text-[var(--color-tinta-suave)]">
            {descripcion}
          </p>
        </TarjetaCuerpo>
      </Tarjeta>
    </div>
  );
}
