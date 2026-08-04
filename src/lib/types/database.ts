/**
 * Tipos de la base de datos.
 *
 * Escritos a mano para que coincidan con supabase/migrations. Cuando el
 * proyecto de Supabase esté arriba se pueden regenerar con:
 *   npx supabase gen types typescript --project-id <ref> > src/lib/types/database.ts
 */

export type Plan = "basico" | "pro" | "comercio";
export type BusinessStatus = "activo" | "pausado" | "cancelado";
export type BusinessRole = "business_owner" | "business_staff";
export type TemplateType = "sellos" | "puntos";
export type CustomerStatus = "activo" | "inactivo" | "baja";
export type StampReason =
  | "compra"
  | "hora_doble"
  | "referido"
  | "manual"
  | "canje";
export type CampaignType =
  | "inactivos"
  | "cumpleanos"
  | "hora_doble"
  | "difusion";
export type MessageChannel = "whatsapp" | "wallet_push";
export type MessageStatus = "enviado" | "entregado" | "fallido";

export interface Business {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  color_bg: string;
  color_text: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  whatsapp_phone: string | null;
  plan: Plan;
  status: BusinessStatus;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessUser {
  id: string;
  business_id: string;
  user_id: string;
  role: BusinessRole;
  created_at: string;
}

export interface CardTemplate {
  id: string;
  business_id: string;
  name: string;
  type: TemplateType;
  stamps_required: number | null;
  points_per_peso: number | null;
  reward_description: string | null;
  terms: string | null;
  relevant_text: string | null;
  provider_class_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateLocation {
  id: string;
  template_id: string;
  name: string;
  lat: number;
  lng: number;
  relevant_text: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  phone: string;
  name: string;
  email: string | null;
  birthday: string | null;
  consent_at: string;
  consent_ip: string | null;
  last_visit_at: string | null;
  status: CustomerStatus;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  customer_id: string;
  template_id: string;
  serial_number: string;
  auth_token: string;
  stamps_count: number;
  points_balance: number;
  redemptions_count: number;
  reward_available: boolean;
  apple_pass_url: string | null;
  google_pass_url: string | null;
  provider_object_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface StampEvent {
  id: string;
  card_id: string;
  staff_user_id: string | null;
  delta: number;
  reason: StampReason;
  ticket_amount: number | null;
  created_at: string;
}

export interface Redemption {
  id: string;
  card_id: string;
  reward_text: string;
  staff_user_id: string | null;
  created_at: string;
}

export interface Campaign {
  id: string;
  business_id: string;
  type: CampaignType;
  config: Record<string, unknown>;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  customer_id: string;
  campaign_id: string | null;
  channel: MessageChannel;
  body: string | null;
  status: MessageStatus;
  provider_id: string | null;
  error: string | null;
  sent_at: string;
}

export interface DashboardStats {
  visitas_periodo: number;
  clientes_nuevos: number;
  canjes_periodo: number;
  clientes_activos: number;
  clientes_inactivos: number;
  tarjetas_totales: number;
}
