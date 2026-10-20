-- Funções usadas só pelo servidor (webhooks do Mercado Pago, página de pagamento).
-- O servidor prova quem é com SERVER_SECRET; o banco guarda apenas o hash.

create schema if not exists privado;
revoke all on schema privado from public, anon, authenticated;
create table privado.config (id int primary key default 1 check (id = 1), secret_hash text not null);

create or replace function privado.ok(p_secret text) returns boolean
language sql stable security definer set search_path = privado, extensions as $$
  select exists(select 1 from privado.config where secret_hash = encode(extensions.digest(p_secret, 'sha256'), 'hex'));
$$;

-- Página pública de pagamento (link mandado no WhatsApp): só dados mínimos
create or replace function public.pagamento_publico(p_token text)
returns table(mensalidade_id uuid, escola_id uuid, escola text, aluno text, referencia text, valor numeric, vencimento date, status text, chave_pix text, nome_pix text, cidade text, tem_mp boolean)
language sql stable security definer set search_path = public as $$
  select m.id, e.id, e.nome, split_part(a.nome,' ',1), m.referencia, m.valor, m.vencimento, m.status, e.chave_pix, coalesce(e.nome_pix,e.nome), e.cidade,
         exists(select 1 from public.escola_segredos s where s.escola_id = e.id and s.mp_access_token is not null)
  from public.mensalidades m join public.alunos a on a.id = m.aluno_id join public.escolas e on e.id = m.escola_id
  where m.token = p_token and length(p_token) >= 16;
$$;
grant execute on function public.pagamento_publico(text) to anon, authenticated;

-- A escola salva o próprio token do Mercado Pago (não dá para ler de volta pelo app)
create or replace function public.salvar_mp_token(p_escola uuid, p_token text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_membro(p_escola) then raise exception 'sem acesso'; end if;
  insert into public.escola_segredos(escola_id, mp_access_token, updated_at) values (p_escola, nullif(trim(p_token),''), now())
  on conflict (escola_id) do update set mp_access_token = excluded.mp_access_token, updated_at = now();
end $$;
revoke all on function public.salvar_mp_token(uuid,text) from public;
grant execute on function public.salvar_mp_token(uuid,text) to authenticated;

create or replace function public.tem_mp_token(p_escola uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_membro(p_escola) and exists(select 1 from public.escola_segredos where escola_id = p_escola and mp_access_token is not null);
$$;
grant execute on function public.tem_mp_token(uuid) to authenticated;

-- Servidor: token MP de uma escola
create or replace function public.srv_mp_token(p_secret text, p_escola uuid) returns text
language plpgsql stable security definer set search_path = public as $$
begin
  if not privado.ok(p_secret) then raise exception 'negado'; end if;
  return (select mp_access_token from public.escola_segredos where escola_id = p_escola);
end $$;

-- Servidor: marca mensalidade como paga (webhook) e registra o recibo
create or replace function public.srv_marcar_paga(p_secret text, p_mensalidade uuid, p_mp_payment text)
returns boolean language plpgsql security definer set search_path = public as $$
declare m record;
begin
  if not privado.ok(p_secret) then raise exception 'negado'; end if;
  update public.mensalidades set status = 'paga', pago_em = now(), forma = 'mercado_pago', mp_payment_id = p_mp_payment
    where id = p_mensalidade and status = 'aberta' returning * into m;
  if m.id is null then return false; end if;
  insert into public.envios(escola_id, aluno_id, tipo, descricao) values (m.escola_id, m.aluno_id, 'recibo', 'Pix recebido pelo Mercado Pago · R$ ' || to_char(m.valor,'FM999G990D00'));
  return true;
end $$;

-- Servidor: guarda o id do pagamento MP gerado para a mensalidade
create or replace function public.srv_set_mp_payment(p_secret text, p_mensalidade uuid, p_mp_payment text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not privado.ok(p_secret) then raise exception 'negado'; end if;
  update public.mensalidades set mp_payment_id = p_mp_payment where id = p_mensalidade and status = 'aberta';
end $$;

-- Servidor: atualiza o plano da escola (assinatura do sistema)
create or replace function public.srv_set_plano(p_secret text, p_escola uuid, p_status text, p_preapproval text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not privado.ok(p_secret) then raise exception 'negado'; end if;
  update public.escolas set plano_status = p_status, mp_preapproval_id = coalesce(p_preapproval, mp_preapproval_id) where id = p_escola;
end $$;

revoke all on function public.srv_mp_token(text,uuid), public.srv_marcar_paga(text,uuid,text), public.srv_set_mp_payment(text,uuid,text), public.srv_set_plano(text,uuid,text,text) from public;
grant execute on function public.srv_mp_token(text,uuid), public.srv_marcar_paga(text,uuid,text), public.srv_set_mp_payment(text,uuid,text), public.srv_set_plano(text,uuid,text,text) to anon, authenticated;
-- O hash do SERVER_SECRET é inserido à parte (fora do repositório):
-- insert into privado.config(id, secret_hash) values (1, '<sha256 do segredo>');

-- 0003: o Supabase concede EXECUTE ao anon por padrão; tira de quem não deve ser público.
revoke execute on function public.criar_escola(text,text,text,text), public.gerar_mensalidades(uuid,text), public.is_membro(uuid), public.salvar_mp_token(uuid,text), public.tem_mp_token(uuid) from anon;
revoke execute on function public.protege_plano() from anon, authenticated, public;
revoke execute on function public.srv_mp_token(text,uuid), public.srv_marcar_paga(text,uuid,text), public.srv_set_mp_payment(text,uuid,text), public.srv_set_plano(text,uuid,text,text) from authenticated;
-- Ficam públicos de propósito: pagamento_publico (só dados mínimos, por token de 24 caracteres)
-- e srv_* (exigem SERVER_SECRET; o banco guarda só o hash).
