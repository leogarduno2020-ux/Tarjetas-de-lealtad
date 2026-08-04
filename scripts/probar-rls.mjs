/**
 * Prueba de aislamiento multi-tenant.
 *
 * Crea dos negocios de prueba con su dueño cada uno, y luego intenta,
 * desde la sesión del dueño A, leer datos del negocio B por todas las
 * vías posibles. Cualquier fila que se cuele es una falla.
 *
 * Uso:
 *   node --env-file=.env.local scripts/probar-rls.mjs
 *
 * Al terminar borra todo lo que creó.
 */

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !ANON || !SERVICE) {
  console.error(
    "Faltan variables. Corre con: node --env-file=.env.local scripts/probar-rls.mjs",
  );
  process.exit(1);
}

const admin = createClient(URL, SERVICE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let fallas = 0;
let pruebas = 0;

function revisar(descripcion, ok, detalle = "") {
  pruebas += 1;
  if (ok) {
    console.log(`  ok    ${descripcion}`);
  } else {
    fallas += 1;
    console.log(`  FALLA ${descripcion}${detalle ? ` — ${detalle}` : ""}`);
  }
}

/** Da de alta un negocio completo con dueño, cliente y tarjeta. */
async function sembrarNegocio(etiqueta) {
  const sufijo = randomUUID().slice(0, 8);
  const email = `prueba-rls-${etiqueta}-${sufijo}@ejemplo.invalid`;
  const password = randomUUID();

  const { data: creado, error: errorUsuario } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
  if (errorUsuario) throw errorUsuario;

  const { data: businessId, error: errorNegocio } = await admin.rpc(
    "admin_create_business",
    {
      p_name: `Prueba RLS ${etiqueta}`,
      p_slug: `prueba-rls-${etiqueta}-${sufijo}`,
      p_owner_user_id: creado.user.id,
      p_plan: "basico",
      p_stamps_required: 5,
      p_reward: "Premio de prueba",
    },
  );
  if (errorNegocio) throw errorNegocio;

  const { data: plantilla } = await admin
    .from("card_templates")
    .select("id")
    .eq("business_id", businessId)
    .limit(1)
    .single();

  const { data: cliente } = await admin
    .from("customers")
    .insert({
      business_id: businessId,
      phone: `+521999${Math.floor(1000000 + Math.random() * 8999999)}`,
      name: `Cliente ${etiqueta}`,
      consent_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  const { data: tarjeta } = await admin
    .from("cards")
    .insert({
      customer_id: cliente.id,
      template_id: plantilla.id,
      serial_number: randomUUID(),
      auth_token: randomUUID(),
    })
    .select("id")
    .single();

  return {
    email,
    password,
    userId: creado.user.id,
    businessId,
    templateId: plantilla.id,
    customerId: cliente.id,
    cardId: tarjeta.id,
  };
}

async function sesionDe(negocio) {
  const cliente = createClient(URL, ANON, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await cliente.auth.signInWithPassword({
    email: negocio.email,
    password: negocio.password,
  });
  if (error) throw error;
  return cliente;
}

async function limpiar(negocio) {
  await admin.from("businesses").delete().eq("id", negocio.businessId);
  await admin.auth.admin.deleteUser(negocio.userId);
}

async function main() {
  console.log("Sembrando dos negocios de prueba…\n");
  const a = await sembrarNegocio("a");
  const b = await sembrarNegocio("b");

  try {
    const comoA = await sesionDe(a);

    console.log("El dueño de A intenta leer datos de B:");

    const negocios = await comoA.from("businesses").select("id");
    revisar(
      "businesses — solo ve el suyo",
      !negocios.error &&
        negocios.data.length === 1 &&
        negocios.data[0].id === a.businessId,
      `devolvió ${negocios.data?.length ?? "error"}`,
    );

    const negocioB = await comoA
      .from("businesses")
      .select("id")
      .eq("id", b.businessId);
    revisar(
      "businesses — pedir el de B por id no devuelve nada",
      !negocioB.error && negocioB.data.length === 0,
    );

    const clientesB = await comoA
      .from("customers")
      .select("id, phone, name")
      .eq("business_id", b.businessId);
    revisar(
      "customers — no ve los clientes de B",
      !clientesB.error && clientesB.data.length === 0,
    );

    const todosClientes = await comoA.from("customers").select("business_id");
    revisar(
      "customers — sin filtro, solo salen los suyos",
      !todosClientes.error &&
        todosClientes.data.every((f) => f.business_id === a.businessId),
    );

    const tarjetasB = await comoA
      .from("cards")
      .select("id")
      .eq("id", b.cardId);
    revisar(
      "cards — no ve las tarjetas de B",
      !tarjetasB.error && tarjetasB.data.length === 0,
    );

    const plantillasB = await comoA
      .from("card_templates")
      .select("id")
      .eq("business_id", b.businessId);
    revisar(
      "card_templates — no ve las plantillas de B",
      !plantillasB.error && plantillasB.data.length === 0,
    );

    const eventosB = await comoA
      .from("stamp_events")
      .select("id")
      .eq("card_id", b.cardId);
    revisar(
      "stamp_events — no ve el historial de B",
      !eventosB.error && eventosB.data.length === 0,
    );

    const equipoB = await comoA
      .from("business_users")
      .select("user_id")
      .eq("business_id", b.businessId);
    revisar(
      "business_users — no ve el equipo de B",
      !equipoB.error && equipoB.data.length === 0,
    );

    console.log("\nEl dueño de A intenta ESCRIBIR en B:");

    const insertoCliente = await comoA.from("customers").insert({
      business_id: b.businessId,
      phone: "+5219990000000",
      name: "Intruso",
      consent_at: new Date().toISOString(),
    });
    revisar(
      "customers — no puede insertar en B",
      Boolean(insertoCliente.error),
      "el insert pasó",
    );

    const cambioNombre = await comoA
      .from("businesses")
      .update({ name: "Secuestrado" })
      .eq("id", b.businessId)
      .select("id");
    revisar(
      "businesses — no puede renombrar a B",
      Boolean(cambioNombre.error) || cambioNombre.data.length === 0,
    );

    const meHagoDuenio = await comoA.from("business_users").insert({
      business_id: b.businessId,
      user_id: a.userId,
      role: "business_owner",
    });
    revisar(
      "business_users — no puede agregarse al equipo de B",
      Boolean(meHagoDuenio.error),
      "el insert pasó",
    );

    const meHagoOperador = await comoA
      .from("platform_admins")
      .insert({ user_id: a.userId });
    revisar(
      "platform_admins — no puede volverse operador",
      Boolean(meHagoOperador.error),
      "el insert pasó",
    );

    console.log("\nA través de las funciones del servidor:");

    const statsB = await comoA.rpc("business_dashboard_stats", {
      p_business_id: b.businessId,
      p_days: 7,
    });
    revisar(
      "business_dashboard_stats — rechaza un negocio ajeno",
      Boolean(statsB.error),
      "devolvió datos",
    );

    const statsA = await comoA.rpc("business_dashboard_stats", {
      p_business_id: a.businessId,
      p_days: 7,
    });
    revisar(
      "business_dashboard_stats — sí responde con el propio",
      !statsA.error,
      statsA.error?.message,
    );
  } finally {
    await limpiar(a);
    await limpiar(b);
  }

  console.log(`\n${pruebas - fallas}/${pruebas} pruebas pasaron.`);
  if (fallas > 0) {
    console.error(`\n${fallas} FALLA(S) de aislamiento. No lanzar así.`);
    process.exit(1);
  }
  console.log("Aislamiento multi-tenant correcto.");
}

main().catch((error) => {
  console.error("La prueba tronó:", error);
  process.exit(1);
});
