import Link from "next/link";
import { Tarjeta, TarjetaCuerpo } from "@/components/ui/tarjeta";

export const metadata = { title: "Sin acceso" };

export default function SinAcceso() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md items-center px-4">
      <Tarjeta className="w-full">
        <TarjetaCuerpo className="space-y-3 text-center">
          <h1 className="text-lg font-semibold">Tu cuenta aún no tiene un negocio asignado</h1>
          <p className="text-sm text-[var(--color-tinta-suave)]">
            Pídele a quien te dio de alta que te agregue al equipo de un
            negocio. En cuanto lo haga, vuelve a entrar y ya verás tu panel.
          </p>
          <Link
            href="/login"
            className="inline-block text-sm font-medium text-[var(--color-marca)] underline underline-offset-4"
          >
            Volver a iniciar sesión
          </Link>
        </TarjetaCuerpo>
      </Tarjeta>
    </main>
  );
}
