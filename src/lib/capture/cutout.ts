import { removeBackground, preload, type Config } from '@imgly/background-removal'

// 누끼(배경 제거). isnet_fp16 = isnet보다 빠름(품질은 약간 낮지만 카드용 충분).
const baseConfig: Config = {
  model: 'isnet_fp16',
  output: { format: 'image/png', quality: 1 },
}

/** 이미지(Blob)에서 배경 제거. onProgress(0~100) 로 진행률 콜백. */
export async function cutout(input: Blob, onProgress?: (pct: number) => void): Promise<Blob> {
  const config: Config = onProgress
    ? {
        ...baseConfig,
        progress: (_key, current, total) =>
          onProgress(total ? Math.min(100, Math.round((100 * current) / total)) : 0),
      }
    : baseConfig
  return removeBackground(input, config)
}

/** 모델 에셋 미리 다운로드 (앱 로드 시 호출 → 첫 캐치가 빨라짐) */
export async function warmupCutout(): Promise<void> {
  try {
    await preload(baseConfig)
  } catch {
    // 무시 (실패해도 실제 캐치 때 다시 시도)
  }
}
