import { requireOperador } from "@/lib/auth";
import { Shell, type ItemNav } from "@/components/shell";
import { BotonSalir } from "@/components/boton-salir";

const ITEMS: ItemNav[] = [
  { href: "/admin/negocios", etiqueta: "Negocios" },
  { href: "/admin/metricas", etiqueta: "Métricas" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireOperador();

  return (
    <Shell
      titulo="Operación"
      subtitulo={user.email ?? undefined}
      items={ITEMS}
      acciones={<BotonSalir />}
    >
      {children}
    </Shell>
  );
}
