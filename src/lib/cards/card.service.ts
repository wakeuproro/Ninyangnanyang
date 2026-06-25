import { supabase } from '@/lib/supabase/client'
import { ensureSession } from '@/lib/auth/session'
import type { CatCard, NewCatCard } from '@/types'
import { fromRow, toInsertRow, type CatCardRow } from './mapper'

async function uploadImage(
  userId: string,
  blob: Blob,
  kind: 'photo' | 'cutout',
  contentType: string,
): Promise<string> {
  const ext = (contentType.split('/')[1] ?? 'png').replace('jpeg', 'jpg')
  const path = `${userId}/${crypto.randomUUID()}-${kind}.${ext}`
  const { error } = await supabase.storage.from('cards').upload(path, blob, {
    contentType,
    upsert: false,
  })
  if (error) throw new Error(`이미지 업로드 실패(${kind}): ${error.message}`)
  return supabase.storage.from('cards').getPublicUrl(path).data.publicUrl
}

/** 캐치한 카드 영속화: 이미지 업로드 → cat_cards INSERT (승인형: 셀러가 누른 뒤 호출) */
export async function saveCatchedCard(input: {
  card: NewCatCard
  photoBlob: Blob
  cutoutBlob: Blob
}): Promise<CatCard> {
  const user = await ensureSession()
  const photoType = input.photoBlob.type || 'image/jpeg'
  const photoUrl = await uploadImage(user.id, input.photoBlob, 'photo', photoType)
  const cutoutUrl = await uploadImage(user.id, input.cutoutBlob, 'cutout', 'image/png')

  const row = toInsertRow(input.card, user.id, photoUrl, cutoutUrl)
  const { data, error } = await supabase.from('cat_cards').insert(row).select().single()
  if (error) throw new Error(`카드 저장 실패: ${error.message}`)
  return fromRow(data as CatCardRow)
}

/** 내 도감 카드 목록 (최신순) */
export async function listMyCards(): Promise<CatCard[]> {
  await ensureSession()
  const { data, error } = await supabase
    .from('cat_cards')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(`도감 불러오기 실패: ${error.message}`)
  return (data as CatCardRow[]).map(fromRow)
}
