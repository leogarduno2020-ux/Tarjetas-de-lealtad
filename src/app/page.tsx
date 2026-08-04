import { redirect } from "next/navigation";
import { getContexto } from "@/lib/auth";

/**
 * La raíz no es una landing todavía: manda a cada quien a su superficie.
 * El operador al panel de plataforma, el dueño a su panel, el empleado a
 * la caja, y quien no tenga sesión al login.
 */
export default async function Home() {
  const contexto = await getContexto();

  if (!contexto) redirect("/login");
  if (contexto.esOperador) redirect("/admin/negocios");

  const membresia = contexto.membresias[0];
  if (!membresia) redirect("/sin-acceso");

  redirect(membresia.role === "business_owner" ? "/panel" : "/caja");
}
