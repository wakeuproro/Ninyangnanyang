import { removeBackground, type Config } from '@imgly/background-removal'

// 브라우저에서 배경 제거(누끼). 첫 호출 시 모델 에셋을 받아오므로 다소 느릴 수 있음.
// 만약 에셋 404가 나면 publicPath 를 CDN으로 지정: { publicPath: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1/dist/' }
const config: Config = {}

/** 이미지(Blob/File)에서 배경을 제거해 투명 PNG Blob 반환 */
export async function cutout(input: Blob): Promise<Blob> {
  return removeBackground(input, config)
}
