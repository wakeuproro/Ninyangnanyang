import type { Rarity } from '@/types'

const PREFIX: Record<Rarity, string> = {
  common: 'COM',
  uncommon: 'UNC',
  rare: 'RAR',
  epic: 'EPC',
  legendary: 'LEG',
}

/** 일련번호: 등급-날짜-번호 (예: LEG-20240625-0007). dexNo 없으면 ----. */
export function formatSerial(rarity: Rarity, dateIso: string, dexNo?: number): string {
  const date = dateIso.slice(0, 10).replace(/-/g, '')
  const num = dexNo != null ? String(dexNo).padStart(4, '0') : '----'
  return `${PREFIX[rarity]}-${date}-${num}`
}
