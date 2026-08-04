-- =====================================================================
-- RLS — aislamiento multi-tenant
--
-- Regla: todo dato pertenece a un business_id. Un usuario solo ve filas
-- de los negocios donde tiene membresía. El operador de la plataforma es
-- la única excepción y se resuelve en Postgres, no en el cliente.
--
-- Las funciones auxiliares son SECURITY DEFINER a propósito: si una
-- política consultara business_users con RLS activo, la política se
-- llamaría a sí misma (recursión infinita).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Funciones auxiliares
-- ---------------------------------------------------------------------

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.platform_admins where user_id = auth.uid()
  );
$$;

create or replace function public.is_business_member(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.is_platform_admin()
      or exists (
        select 1 from public.business_users
        where user_id = auth.uid() and business_id = p_business_id
      );
$$;

create or replace function public.is_business_owner(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.is_platform_admin()
      or exists (
        select 1 from public.business_users
        where user_id = auth.uid()
          and business_id = p_business_id
          and role = 'business_owner'
      );
$$;

-- Resolución de business_id para las tablas que lo tienen indirecto.
create or replace function public.template_business_id(p_template_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select business_id from public.card_templates where id = p_template_id;
$$;

create or replace function public.customer_business_id(p_customer_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select business_id from public.customers where id = p_customer_id;
$$;

create or replace function public.card_business_id(p_card_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select cu.business_id
  from public.cards c
  join public.customers cu on cu.id = c.customer_id
  where c.id = p_card_id;
$$;

-- Estas funciones leen tablas protegidas: solo las llaman las políticas.
revoke all on function public.is_platform_admin() from public;
revoke all on function public.is_business_member(uuid) from public;
revoke all on function public.is_business_owner(uuid) from public;
revoke all on function public.template_business_id(uuid) from public;
revoke all on function public.customer_business_id(uuid) from public;
revoke all on function public.card_business_id(uuid) from public;

grant execute on function public.is_platform_admin() to authenticated, anon;
grant execute on function public.is_business_member(uuid) to authenticated, anon;
grant execute on function public.is_business_owner(uuid) to authenticated, anon;
grant execute on function public.template_business_id(uuid) to authenticated, anon;
grant execute on function public.customer_business_id(uuid) to authenticated, anon;
grant execute on function public.card_business_id(uuid) to authenticated, anon;

-- ---------------------------------------------------------------------
-- Activar RLS en TODAS las tablas. Sin excepción.
-- ---------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'platform_admins', 'businesses', 'business_users', 'card_templates',
    'template_locations', 'customers', 'cards', 'stamp_events',
    'redemptions', 'campaigns', 'messages', 'referrals', 'apple_devices'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
  end loop;
end;
$$;

-- Limpieza idempotente: borrar políticas previas de estas tablas.
do $$
declare
  r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'platform_admins', 'businesses', 'business_users', 'card_templates',
        'template_locations', 'customers', 'cards', 'stamp_events',
        'redemptions', 'campaigns', 'messages', 'referrals', 'apple_devices'
      )
  loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- platform_admins
-- Solo lectura de la propia fila. El alta se hace con service role.
-- ---------------------------------------------------------------------
create policy platform_admins_select_self on public.platform_admins
  for select to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- businesses
-- ---------------------------------------------------------------------
create policy businesses_select on public.businesses
  for select to authenticated
  using (public.is_business_member(id));

create policy businesses_update on public.businesses
  for update to authenticated
  using (public.is_business_owner(id))
  with check (public.is_business_owner(id));

create policy businesses_insert on public.businesses
  for insert to authenticated
  with check (public.is_platform_admin());

create policy businesses_delete on public.businesses
  for delete to authenticated
  using (public.is_platform_admin());

-- ---------------------------------------------------------------------
-- business_users
-- ---------------------------------------------------------------------
create policy business_users_select on public.business_users
  for select to authenticated
  using (public.is_business_member(business_id));

create policy business_users_insert on public.business_users
  for insert to authenticated
  with check (public.is_business_owner(business_id));

create policy business_users_update on public.business_users
  for update to authenticated
  using (public.is_business_owner(business_id))
  with check (public.is_business_owner(business_id));

create policy business_users_delete on public.business_users
  for delete to authenticated
  using (public.is_business_owner(business_id));

-- ---------------------------------------------------------------------
-- card_templates
-- ---------------------------------------------------------------------
create policy card_templates_select on public.card_templates
  for select to authenticated
  using (public.is_business_member(business_id));

create policy card_templates_write on public.card_templates
  for all to authenticated
  using (public.is_business_owner(business_id))
  with check (public.is_business_owner(business_id));

-- ---------------------------------------------------------------------
-- template_locations
-- ---------------------------------------------------------------------
create policy template_locations_select on public.template_locations
  for select to authenticated
  using (public.is_business_member(public.template_business_id(template_id)));

create policy template_locations_write on public.template_locations
  for all to authenticated
  using (public.is_business_owner(public.template_business_id(template_id)))
  with check (public.is_business_owner(public.template_business_id(template_id)));

-- ---------------------------------------------------------------------
-- customers
-- El empleado NO ve la lista de clientes (§3). Solo el dueño.
-- La caja resuelve un cliente puntual por el servidor, nunca leyendo la tabla.
-- ---------------------------------------------------------------------
create policy customers_select on public.customers
  for select to authenticated
  using (public.is_business_owner(business_id));

create policy customers_write on public.customers
  for all to authenticated
  using (public.is_business_owner(business_id))
  with check (public.is_business_owner(business_id));

-- ---------------------------------------------------------------------
-- cards
-- No contienen datos personales, así que el empleado sí puede leerlas.
-- ---------------------------------------------------------------------
create policy cards_select on public.cards
  for select to authenticated
  using (public.is_business_member(public.customer_business_id(customer_id)));

create policy cards_write on public.cards
  for all to authenticated
  using (public.is_business_owner(public.customer_business_id(customer_id)))
  with check (public.is_business_owner(public.customer_business_id(customer_id)));

-- ---------------------------------------------------------------------
-- stamp_events — log. Se lee y se agrega; nunca se edita ni se borra.
-- ---------------------------------------------------------------------
create policy stamp_events_select on public.stamp_events
  for select to authenticated
  using (public.is_business_member(public.card_business_id(card_id)));

create policy stamp_events_insert on public.stamp_events
  for insert to authenticated
  with check (
    public.is_business_member(public.card_business_id(card_id))
    and staff_user_id = auth.uid()
  );

-- ---------------------------------------------------------------------
-- redemptions
-- ---------------------------------------------------------------------
create policy redemptions_select on public.redemptions
  for select to authenticated
  using (public.is_business_member(public.card_business_id(card_id)));

create policy redemptions_insert on public.redemptions
  for insert to authenticated
  with check (
    public.is_business_member(public.card_business_id(card_id))
    and staff_user_id = auth.uid()
  );

-- ---------------------------------------------------------------------
-- campaigns
-- ---------------------------------------------------------------------
create policy campaigns_select on public.campaigns
  for select to authenticated
  using (public.is_business_member(business_id));

create policy campaigns_write on public.campaigns
  for all to authenticated
  using (public.is_business_owner(business_id))
  with check (public.is_business_owner(business_id));

-- ---------------------------------------------------------------------
-- messages — solo el dueño; el log de mensajes revela datos de clientes.
-- ---------------------------------------------------------------------
create policy messages_select on public.messages
  for select to authenticated
  using (public.is_business_owner(public.customer_business_id(customer_id)));

-- ---------------------------------------------------------------------
-- referrals
-- ---------------------------------------------------------------------
create policy referrals_select on public.referrals
  for select to authenticated
  using (public.is_business_owner(public.card_business_id(referrer_card_id)));

-- ---------------------------------------------------------------------
-- apple_devices — solo el servidor (service role) toca esta tabla.
-- Sin políticas: RLS activo y sin política = nadie con llave anon pasa.
-- ---------------------------------------------------------------------
