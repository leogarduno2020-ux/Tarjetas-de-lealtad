-- =====================================================================
-- Plataforma de tarjetas de lealtad — Esquema base
-- Sprint 1: tablas, índices, restricciones y triggers de consistencia.
-- =====================================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ---------------------------------------------------------------------
-- platform_admins
-- El rol de operador de la plataforma vive en su propia tabla, nunca en
-- una bandera del cliente. Se consulta con is_platform_admin() (0002).
-- ---------------------------------------------------------------------
create table if not exists public.platform_admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- businesses
-- ---------------------------------------------------------------------
create table if not exists public.businesses (
  id             uuid primary key default gen_random_uuid(),
  name           text not null check (length(btrim(name)) between 2 and 120),
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) between 2 and 60),
  logo_url       text,
  color_bg       text not null default '#111827' check (color_bg ~* '^#[0-9a-f]{6}$'),
  color_text     text not null default '#FFFFFF' check (color_text ~* '^#[0-9a-f]{6}$'),
  address        text,
  lat            numeric(10, 7),
  lng            numeric(10, 7),
  whatsapp_phone text check (whatsapp_phone is null or whatsapp_phone ~ '^\+[1-9][0-9]{7,14}$'),
  plan           text not null default 'basico' check (plan in ('basico', 'pro', 'comercio')),
  status         text not null default 'activo' check (status in ('activo', 'pausado', 'cancelado')),
  timezone       text not null default 'America/Merida',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- business_users — membresías. Un usuario puede pertenecer a varios negocios.
-- ---------------------------------------------------------------------
create table if not exists public.business_users (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  role        text not null check (role in ('business_owner', 'business_staff')),
  created_at  timestamptz not null default now(),
  unique (business_id, user_id)
);

create index if not exists business_users_user_id_idx on public.business_users (user_id);
create index if not exists business_users_business_id_idx on public.business_users (business_id);

-- ---------------------------------------------------------------------
-- card_templates — una plantilla = un programa de lealtad.
-- ---------------------------------------------------------------------
create table if not exists public.card_templates (
  id                 uuid primary key default gen_random_uuid(),
  business_id        uuid not null references public.businesses (id) on delete cascade,
  name               text not null check (length(btrim(name)) between 2 and 80),
  type               text not null default 'sellos' check (type in ('sellos', 'puntos')),
  stamps_required    int check (stamps_required is null or stamps_required between 1 and 50),
  points_per_peso    numeric(10, 4) check (points_per_peso is null or points_per_peso > 0),
  reward_description text,
  terms              text,
  relevant_text      text,
  provider_class_id  text,
  active             boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  -- Coherencia entre el tipo de programa y sus parámetros.
  constraint card_templates_params_check check (
    (type = 'sellos' and stamps_required is not null)
    or (type = 'puntos' and points_per_peso is not null)
  )
);

create index if not exists card_templates_business_id_idx on public.card_templates (business_id);

-- ---------------------------------------------------------------------
-- template_locations — máximo 10 por plantilla (límite duro de Apple).
-- ---------------------------------------------------------------------
create table if not exists public.template_locations (
  id            uuid primary key default gen_random_uuid(),
  template_id   uuid not null references public.card_templates (id) on delete cascade,
  name          text not null check (length(btrim(name)) between 1 and 60),
  lat           numeric(10, 7) not null check (lat between -90 and 90),
  lng           numeric(10, 7) not null check (lng between -180 and 180),
  relevant_text text,
  created_at    timestamptz not null default now()
);

create index if not exists template_locations_template_id_idx on public.template_locations (template_id);

-- El tope de 10 se aplica en la base, no solo en la UI.
create or replace function public.enforce_template_locations_limit()
returns trigger
language plpgsql
as $$
declare
  total int;
begin
  select count(*) into total
  from public.template_locations
  where template_id = new.template_id;

  if total >= 10 then
    raise exception 'Una plantilla no puede tener más de 10 ubicaciones (límite de Apple Wallet).';
  end if;

  return new;
end;
$$;

drop trigger if exists template_locations_limit on public.template_locations;
create trigger template_locations_limit
  before insert on public.template_locations
  for each row execute function public.enforce_template_locations_limit();

