begin;

drop function if exists public.get_client_portal_invoice_records();

create function public.get_client_portal_invoice_records()
returns table (
  id text, invoice_number text, title text, client_id uuid, project_id uuid,
  quote_id uuid, amount numeric, paid_amount numeric, outstanding_amount numeric,
  currency text, status text, issue_date date, due_date date,
  payment_reference text, notes text, created_at timestamptz,
  updated_at timestamptz, receipts jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  with current_client as (
    select c.id
    from public.clients c
    where c.profile_id = auth.uid()
    limit 1
  ),
  source_rows as (
    select
      s.setting_key,
      case
        when jsonb_typeof(s.setting_value) = 'array' then s.setting_value
        when jsonb_typeof(s.setting_value -> 'records') = 'array'
          then s.setting_value -> 'records'
        when jsonb_typeof(s.setting_value -> 'invoices') = 'array'
          then s.setting_value -> 'invoices'
        when jsonb_typeof(s.setting_value -> 'items') = 'array'
          then s.setting_value -> 'items'
        when jsonb_typeof(s.setting_value -> 'data') = 'array'
          then s.setting_value -> 'data'
        else '[]'::jsonb
      end invoice_array
    from public.settings s
    where s.setting_key in (
      'business_invoices', 'mketics_business_invoices',
      'mk_business_invoices', 'invoice_records', 'invoices',
      'business_invoice_records_v1'
    )
  ),
  items as (
    select e.item
    from source_rows s
    cross join lateral jsonb_array_elements(s.invoice_array) e(item)
  ),
  parsed as (
    select
      i.item,
      nullif(coalesce(i.item->>'client_id', i.item->>'clientId'), '') client_text,
      nullif(coalesce(i.item->>'project_id', i.item->>'projectId'), '') project_text,
      nullif(coalesce(i.item->>'quote_id', i.item->>'quoteId'), '') quote_text,
      nullif(coalesce(i.item->>'amount', i.item->>'total',
        i.item->>'invoiceAmount'), '') amount_text,
      nullif(coalesce(i.item->>'paid_amount', i.item->>'paidAmount'), '') paid_text,
      nullif(coalesce(i.item->>'issue_date', i.item->>'issueDate'), '') issue_text,
      nullif(coalesce(i.item->>'due_date', i.item->>'dueDate'), '') due_text,
      nullif(coalesce(i.item->>'created_at', i.item->>'createdAt'), '') created_text,
      nullif(coalesce(i.item->>'updated_at', i.item->>'updatedAt'), '') updated_text
    from items i
  ),
  rows_out as (
    select
      coalesce(p.item->>'id', p.item->>'invoiceId', md5(p.item::text))::text id,
      coalesce(p.item->>'invoice_number', p.item->>'invoiceNumber',
        p.item->>'number', p.item->>'invoiceNo', 'Invoice')::text invoice_number,
      coalesce(p.item->>'title', p.item->>'invoiceTitle',
        p.item->>'description', 'MKETICS Invoice')::text title,
      case when p.client_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        then p.client_text::uuid end client_id,
      case when p.project_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        then p.project_text::uuid end project_id,
      case when p.quote_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        then p.quote_text::uuid end quote_id,
      case when p.amount_text ~ '^-?[0-9]+([.][0-9]+)?$'
        then p.amount_text::numeric else 0 end amount,
      case when p.paid_text ~ '^-?[0-9]+([.][0-9]+)?$'
        then p.paid_text::numeric else 0 end paid_amount,
      greatest(
        case when p.amount_text ~ '^-?[0-9]+([.][0-9]+)?$'
          then p.amount_text::numeric else 0 end -
        case when p.paid_text ~ '^-?[0-9]+([.][0-9]+)?$'
          then p.paid_text::numeric else 0 end, 0
      ) outstanding_amount,
      coalesce(p.item->>'currency', 'ZAR')::text currency,
      coalesce(p.item->>'status', 'draft')::text status,
      case when p.issue_text ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
        and to_char(to_date(p.issue_text, 'YYYY-MM-DD'), 'YYYY-MM-DD') = p.issue_text
        then to_date(p.issue_text, 'YYYY-MM-DD') end issue_date,
      case when p.due_text ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
        and to_char(to_date(p.due_text, 'YYYY-MM-DD'), 'YYYY-MM-DD') = p.due_text
        then to_date(p.due_text, 'YYYY-MM-DD') end due_date,
      coalesce(p.item->>'payment_reference',
        p.item->>'paymentReference')::text payment_reference,
      coalesce(p.item->>'notes', p.item->>'description')::text notes,
      case when p.created_text ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}[T ][0-9]{2}:[0-9]{2}:[0-9]{2}'
        then p.created_text::timestamptz else null end created_at,
      case when p.updated_text ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}[T ][0-9]{2}:[0-9]{2}:[0-9]{2}'
        then p.updated_text::timestamptz else null end updated_at,
      case when jsonb_typeof(p.item->'receipts') = 'array'
        then p.item->'receipts' else '[]'::jsonb end receipts
    from parsed p
    join current_client cc on p.client_text = cc.id::text
  )
  select r.* from rows_out r
  order by r.created_at desc nulls last, r.id;
$$;

revoke all on function public.get_client_portal_invoice_records()
  from public, anon, authenticated;
grant execute on function public.get_client_portal_invoice_records()
  to authenticated;

commit;
select pg_notify('pgrst', 'reload schema');
