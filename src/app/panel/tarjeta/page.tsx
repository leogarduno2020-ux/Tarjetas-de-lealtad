import { Pendiente } from "@/components/pendiente";

export const metadata = { title: "Tarjeta — Panel" };

export default function TarjetaPage() {
  return (
    <Pendiente
      titulo="Tarjeta"
      sprint="Sprint 2"
      descripcion="El editor de tu tarjeta: logo, colores, cuántos sellos se necesitan y cuál es el premio. Lo que edites aquí es lo que van a ver tus clientes en Apple Wallet y Google Wallet."
    />
  );
}
