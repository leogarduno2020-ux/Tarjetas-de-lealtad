import { Pendiente } from "@/components/pendiente";

export const metadata = { title: "Campañas — Panel" };

export default function CampanasPage() {
  return (
    <Pendiente
      titulo="Campañas"
      sprint="Sprint 4"
      descripcion="Mensajes automáticos por WhatsApp: rescate de clientes que no han vuelto, felicitaciones de cumpleaños y difusiones puntuales. Todo con la palabra BAJA para que quien no quiera recibir nada pueda salirse."
    />
  );
}
