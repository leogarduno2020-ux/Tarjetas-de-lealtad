-- =====================================================================
-- Funciones de operación
-- Se ejecutan desde el servidor con la service role key. Son SECURITY
-- DEFINER para que el alta completa de un negocio ocurra en una sola
-- transacción: o queda todo, o no queda nada.
-- =====================================================================

-- ---------------------------------------------------------------------
-- admin_create_business
-- Crea el negocio, asigna al dueño y deja una plantilla de lealtad
-- inicial lista para editar. Devuelve el id del negocio.
-- ---------------------------------------------------------------------
create or replace function public.admin_create_business(
  p_name            text,
  p_slug            text,
  p_owner_user_id   uuid,
  p_plan            text default 'basico',
  p_address         text default null,
  p_whatsapp_phone  text default null,
  p_stamps_required int default 8,
  p_reward          text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_business_id uuid;
begin
  insert into public.businesses (name, slug, plan, address, whatsapp_phone)
  values (p_name, p_slug, p_plan, p_address, p_whatsapp_phone)
  returning id into v_business_id;

  insert into public.business_users (business_id, user_id, role)
  values (v_business_id, p_owner_user_id, 'business_owner')
  on conflict (business_id, user_id) do update set role = 'business_owner';

  insert into public.card_templates (
    business_id, name, type, stamps_required, reward_description, relevant_text
  )
  values (
    v_business_id,
    'Tarjeta de lealtad',
    'sellos',
    p_stamps_required,
    coalesce(p_reward, 'Premio por definir'),
    'Estás cerca de ' || p_name
  );

  return v_business_id;
end;
$$;

revoke all on function public.admin_create_business(text, text, uuid, text, text, text, int, text) from public;

-- ---------------------------------------------------------------------
-- business_dashboard_stats
-- Resumen del panel de un negocio. Corre con los permisos del que llama,
-- validando la membresía explícitamente: una llave anon robada no saca
-- nada de un negocio ajeno.
-- ---------------------------------------------------------------------
create or replace function public.business_dashboard_stats(
  p_business_id uuid,
  p_days        int default 7
)
returns table (
  visitas_periodo   bigint,
  clientes_nuevos   bigint,
  canjes_periodo    bigint,
  clientes_activos  bigint,
  clientes_inactivos bigint,
  tarjetas_totales  bigint
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_desde timestamptz := now() - make_interval(days => greatest(p_days, 1));
begin
  if not public.is_business_member(p_business_id) then
    raise exception 'Sin acceso a este negocio.' using errcode = '42501';
  end if;

  return query
  select
    (select count(*) from public.stamp_events se
       join public.cards c on c.id = se.card_id
       join public.customers cu on cu.id = c.customer_id
      where cu.business_id = p_business_id
        and se.reason <> 'canje'
        and se.created_at >= v_desde),
    (select count(*) from public.customers
      where business_id = p_business_id and created_at >= v_desde),
    (select count(*) from public.redemptions r
       join public.cards c on c.id = r.card_id
       join public.customers cu on cu.id = c.customer_id
      where cu.business_id = p_business_id and r.created_at >= v_desde),
    (select count(*) from public.customers
      where business_id = p_business_id and status = 'activo'),
    (select count(*) from public.customers
      where business_id = p_business_id and status = 'inactivo'),
    (select count(*) from public.cards c
       join public.customers cu on cu.id = c.customer_id
      where cu.business_id = p_business_id);
end;
$$;

grant execute on function public.business_dashboard_stats(uuid, int) to authenticated;
