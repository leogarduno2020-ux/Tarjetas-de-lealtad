import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { requireOperador, COOKIE_NEGOCIO_ACTIVO } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function BotonImpersonar({ businessId }: { businessId: string }) {
  async function abrirPanel() {
    "use server";

    await requireOperador();

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NEGOCIO_ACTIVO, businessId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60,
    });

    redirect("/panel");
  }

  return (
    <form action={abrirPanel}>
      <Button type="submit" variant="secundario">
        Abrir su panel
      </Button>
    </form>
  );
}
