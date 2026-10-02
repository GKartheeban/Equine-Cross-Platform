-- EquineTrade update 007: let logged-in buyers get a seller's phone number
-- for Call / WhatsApp. The number is read from the seller's verified login,
-- only for live listings, and only by logged-in users (never by anonymous visitors).
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.

create or replace function public.get_seller_phone(p_listing_id uuid)
returns text
language sql
stable
security definer
set search_path = public, auth
as $$
  select u.phone
  from public.listings l
  join auth.users u on u.id = l.seller_id
  where l.id = p_listing_id
    and l.status = 'live';
$$;

-- Only logged-in users may call it
revoke all on function public.get_seller_phone(uuid) from public;
revoke all on function public.get_seller_phone(uuid) from anon;
grant execute on function public.get_seller_phone(uuid) to authenticated;

notify pgrst, 'reload schema';
