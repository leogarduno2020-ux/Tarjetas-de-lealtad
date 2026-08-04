import { Pendiente } from "@/components/pendiente";

export const metadata = { title: "Configuración — Panel" };

export default function ConfiguracionPage() {
  return (
    <Pendiente
      titulo="Configuración"
      sprint="Sprint 5"
      descripcion="Datos del negocio, dirección, y el WhatsApp donde quieres recibir tu reporte de los lunes."
    />
  );
}
