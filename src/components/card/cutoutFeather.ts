import type { CSSProperties } from 'react'

// 누끼 이미지 가장자리 페더 + 그림자 (거친 경계 완화, floating 느낌). CatCard/DexCell 공용.
export const cutoutFeather: CSSProperties = {
  WebkitMaskImage: 'radial-gradient(125% 115% at 50% 45%, black 80%, transparent 97%)',
  maskImage: 'radial-gradient(125% 115% at 50% 45%, black 80%, transparent 97%)',
  filter: 'drop-shadow(0 10px 12px rgba(0,0,0,0.4))',
}
