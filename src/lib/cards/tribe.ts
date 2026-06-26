// 털색/무늬 부족(Tribe). 추후 비전 분류로 자동 판별, 지금은 hint 기반.

export type Tribe =
  | 'cheese'
  | 'mackerel'
  | 'tuxedo'
  | 'calico'
  | 'black'
  | 'white'
  | 'cow'
  | 'gray'
  | 'unknown'

export const TRIBE_LABEL: Record<Tribe, string> = {
  cheese: '치즈냥',
  mackerel: '고등어',
  tuxedo: '턱시도',
  calico: '삼색',
  black: '까만냥',
  white: '하얀냥',
  cow: '젖소냥',
  gray: '회색냥',
  unknown: '알 수 없음',
}

export const TRIBE_COLOR: Record<Tribe, string> = {
  cheese: '#f0a23c',
  mackerel: '#7b8a99',
  tuxedo: '#2b2b2b',
  calico: '#caa15a',
  black: '#333333',
  white: '#e8e8e8',
  cow: '#bfbfbf',
  gray: '#9aa0a6',
  unknown: '#cccccc',
}

/** 셀러가 직접 고를 수 있는 털색 (unknown 제외) */
export const PICKABLE_TRIBES: Tribe[] = [
  'cheese',
  'mackerel',
  'tuxedo',
  'calico',
  'black',
  'white',
  'cow',
  'gray',
]

/** 비전 분류 도입 전 임시: 힌트 없으면 unknown */
export function resolveTribe(hint?: Tribe): Tribe {
  return hint ?? 'unknown'
}
