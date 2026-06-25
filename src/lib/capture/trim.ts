// 누끼 결과(투명 PNG)의 투명 여백을 잘라 고양이가 프레임을 꽉 채우게 함.
// @imgly 결과는 원본 크기를 유지하므로(주변 투명), 카드에 얹기 전 bounding box 크롭 필요.

export async function trimTransparent(blob: Blob, alphaThreshold = 12): Promise<Blob> {
  const bitmap = await createImageBitmap(blob)
  const { width, height } = bitmap
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return blob
  ctx.drawImage(bitmap, 0, 0)

  const { data } = ctx.getImageData(0, 0, width, height)
  let minX = width
  let minY = height
  let maxX = 0
  let maxY = 0
  let found = false
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3]
      if (alpha > alphaThreshold) {
        found = true
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  if (!found) return blob

  // 약간의 여백(4%)
  const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.04)
  minX = Math.max(0, minX - pad)
  minY = Math.max(0, minY - pad)
  maxX = Math.min(width - 1, maxX + pad)
  maxY = Math.min(height - 1, maxY + pad)

  const w = maxX - minX + 1
  const h = maxY - minY + 1
  const out = document.createElement('canvas')
  out.width = w
  out.height = h
  const outCtx = out.getContext('2d')
  if (!outCtx) return blob
  outCtx.drawImage(canvas, minX, minY, w, h, 0, 0, w, h)

  return new Promise<Blob>((resolve) => {
    out.toBlob((b) => resolve(b ?? blob), 'image/png')
  })
}
