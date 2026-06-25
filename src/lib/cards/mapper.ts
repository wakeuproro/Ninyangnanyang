import type {
  AnimalType,
  CatCard,
  NewCatCard,
  Rarity,
  Stats,
  TimeOfDay,
  Weather,
} from '@/types'

/** DB(cat_cards) 행 형태 — snake_case */
export interface CatCardRow {
  id: string
  owner_id: string
  dex_no: number
  name: string | null
  animal_type: AnimalType
  photo_url: string
  cutout_url: string | null
  rarity: Rarity
  tribe: string | null
  stats: Stats
  ability_text: string | null
  bg_theme: string | null
  region: string | null
  lat: number | null
  lng: number | null
  captured_at: string
  time_of_day: TimeOfDay | null
  weather: Weather | null
  season: string | null
  intimacy: number
  is_favorite: boolean
  created_at: string
}

/** INSERT 직전 행 (서버 관리 필드 제외) */
export type CatCardInsert = Omit<
  CatCardRow,
  'id' | 'dex_no' | 'intimacy' | 'is_favorite' | 'created_at'
>

export function toInsertRow(
  card: NewCatCard,
  ownerId: string,
  photoUrl: string,
  cutoutUrl: string | null,
): CatCardInsert {
  return {
    owner_id: ownerId,
    name: card.name,
    animal_type: card.animalType,
    photo_url: photoUrl,
    cutout_url: cutoutUrl,
    rarity: card.rarity,
    tribe: card.tribe,
    stats: card.stats,
    ability_text: card.abilityText,
    bg_theme: card.bgTheme,
    region: card.region,
    lat: card.lat,
    lng: card.lng,
    captured_at: card.capturedAt,
    time_of_day: card.timeOfDay,
    weather: card.weather,
    season: card.season,
  }
}

export function fromRow(row: CatCardRow): CatCard {
  return {
    id: row.id,
    ownerId: row.owner_id,
    dexNo: row.dex_no,
    name: row.name,
    animalType: row.animal_type,
    photoUrl: row.photo_url,
    cutoutUrl: row.cutout_url,
    rarity: row.rarity,
    tribe: row.tribe,
    stats: row.stats,
    abilityText: row.ability_text,
    bgTheme: row.bg_theme,
    region: row.region,
    lat: row.lat,
    lng: row.lng,
    capturedAt: row.captured_at,
    timeOfDay: row.time_of_day,
    weather: row.weather,
    season: row.season,
    intimacy: row.intimacy,
    isFavorite: row.is_favorite,
    createdAt: row.created_at,
  }
}
