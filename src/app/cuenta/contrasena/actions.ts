"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const esquema = z
  .object({
    password: z
      .string()
      .min(10, { message: "Usa al menos 10 caracteres." })
      .max(72, { message: "Máximo 72 caracteres." }),
    confirmacion: z.string(),
  })
  .refine((datos) => datos.password === datos.confirmacion, {
    message: "Las dos contraseñas no coinciden.",
    path: ["confirmacion"],
  });

export interface EstadoContrasena {
  error?: string;
}

export async function guardarContrasena(
  _estado: EstadoContrasena,
  formData: FormData,
): Promise<EstadoContrasena> {
  const parseo = esquema.safeParse({
    password: formData.get("password"),
    confirmacion: formData.get("confirmacion"),
  });

  if (!parseo.success) {
    return { error: parseo.error.issues[0]?.message ?? "Datos incompletos." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tu enlace ya venció. Pide uno nuevo para continuar." };
  }

  const { error } = await supabase.auth.updateUser({
    password: parseo.data.password,
  });

  if (error) {
    return { error: "No se pudo guardar la contraseña. Inténtalo otra vez." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}
