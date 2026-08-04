import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Aterrizaje de los correos de Supabase (invitación, recuperación,
 * confirmación). Acepta los dos formatos de enlace: `code` (PKCE) y
 * `token_hash` + `type` (plantilla clásica).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const destinoParam = searchParams.get("siguiente");
  const destino =
    destinoParam && /^\/(?!\/)/.test(destinoParam)
      ? destinoParam
      : "/cuenta/contrasena";

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${destino}`);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) return NextResponse.redirect(`${origin}${destino}`);
  }

  return NextResponse.redirect(`${origin}/login?error=enlace_invalido`);
}
