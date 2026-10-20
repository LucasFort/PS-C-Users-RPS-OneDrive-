-- Mensalidade em Dia: esquema inicial (multi-escola com RLS)

create table public.escolas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo text not null default 'futebol',
  whatsapp text,
  cidade text,
  chave_pix text,
  nome_pix text,
  plano_status text not null default 'trial' check (plano_status in ('trial','ativo','pendente','cancelado')),
  trial_ate date not null default (current_date + 30),
  mp_preapproval_id text,
  modelos jsonb not null default '{}'::jsonb,
  auto jsonb not null default '{"lembrete":true,"cobranca":true,"atraso":true,"ultimo":true,"recibo":true,"aniversario":true,"boasvindas":true,"falta":false}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.escola_membros (
  escola_id uuid not null references public.escolas(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  papel text not null default 'dono' check (papel in ('dono','equipe')),
  created_at timestamptz not null default now(),
  primary key (escola_id, user_id)
);
create index on public.escola_membros(user_id);

-- Segredos (token Mercado Pago da escola): sem políticas, só o servidor (service role) lê.
create table public.escola_segredos (
  escola_id uuid primary key references public.escolas(id) on delete cascade,
  mp_access_token text,
  updated_at timestamptz not null default now()
);

create table public.turmas (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.escolas(id) on delete cascade,
  nome text not null,
  dias int[] not null default '{}',
  hora text not null default '18:00',
  professor text,
  valor numeric(10,2) not null default 0,
  vagas int not null default 20,
  created_at timestamptz not null default now()
);
create index on public.turmas(escola_id);

create table public.alunos (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.escolas(id) on delete cascade,
  turma_id uuid references public.turmas(id) on delete set null,
  nome text not null,
  responsavel text,
  whatsapp text not null,
  valor numeric(10,2) not null,
  dia_vencimento int not null default 10 check (dia_vencimento between 1 and 31),
  nascimento date,
  ativo boolean not null default true,
  inicio date not null default current_date,
  created_at timestamptz not null default now()
);
create index on public.alunos(escola_id);
create index on public.alunos(turma_id);

create table public.mensalidades (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.escolas(id) on delete cascade,
  aluno_id uuid not null references public.alunos(id) on delete cascade,
  referencia text not null check (referencia ~ '^\d{4}-\d{2}$'),
  valor numeric(10,2) not null,
  vencimento date not null,
  status text not null default 'aberta' check (status in ('aberta','paga','cancelada')),
  pago_em timestamptz,
  forma text check (forma in ('pix','dinheiro','cartao','mercado_pago')),
  token text not null unique default encode(extensions.gen_random_bytes(12),'hex'),
  mp_payment_id text,
  created_at timestamptz not null default now(),
  unique (aluno_id, referencia)
);
create index on public.mensalidades(escola_id, referencia);

create table public.envios (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.escolas(id) on delete cascade,
  aluno_id uuid references public.alunos(id) on delete set null,
  tipo text not null,
  descricao text not null,
  created_at timestamptz not null default now()
);
create index on public.envios(escola_id, created_at desc);

create table public.chamadas (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.escolas(id) on delete cascade,
  turma_id uuid not null references public.turmas(id) on delete cascade,
  data date not null,
  presencas jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (turma_id, data)
);
create index on public.chamadas(escola_id, data);

create table public.despesas (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.escolas(id) on delete cascade,
  descricao text not null,
  categoria text not null default 'Outros',
  valor numeric(10,2) not null,
  referencia text not null check (referencia ~ '^\d{4}-\d{2}$'),
  created_at timestamptz not null default now()
);
create index on public.despesas(escola_id, referencia);

-- Quem é membro de qual escola
create or replace function public.is_membro(eid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.escola_membros where escola_id = eid and user_id = auth.uid());
$$;
revoke all on function public.is_membro(uuid) from public;
grant execute on function public.is_membro(uuid) to authenticated;

alter table public.escolas enable row level security;
alter table public.escola_membros enable row level security;
alter table public.escola_segredos enable row level security;
alter table public.turmas enable row level security;
alter table public.alunos enable row level security;
alter table public.mensalidades enable row level security;
alter table public.envios enable row level security;
alter table public.chamadas enable row level security;
alter table public.despesas enable row level security;

create policy "membro lê escola" on public.escolas for select to authenticated using (public.is_membro(id));
create policy "dono edita escola" on public.escolas for update to authenticated using (public.is_membro(id)) with check (public.is_membro(id));
create policy "vê os próprios vínculos" on public.escola_membros for select to authenticated using (user_id = auth.uid());

do $$
declare t text;
begin
  foreach t in array array['turmas','alunos','mensalidades','envios','chamadas','despesas'] loop
    execute format('create policy "membro gerencia %1$s" on public.%1$I for all to authenticated using (public.is_membro(escola_id)) with check (public.is_membro(escola_id))', t);
  end loop;
end $$;

-- Campos de plano não podem ser alterados pelo cliente (só pelo servidor)
create or replace function public.protege_plano() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.role() = 'authenticated' then
    new.plano_status := old.plano_status;
    new.trial_ate := old.trial_ate;
    new.mp_preapproval_id := old.mp_preapproval_id;
  end if;
  return new;
end $$;
create trigger escolas_protege_plano before update on public.escolas for each row execute function public.protege_plano();

-- Cadastro: cria a escola e liga o usuário como dono
create or replace function public.criar_escola(p_nome text, p_tipo text, p_whatsapp text, p_cidade text)
returns uuid language plpgsql security definer set search_path = public as $$
declare eid uuid;
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;
  select escola_id into eid from public.escola_membros where user_id = auth.uid() limit 1;
  if eid is not null then return eid; end if;
  insert into public.escolas(nome, tipo, whatsapp, cidade, nome_pix)
    values (p_nome, coalesce(nullif(p_tipo,''),'futebol'), p_whatsapp, p_cidade, p_nome)
    returning id into eid;
  insert into public.escola_membros(escola_id, user_id, papel) values (eid, auth.uid(), 'dono');
  return eid;
end $$;
revoke all on function public.criar_escola(text,text,text,text) from public;
grant execute on function public.criar_escola(text,text,text,text) to authenticated;

-- Gera as mensalidades do mês para os alunos ativos que ainda não têm
create or replace function public.gerar_mensalidades(p_escola uuid, p_ref text)
returns int language plpgsql security definer set search_path = public as $$
declare n int; y int; m int; ult int;
begin
  if not public.is_membro(p_escola) then raise exception 'sem acesso'; end if;
  y := split_part(p_ref,'-',1)::int; m := split_part(p_ref,'-',2)::int;
  ult := extract(day from (make_date(y,m,1) + interval '1 month - 1 day'))::int;
  insert into public.mensalidades(escola_id, aluno_id, referencia, valor, vencimento)
    select a.escola_id, a.id, p_ref, a.valor, make_date(y, m, least(a.dia_vencimento, ult))
    from public.alunos a
    where a.escola_id = p_escola and a.ativo and to_char(a.inicio,'YYYY-MM') <= p_ref
  on conflict (aluno_id, referencia) do nothing;
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.gerar_mensalidades(uuid,text) from public;
grant execute on function public.gerar_mensalidades(uuid,text) to authenticated;
