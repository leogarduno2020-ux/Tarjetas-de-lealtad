import { Pendiente } from "@/components/pendiente";

export const metadata = { title: "Hora doble — Panel" };

export default function HoraDoblePage() {
  return (
    <Pendiente
      titulo="Hora doble"
      sprint="Sprint 4"
      descripcion="Un botón grande para activar sellos dobles por unas horas y avisarles a tus clientes por WhatsApp. Sirve para llenar las horas muertas."
    />
  );
}
