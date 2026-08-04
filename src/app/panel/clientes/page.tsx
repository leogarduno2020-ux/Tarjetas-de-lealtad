import { Pendiente } from "@/components/pendiente";

export const metadata = { title: "Clientes — Panel" };

export default function ClientesPage() {
  return (
    <Pendiente
      titulo="Clientes"
      sprint="Sprint 3"
      descripcion="Aquí vas a ver la lista completa de tus clientes, buscarlos por nombre o teléfono, abrir su ficha con el historial de sellos y canjes, y exportar todo a CSV. Primero necesitamos que la caja empiece a registrar visitas."
    />
  );
}
