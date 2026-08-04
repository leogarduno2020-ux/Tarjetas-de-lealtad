import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Business, BusinessRole } from "@/lib/types/database";

export const COOKIE_NEGOCIO_ACTIVO = "negocio_activo";

export interface Membresia {
  businessId: string;
  role: BusinessRole;
  business: Business;
}

export interface Contexto {
  user: User;
  esOperador: boolean;
  membresias: Membresia[];
}

/**
 * Contexto de la sesión, resuelto siempre en el servidor.
 *
 * El `business_id` nunca llega del navegador: se deriva de las
 * membresías del usuario autenticado. Esa es la única fuente válida.
 */
export async function getContexto(): Promise<Contexto | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: adminRow }, { data: filas }] = await Promise.all([
    supabase.from("platform_admins").select("user_id").maybeSingle(),
    supabase
      .from("business_users")
      .select("business_id, role, businesses(*)")
      .order("created_at", { ascending: true }),
  ]);

  const membresias: Membresia[] = (filas ?? [])
    .filter((fila) => fila.businesses)
    .map((fila) => ({
      businessId: fila.business_id as string,
      role: fila.role as BusinessRole,
      business: fila.businesses as unknown as Business,
    }));

  return { user, esOperador: Boolean(adminRow), membresias };
}

export async function requireUsuario(): Promise<Contexto> {
  const contexto = await getContexto();
  if (!contexto) redirect("/login");
  return contexto;
}

/** Exige rol de operador de plataforma. */
export async function requireOperador(): Promise<Contexto> {
  const contexto = await requireUsuario();
  if (!contexto.esOperador) redirect("/sin-acceso");
  return contexto;
}

/**
 * Resuelve el negocio activo del panel.
 *
 * Si el usuario pertenece a varios, se respeta la cookie de selección
 * pero solo después de validarla contra sus membresías reales.
 */
export async function requireNegocio(): Promise<Contexto & { activo: Membresia }> {
  const contexto = await requireUsuario();

  const cookieStore = await cookies();
  const seleccionado = cookieStore.get(COOKIE_NEGOCIO_ACTIVO)?.value;

  let activo = contexto.membresias.find((m) => m.businessId === seleccionado);

  // El operador de la plataforma puede abrir el panel de cualquier
  // negocio para dar soporte. RLS ya se lo permite; aquí solo se le
  // construye la membresía equivalente.
  if (!activo && contexto.esOperador && seleccionado) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", seleccionado)
      .maybeSingle();

    if (data) {
      activo = {
        businessId: data.id as string,
        role: "business_owner",
        business: data as Business,
      };
    }
  }

  activo ??= contexto.membresias[0];
  if (!activo) redirect("/sin-acceso");

  return { ...contexto, activo };
}

/** Exige ser dueño (o el operador) del negocio activo. */
export async function requireDuenio(): Promise<Contexto & { activo: Membresia }> {
  const contexto = await requireNegocio();
  if (!contexto.esOperador && contexto.activo.role !== "business_owner") {
    redirect("/caja");
  }
  return contexto;
}
