"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOperador } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { slugify, normalizePhoneMx } from "@/lib/utils";

const esquemaAlta = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, { message: "El nombre del negocio es muy corto." })
    .max(120, { message: "El nombre del negocio es muy largo." }),
  slug: z.string().trim().optional(),
  emailDuenio: z.email({ message: "Escribe un correo válido para el dueño." }),
  plan: z.enum(["basico", "pro", "comercio"]),
  direccion: z.string().trim().max(240).optional().or(z.literal("")),
  whatsapp: z.string().trim().optional().or(z.literal("")),
  sellosRequeridos: z.coerce
    .number()
    .int()
    .min(1, { message: "Se necesita al menos 1 sello." })
    .max(50, { message: "Máximo 50 sellos." }),
  premio: z
    .string()
    .trim()
    .min(3, { message: "Describe el premio." })
    .max(200, { message: "Describe el premio en menos palabras." }),
});

export interface EstadoAlta {
  error?: string;
  exito?: {
    nombre: string;
    slug: string;
    emailDuenio: string;
    ligaInvitacion: string | null;
  };
}

export async function crearNegocio(
  _estado: EstadoAlta,
  formData: FormData,
): Promise<EstadoAlta> {
  // Autorización primero: sin esto, cualquiera con la URL de la acción
  // podría dar de alta negocios.
  await requireOperador();

  const parseo = esquemaAlta.safeParse({
    nombre: formData.get("nombre"),
    slug: formData.get("slug"),
    emailDuenio: formData.get("emailDuenio"),
    plan: formData.get("plan"),
    direccion: formData.get("direccion"),
    whatsapp: formData.get("whatsapp"),
    sellosRequeridos: formData.get("sellosRequeridos"),
    premio: formData.get("premio"),
  });

  if (!parseo.success) {
    return { error: parseo.error.issues[0]?.message ?? "Revisa los datos." };
  }

  const datos = parseo.data;
  const slug = slugify(datos.slug || datos.nombre);

  if (slug.length < 2) {
    return {
      error: "No se pudo generar la liga del negocio. Escribe una a mano.",
    };
  }

  let whatsapp: string | null = null;
  if (datos.whatsapp) {
    whatsapp = normalizePhoneMx(datos.whatsapp);
    if (!whatsapp) {
      return {
        error:
          "El WhatsApp del dueño no se entiende. Escríbelo a 10 dígitos, por ejemplo 9991772754.",
      };
    }
  }

  const admin = createAdminClient();

  const { data: existente } = await admin
    .from("businesses")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existente) {
    return {
      error: `Ya hay un negocio con la liga "${slug}". Escribe otra.`,
    };
  }

  // El dueño se da de alta con un enlace de invitación: no se inventa
  // ninguna contraseña, él la define al entrar.
  const redirectTo = `${env.appUrl}/auth/callback?siguiente=/cuenta/contrasena`;

  let userId: string | null = null;
  let ligaInvitacion: string | null = null;

  const invitacion = await admin.auth.admin.generateLink({
    type: "invite",
    email: datos.emailDuenio,
    options: { redirectTo },
  });

  if (invitacion.error) {
    // Si el correo ya existe en la plataforma (dueño con dos negocios),
    // se le manda una liga de acceso en lugar de una invitación.
    const yaExiste = /already|exists|registered/i.test(
      invitacion.error.message,
    );

    if (!yaExiste) {
      return {
        error: `No se pudo crear el acceso del dueño: ${invitacion.error.message}`,
      };
    }

    const acceso = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: datos.emailDuenio,
      options: { redirectTo },
    });

    if (acceso.error || !acceso.data.user) {
      return {
        error: `No se pudo generar el acceso del dueño: ${acceso.error?.message ?? "error desconocido"}`,
      };
    }

    userId = acceso.data.user.id;
    ligaInvitacion = acceso.data.properties?.action_link ?? null;
  } else {
    userId = invitacion.data.user?.id ?? null;
    ligaInvitacion = invitacion.data.properties?.action_link ?? null;
  }

  if (!userId) {
    return { error: "No se pudo identificar la cuenta del dueño." };
  }

  // Negocio + membresía + plantilla inicial, en una sola transacción.
  const { error: errorAlta } = await admin.rpc("admin_create_business", {
    p_name: datos.nombre,
    p_slug: slug,
    p_owner_user_id: userId,
    p_plan: datos.plan,
    p_address: datos.direccion || null,
    p_whatsapp_phone: whatsapp,
    p_stamps_required: datos.sellosRequeridos,
    p_reward: datos.premio,
  });

  if (errorAlta) {
    return { error: `No se pudo crear el negocio: ${errorAlta.message}` };
  }

  revalidatePath("/admin/negocios");

  return {
    exito: {
      nombre: datos.nombre,
      slug,
      emailDuenio: datos.emailDuenio,
      ligaInvitacion,
    },
  };
}

const esquemaEstado = z.object({
  businessId: z.uuid(),
  plan: z.enum(["basico", "pro", "comercio"]),
  status: z.enum(["activo", "pausado", "cancelado"]),
});

export interface EstadoEdicion {
  error?: string;
  guardado?: boolean;
}

export async function actualizarNegocio(
  _estado: EstadoEdicion,
  formData: FormData,
): Promise<EstadoEdicion> {
  await requireOperador();

  const parseo = esquemaEstado.safeParse({
    businessId: formData.get("businessId"),
    plan: formData.get("plan"),
    status: formData.get("status"),
  });

  if (!parseo.success) {
    return { error: "Revisa los datos." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("businesses")
    .update({ plan: parseo.data.plan, status: parseo.data.status })
    .eq("id", parseo.data.businessId);

  if (error) {
    return { error: `No se pudo guardar: ${error.message}` };
  }

  revalidatePath("/admin/negocios");
  revalidatePath(`/admin/negocios/${parseo.data.businessId}`);

  return { guardado: true };
}
