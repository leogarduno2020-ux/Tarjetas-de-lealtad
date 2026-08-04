import { requireUsuario } from "@/lib/auth";
import { FormularioContrasena } from "./formulario";

export const metadata = { title: "Crear contraseña" };

export default async function ContrasenaPage() {
  const { user } = await requireUsuario();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Crea tu contraseña
        </h1>
        <p className="mt-1 text-sm text-[var(--color-tinta-suave)]">
          Es la que vas a usar para entrar como {user.email}.
        </p>
      </div>

      <FormularioContrasena />
    </main>
  );
}