-- ---------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------
create table if not exists public.customers (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references public.businesses (id) on delete cascade,
  phone         text not null check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  name          text not null check (length(btrim(name)) between 2 and 120),
  email         citext,
  birthday      date,
  consent_at    timestamptz not null,
  consent_ip    text,
  last_visit_at timestamptz,
  status        text not null default 'activo' check (status in ('activo', 'inactivo', 'baja')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (business_id, phone)
);

create index if not exists customers_business_id_idx on public.customers (business_id);
create index if not exists customers_last_visit_idx on public.customers (business_id, last_visit_at);
-- Para el cron de cumpleaños: día y mes, sin el año.
create index if not exists customers_birthday_idx
  on public.customers (business_id, (extract(month from birthday)), (extract(day from birthday)));

-- ---------------------------------------------------------------------
-- cards
-- ---------------------------------------------------------------------
create table if not exists public.cards (
  id                 uuid primary key default gen_random_uuid(),
  customer_id        uuid not null references public.customers (id) on delete cascade,
  template_id        uuid not null references public.card_templates (id) on delete restrict,
  serial_number      text not null unique,
  auth_token         text not null,
  stamps_count       int not null default 0 check (stamps_count >= 0),
  points_balance     numeric(12, 2) not null default 0 check (points_balance >= 0),
  redemptions_count  int not null default 0 check (redemptions_count >= 0),
  reward_available   boolean not null default false,
  apple_pass_url     text,
  google_pass_url    text,
  provider_object_id text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  -- Un cliente no puede tener dos tarjetas del mismo programa.
  unique (customer_id, template_id)
);

create index if not exists cards_customer_id_idx on public.cards (customer_id);
create index if not exists cards_template_id_idx on public.cards (template_id);

-- ---------------------------------------------------------------------
-- stamp_events — log inmutable. Fuente de verdad de los conteos.
-- ---------------------------------------------------------------------
create table if not exists public.stamp_events (
  id            uuid primary key default gen_random_uuid(),
  card_id       uuid not null references public.cards (id) on delete cascade,
  staff_user_id uuid references auth.users (id) on delete set null,
  delta         int not null check (delta <> 0),
  reason        text not null check (reason in ('compra', 'hora_doble', 'referido', 'manual', 'canje')),
  ticket_amount numeric(12, 2) check (ticket_amount is null or ticket_amount >= 0),
  created_at    timestamptz not null default now()
);

create index if not exists stamp_events_card_id_idx on public.stamp_events (card_id, created_at desc);

-- ---------------------------------------------------------------------
-- redemptions
-- ---------------------------------------------------------------------
create table if not exists public.redemptions (
  id            uuid primary key default gen_random_uuid(),
  card_id       uuid not null references public.cards (id) on delete cascade,
  reward_text   text not null,
  staff_user_id uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now()
);

create index if not exists redemptions_card_id_idx on public.redemptions (card_id, created_at desc);

-- ---------------------------------------------------------------------
-- campaigns
-- ---------------------------------------------------------------------
create table if not exists public.campaigns (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  type        text not null check (type in ('inactivos', 'cumpleanos', 'hora_doble', 'difusion')),
  config      jsonb not null default '{}'::jsonb,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists campaigns_business_id_idx on public.campaigns (business_id);

-- ---------------------------------------------------------------------
-- messages — log de todo lo enviado. Evita duplicados y sirve de auditoría.
-- ---------------------------------------------------------------------
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  campaign_id uuid references public.campaigns (id) on delete set null,
  channel     text not null check (channel in ('whatsapp', 'wallet_push')),
  body        text,
  status      text not null default 'enviado' check (status in ('enviado', 'entregado', 'fallido')),
  provider_id text,
  error       text,
  sent_at     timestamptz not null default now()
);

create index if not exists messages_customer_id_idx on public.messages (customer_id, sent_at desc);
create index if not exists messages_campaign_id_idx on public.messages (campaign_id, sent_at desc);

-- ---------------------------------------------------------------------
-- referrals
-- ---------------------------------------------------------------------
create table if not exists public.referrals (
  id                   uuid primary key default gen_random_uuid(),
  referrer_card_id     uuid not null references public.cards (id) on delete cascade,
  referred_customer_id uuid not null references public.customers (id) on delete cascade,
  rewarded_at          timestamptz,
  created_at           timestamptz not null default now(),
  unique (referred_customer_id)
);

create index if not exists referrals_referrer_card_idx on public.referrals (referrer_card_id);

-- ---------------------------------------------------------------------
-- apple_devices — necesario cuando se migre al motor de pases propio (fase 3).
-- ---------------------------------------------------------------------
create table if not exists public.apple_devices (
  id                        uuid primary key default gen_random_uuid(),
  device_library_identifier text not null,
  push_token                text not null,
  card_id                   uuid not null references public.cards (id) on delete cascade,
  created_at                timestamptz not null default now(),
  unique (device_library_identifier, card_id)
);

create index if not exists apple_devices_card_id_idx on public.apple_devices (card_id);

-- =====================================================================
-- Triggers de consistencia
-- =====================================================================

-- updated_at automático
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array['businesses', 'card_templates', 'customers', 'cards', 'campaigns']
  loop
    execute format('drop trigger if exists touch_updated_at on public.%I', t);
    execute format(
      'create trigger touch_updated_at before update on public.%I
       for each row execute function public.touch_updated_at()', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- Recalcular la tarjeta a partir del log. cards.stamps_count nunca se
-- escribe a mano: es una proyección de stamp_events.
-- ---------------------------------------------------------------------
create or replace function public.recalc_card_from_events()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_card_id     uuid := coalesce(new.card_id, old.card_id);
  v_type        text;
  v_required    int;
  v_total       numeric;
  v_redemptions int;
begin
  select ct.type, ct.stamps_required
    into v_type, v_required
  from public.cards c
  join public.card_templates ct on ct.id = c.template_id
  where c.id = v_card_id;

  select coalesce(sum(delta), 0) into v_total
  from public.stamp_events
  where card_id = v_card_id;

  -- El saldo nunca baja de cero aunque el log tenga un canje mal capturado.
  v_total := greatest(v_total, 0);

  select count(*) into v_redemptions
  from public.stamp_events
  where card_id = v_card_id and reason = 'canje';

  if v_type = 'puntos' then
    update public.cards
      set points_balance    = v_total,
          redemptions_count = v_redemptions,
          updated_at        = now()
    where id = v_card_id;
  else
    update public.cards
      set stamps_count      = v_total,
          redemptions_count = v_redemptions,
          reward_available  = (v_required is not null and v_total >= v_required),
          updated_at        = now()
    where id = v_card_id;
  end if;

  return null;
end;
$$;

drop trigger if exists stamp_events_recalc on public.stamp_events;
create trigger stamp_events_recalc
  after insert or update or delete on public.stamp_events
  for each row execute function public.recalc_card_from_events();
