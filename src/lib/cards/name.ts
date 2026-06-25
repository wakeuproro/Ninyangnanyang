import type { Rarity } from '@/types'
import { hashSeed } from './seed'

// 희귀도별 이름 풀. 결정적(seed 기반) → 같은 고양이는 항상 같은 별명.
// 셀러가 나중에 직접 rename 가능(이건 기본값).

const PLAIN = [
  '나비', '까망이', '노랑이', '치즈', '두부', '콩이', '모찌', '양말', '깜냥', '호빵',
  '참치', '보리', '단추', '깨비', '뽀삐', '까미', '누렁이', '젤리', '곰이', '초코',
]

const COOL = [
  '루나', '코코', '레오', '미오', '별이', '라떼', '시로', '모카', '망고', '재즈',
  '노아', '유키', '체리', '피노', '바닐라',
]

const EPIC = [
  '아폴로', '펠릭스', '카이저', '오딘', '제우스', '아르테미스', '발더', '네로', '티탄', '오로라',
]

const TITLES = [
  '달빛의', '황금', '그림자', '불꽃', '새벽의', '폭풍의', '별빛', '심연의', '백야의',
]

function pick<T>(arr: T[], seed: string, salt: string): T {
  return arr[hashSeed(`${seed}|${salt}`) % arr.length]
}

/** 희귀도에 맞는 별명 생성 (결정적) */
export function generateName(seed: string, rarity: Rarity): string {
  switch (rarity) {
    case 'legendary':
      return `${pick(TITLES, seed, 'title')} ${pick(EPIC, seed, 'lname')}`
    case 'epic':
      return pick(EPIC, seed, 'name')
    case 'rare':
      return pick(COOL, seed, 'name')
    default:
      return pick(PLAIN, seed, 'name')
  }
}
