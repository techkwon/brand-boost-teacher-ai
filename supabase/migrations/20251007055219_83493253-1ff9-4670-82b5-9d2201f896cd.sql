-- 관리자 역할 시스템 구축

-- 1. 역할 Enum 생성
create type public.app_role as enum ('admin', 'user');

-- 2. user_roles 테이블 생성
create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role app_role not null,
    created_at timestamp with time zone default now(),
    unique (user_id, role)
);

-- 3. RLS 활성화
alter table public.user_roles enable row level security;

-- 4. 역할 확인 함수 (SECURITY DEFINER로 RLS 재귀 문제 방지)
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- 5. RLS 정책 - 자신의 역할만 조회 가능
create policy "Users can view their own roles"
on public.user_roles
for select
to authenticated
using (auth.uid() = user_id);

-- 6. RLS 정책 - 관리자만 역할 삽입 가능
create policy "Admins can insert roles"
on public.user_roles
for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

-- 7. RLS 정책 - 관리자만 역할 삭제 가능
create policy "Admins can delete roles"
on public.user_roles
for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));