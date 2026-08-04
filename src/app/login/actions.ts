"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const esquema = z.object({
  email: z.email({ message: "Escribe un correo válido." }),
  password: z.string().min(1, { message: "Escribe tu contraseña." }),
  redirigir: z.string().optional(),
});

export interface EstadoLogin {
  error?: string;
}

export async function iniciarSesion(
  _estado: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  const parseo = esquema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    redirigir: formData.get("redirigir") ?? undefined,
  });

  if (!parseo.success) {
    return { error: parseo.error.issues[0]?.message ?? "Datos incompletos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parseo.data.email,
    password: parseo.data.password,
  });

  if (error) {
    // Mismo mensaje para correo inexistente y contraseña mala: no se
    // filtra qué correos están dados de alta.
    return { error: "Correo o contraseña incorrectos." };
  }

  // Solo se aceptan destinos internos: un `redirigir` con URL completa
  // sería un redirect abierto.
  const destino = parseo.data.redirigir;
  const seguro = destino && /^\/(?!\/)/.test(destino) ? destino : "/";

  revalidatePath("/", "layout");
  redirect(seguro);
}

export async function cerrarSesion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
