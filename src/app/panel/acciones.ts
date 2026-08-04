"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getContexto, COOKIE_NEGOCIO_ACTIVO } from "@/lib/auth";

/**
 * Guarda el negocio activo del panel.
 * Solo se acepta un id que esté entre las membresías del usuario: el
 * navegador no decide a qué negocio se entra.
 */
export async function cambiarNegocioActivo(businessId: string) {
  const contexto = await getContexto();
  if (!contexto) return;

  const pertenece =
    contexto.esOperador ||
    contexto.membresias.some((m) => m.businessId === businessId);
  if (!pertenece) return;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NEGOCIO_ACTIVO, businessId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  revalidatePath("/panel", "layout");
}
