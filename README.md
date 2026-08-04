# Plataforma de lealtad

Tarjetas de lealtad digitales para negocios locales de Mérida, Yucatán.
El cliente final no descarga ninguna app: su tarjeta vive en Apple Wallet
y Google Wallet.

**Estado: Sprint 1 terminado (cimientos).**

## Qué hay construido

| Superficie | Ruta | Estado |
|---|---|---|
| Panel de operador | `/admin` | Alta de negocios, edición de plan y estado, métricas generales, entrar al panel de un negocio |
| Panel de negocio | `/panel` | Resumen con métricas reales; las 7 secciones restantes son navegables y dicen en qué sprint llegan |
| PWA de caja | `/caja` | Navegable; el escáner llega en el Sprint 3 |
| Autenticación | `/login`, `/cuenta/contrasena` | Completa, con invitación por liga |

Base de datos completa (las 13 tablas del spec), RLS activo y forzado en
todas, y los triggers que mantienen `cards` como proyección del log de
`stamp_events`.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Supabase
(Postgres + Auth + RLS) · Vercel.

## Correr en local

```bash
npm install
cp .env.example .env.local   # y llena las llaves de Supabase
npm run dev
```

## Migraciones

Los archivos de `supabase/migrations/` se aplican **en orden**:

| Archivo | Qué hace |
|---|---|
| `0001_schema.sql` | Tablas, índices, restricciones y triggers |
| `0002_rls.sql` | Funciones auxiliares y políticas de aislamiento |
| `0003_admin_functions.sql` | Alta transaccional de negocios y métricas del panel |

Se pegan en el SQL Editor de Supabase, o se aplican con el CLI:

```bash
npx supabase link --project-ref <tu-ref>
npx supabase db push
```

## Probar el aislamiento multi-tenant

```bash
npm run probar:rls
```

Crea dos negocios de prueba, intenta leer y escribir datos del negocio
ajeno por todas las vías, y borra todo al terminar. Si algo se cuela,
sale con código de error. **Córrelo después de cada cambio a las
políticas.**

## Cómo está resuelta la seguridad

- RLS activo y **forzado** (`force row level security`) en las 13 tablas.
- El `business_id` nunca llega del navegador: se deriva de la sesión en
  el servidor (`src/lib/auth.ts`).
- `platform_admin` vive en la tabla `platform_admins` y se resuelve con
  la función `is_platform_admin()` en Postgres, no con una bandera del
  cliente.
- Las funciones auxiliares de las políticas son `SECURITY DEFINER` a
  propósito: si consultaran `business_users` con RLS activo, la política
  se llamaría a sí misma.
- El empleado (`business_staff`) no puede leer la tabla `customers`.
- La `service_role` key solo se usa desde `src/lib/supabase/admin.ts`,
  que importa `server-only`: si alguien la jala desde un componente del
  navegador, el build truena.

## Estructura

```
src/
  app/
    admin/          Panel de operador
    panel/          Panel de negocio
    caja/           PWA de caja
    login/          Autenticación
    cuenta/         Contraseña tras la invitación
    auth/callback/  Aterrizaje de los correos de Supabase
  components/       UI compartida
  lib/
    auth.ts         Sesión, roles y negocio activo
    supabase/       Clientes de navegador, servidor y service role
    types/          Tipos de la base de datos
supabase/migrations/
scripts/probar-rls.mjs
```
