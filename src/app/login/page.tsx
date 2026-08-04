import { redirect } from "next/navigation";
import { getContexto } from "@/lib/auth";
import { FormularioLogin } from "./formulario";

export const metadata = { title: "Entrar — Plataforma de lealtad" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirigir?: string }>;
}) {
  const contexto = await getContexto();
  if (contexto) redirect("/");

  const { redirigir } = await searchParams;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Plataforma de lealtad
        </h1>
        <p className="mt-1 text-sm text-[var(--color-tinta-suave)]">
          Entra con el correo con el que te dimos de alta.
        </p>
      </div>

      <FormularioLogin redirigir={redirigir} />
    </main>
  );
}
