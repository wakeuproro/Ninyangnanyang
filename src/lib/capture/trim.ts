// 누끼 결과(투명 PNG)의 투명 여백을 잘라 고양이가 프레임을 꽉 채우게 하고,
// 동시에 누끼 "품질"을 판정한다. (남은 영역이 너무 작거나 / 구멍이 많으면 경고)

export interface CutoutQuality {
  ok: boolean
  opaqueRatio: number // 불투명 픽셀 / 전체 (너무 작으면 거의 다 지워진 것)
  fillRatio: number // 불투명 픽셀 / bbox 면적 (낮으면 구멍 많음·몸통 사라짐)
  message?: string
}

export interface TrimResult {
  blob: Blob
  quality: CutoutQuality
}

export async function trimAndAssess(blob: Blob, alphaThreshold = 12): Promise<TrimResult> {
  const bitmap = await createImageBitmap(blob)
  const { width, height } = bitmap
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return { blob, quality: { ok: true, opaqueRatio: 1, fillRatio: 1 } }
  ctx.drawImage(bitmap, 0, 0)

  const { data } = ctx.getImageData(0, 0, width, height)
  let minX = width
  let minY = height
  let maxX = 0
  let maxY = 0
  let opaque = 0
  let found = false
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3]
      if (alpha > alphaThreshold) {
        opaque++
        found = true
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  const imageArea = width * height
  if (!found) {
    return {
      blob,
      quality: { ok: false, opaqueRatio: 0, fillRatio: 0, message: '고양이를 찾지 못했어요.' },
    }
  }

  const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.04)
  minX = Math.max(0, minX - pad)
  minY = Math.max(0, minY - pad)
  maxX = Math.min(width - 1, maxX + pad)
  maxY = Math.min(height - 1, maxY + pad)

  const w = maxX - minX + 1
  const h = maxY - minY + 1
  const opaqueRatio = opaque / imageArea
  const fillRatio = opaque / (w * h)

  let ok = true
  let message: string | undefined
  if (opaqueRatio < 0.02) {
    ok = false
    message = '고양이가 너무 작거나 대부분 지워졌어요.'
  } else if (fillRatio < 0.34) {
    ok = false
    message = '누끼에 빈 곳이 많아요. 몸통 일부가 사라졌을 수 있어요.'
  }

  const out = document.createElement('canvas')
  out.width = w
  out.height = h
  const outCtx = out.getContext('2d')
  if (!outCtx) return { blob, quality: { ok, opaqueRatio, fillRatio, message } }
  outCtx.drawImage(canvas, minX, minY, w, h, 0, 0, w, h)

  const trimmed = await new Promise<Blob>((resolve) => {
    out.toBlob((b) => resolve(b ?? blob), 'image/png')
  })
  return { blob: trimmed, quality: { ok, opaqueRatio, fillRatio, message } }
}
