import { Pendiente } from "@/components/pendiente";

export const metadata = { title: "Equipo — Panel" };

export default function EquipoPage() {
  return (
    <Pendiente
      titulo="Equipo"
      sprint="Sprint 3"
      descripcion="Alta y baja de empleados. Cada quien entra con su propio acceso a la caja, y cada sello queda registrado con el nombre de quien lo puso."
    />
  );
}
