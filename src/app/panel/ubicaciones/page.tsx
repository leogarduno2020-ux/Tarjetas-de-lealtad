import { Pendiente } from "@/components/pendiente";

export const metadata = { title: "Ubicaciones — Panel" };

export default function UbicacionesPage() {
  return (
    <Pendiente
      titulo="Ubicaciones"
      sprint="Sprint 5"
      descripcion="Vas a poner hasta 10 puntos donde tus clientes pasan a diario: plazas, cruces, el súper, la escuela. Cuando estén cerca, tu tarjeta aparece sola en su pantalla de bloqueo."
    />
  );
}
