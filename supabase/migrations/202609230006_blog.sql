-- Drafts and publications are separate so a public database query cannot expose a draft.
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  document jsonb not null check (jsonb_typeof(document) = 'object'),
  version integer not null default 1 check (version > 0),
  public_slug text unique,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  updated_by uuid not null references auth.users(id)
);

create table public.blog_publications (
  post_id uuid primary key references public.blog_posts(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 160),
  document jsonb not null check (jsonb_typeof(document) = 'object'),
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index blog_publications_date_idx on public.blog_publications(published_at desc, post_id);
create index blog_posts_updated_idx on public.blog_posts(updated_at desc, id);
alter table public.blog_posts enable row level security;
alter table public.blog_publications enable row level security;
revoke all on public.blog_posts from anon, authenticated;
revoke all on public.blog_publications from anon, authenticated;
grant select on public.blog_posts to authenticated;
grant insert(document, updated_by) on public.blog_posts to authenticated;
grant update(document, updated_by, version) on public.blog_posts to authenticated;
grant select on public.blog_publications to anon, authenticated;

create policy "administrators manage article drafts" on public.blog_posts
  for all to authenticated using ((select public.is_current_account_admin()))
  with check ((select public.is_current_account_admin()) and updated_by = (select auth.uid()));
create policy "visitors read only publications" on public.blog_publications
  for select to anon, authenticated using (true);

create function public.guard_blog_draft_update() returns trigger
language plpgsql set search_path = public as $$
begin
  if old.public_slug is not null and new.document->>'slug' is distinct from old.public_slug then
    raise exception 'Published URL is immutable' using errcode = '23514';
  end if;
  if new.version <> old.version + 1 then
    raise exception 'Article revision must advance exactly once' using errcode = '40001';
  end if;
  new.updated_at := now();
  return new;
end;
$$;
create trigger blog_draft_update before update on public.blog_posts
  for each row execute function public.guard_blog_draft_update();

create function public.set_blog_publication(p_id uuid, p_version integer, p_publish boolean)
returns void language plpgsql security definer set search_path = public as $$
declare
  post public.blog_posts;
begin
  if not public.is_current_account_admin() then
    raise exception 'Administrator required' using errcode = '42501';
  end if;
  if p_version is null or p_version < 1 or p_publish is null then
    raise exception 'Publication arguments are required' using errcode = '22023';
  end if;
  select * into post from public.blog_posts where id = p_id for update;
  if not found then raise exception 'Article not found' using errcode = 'P0002'; end if;
  if post.version <> p_version then raise exception 'Article revision conflict' using errcode = '40001'; end if;
  if p_publish then
    if coalesce(jsonb_typeof(post.document->'blocks'), '') <> 'array' then
      raise exception 'Article blocks must be an array' using errcode = '23514';
    end if;
    if coalesce(length(trim(post.document->>'title')), 0) = 0
      or coalesce(length(trim(post.document->>'excerpt')), 0) = 0
      or coalesce(length(trim(post.document->>'authorName')), 0) = 0
      or jsonb_array_length(post.document->'blocks') = 0
      or not exists (select 1 from jsonb_array_elements(post.document->'blocks') b where length(trim(b->>'text')) > 0)
      or (coalesce(post.document->>'coverImageUrl', '') <> '' and coalesce(length(trim(post.document->>'coverImageAlt')), 0) = 0)
    then raise exception 'Incomplete article' using errcode = '23514'; end if;
    insert into public.blog_publications(post_id, slug, document, published_at, updated_at)
      values(post.id, post.document->>'slug', post.document, coalesce(post.published_at, now()), now())
      on conflict (post_id) do update set document = excluded.document, updated_at = now();
    update public.blog_posts set public_slug = post.document->>'slug',
      published_at = coalesce(post.published_at, now()), updated_by = auth.uid(), version = version + 1 where id = post.id;
  else
    delete from public.blog_publications where post_id = post.id;
    update public.blog_posts set published_at = null, updated_by = auth.uid(), version = version + 1 where id = post.id;
  end if;
end;
$$;
revoke all on function public.set_blog_publication(uuid, integer, boolean) from public, anon;
grant execute on function public.set_blog_publication(uuid, integer, boolean) to authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('blog-images', 'blog-images', true, 4194304, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy "administrators upload blog images" on storage.objects
  for insert to authenticated with check (bucket_id = 'blog-images' and (select public.is_current_account_admin()));
create policy "administrators read blog image metadata" on storage.objects
  for select to authenticated using (bucket_id = 'blog-images' and (select public.is_current_account_admin()));
