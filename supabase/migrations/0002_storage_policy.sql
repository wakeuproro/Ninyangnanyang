-- =====================================================================
-- 'cards' 버킷 업로드 정책. (public 버킷이라 읽기는 자동 허용, 쓰기는 RLS 필요)
-- 경로 규칙: {userId}/{uuid}-{kind}.png  → 첫 폴더명이 본인 uid 여야 업로드 가능.
-- =====================================================================

create policy "cards insert own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'cards'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "cards update own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'cards'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "cards delete own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'cards'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
