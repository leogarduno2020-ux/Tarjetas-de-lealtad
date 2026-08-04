import { requireDuenio } from "@/lib/auth";
import { Shell, type ItemNav } from "@/components/shell";
import { BotonSalir } from "@/components/boton-salir";
import { SelectorNegocio } from "@/components/selector-negocio";

const ITEMS: ItemNav[] = [
  { href: "/panel", etiqueta: "Resumen" },
  { href: "/panel/clientes", etiqueta: "Clientes" },
  { href: "/panel/tarjeta", etiqueta: "Tarjeta" },
  { href: "/panel/ubicaciones", etiqueta: "Ubicaciones" },
  { href: "/panel/campanas", etiqueta: "Campañas" },
  { href: "/panel/hora-doble", etiqueta: "Hora doble" },
  { href: "/panel/equipo", etiqueta: "Equipo" },
  { href: "/panel/configuracion", etiqueta: "Configuración" },
];

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activo, membresias } = await requireDuenio();

  return (
    <Shell
      titulo={activo.business.name}
      subtitulo={`Plan ${activo.business.plan} · ${activo.business.status}`}
      items={ITEMS}
      cambiarNegocio={
        membresias.length > 1 ? (
          <SelectorNegocio
            membresias={membresias.map((m) => ({
              id: m.businessId,
              nombre: m.business.name,
            }))}
            activo={activo.businessId}
          />
        ) : null
      }
      acciones={<BotonSalir />}
    >
      {children}
    </Shell>
  );
}
