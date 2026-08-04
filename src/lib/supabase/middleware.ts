import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

/** Rutas que exigen sesión iniciada. */
const RUTAS_PRIVADAS = ["/panel", "/admin", "/caja"];

/**
 * Refresca el token de Supabase en cada petición y bloquea el acceso a
 * las rutas privadas sin sesión. La verificación fina de rol (operador,
 * dueño, empleado) se hace en cada layout con `lib/auth.ts`: el
 * middleware solo mira que haya un usuario.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser() valida el token contra Supabase. getSession() solo lee la
  // cookie y por eso no sirve para autorizar.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const esPrivada = RUTAS_PRIVADAS.some(
    (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`),
  );

  if (!user && esPrivada) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirigir", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}
