import '@tensorflow/tfjs'
import * as cocoSsd from '@tensorflow-models/coco-ssd'

// 온디바이스 객체 인식으로 "동물이 찍혔는지" 게이트. (사물만 찍으면 카드화 막기)

let modelPromise: Promise<cocoSsd.ObjectDetection> | null = null
function getModel() {
  if (!modelPromise) modelPromise = cocoSsd.load({ base: 'lite_mobilenet_v2' })
  return modelPromise
}

// COCO 동물 클래스 (전 동물 확장 방향과 일치)
const ANIMALS = new Set([
  'cat',
  'dog',
  'bird',
  'horse',
  'sheep',
  'cow',
  'elephant',
  'bear',
  'zebra',
  'giraffe',
])

export interface DetectResult {
  isAnimal: boolean
  isCat: boolean
  top: string | null
  score: number
}

export async function detectAnimal(blob: Blob): Promise<DetectResult> {
  try {
    const bmp = await createImageBitmap(blob)
    const canvas = document.createElement('canvas')
    canvas.width = bmp.width
    canvas.height = bmp.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return { isAnimal: true, isCat: false, top: null, score: 0 }
    ctx.drawImage(bmp, 0, 0)

    const model = await getModel()
    const preds = await model.detect(canvas)
    const animals = preds.filter((p) => ANIMALS.has(p.class) && p.score > 0.4)
    if (animals.length === 0) {
      const top = preds[0]
      return { isAnimal: false, isCat: false, top: top?.class ?? null, score: top?.score ?? 0 }
    }
    animals.sort((a, b) => b.score - a.score)
    return {
      isAnimal: true,
      isCat: animals.some((a) => a.class === 'cat'),
      top: animals[0].class,
      score: animals[0].score,
    }
  } catch {
    // 모델 로드/추론 실패 시엔 차단하지 않고 통과 (서비스 무중단)
    return { isAnimal: true, isCat: false, top: null, score: 0 }
  }
}
