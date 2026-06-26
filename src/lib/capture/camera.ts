// 라이브 카메라 (getUserMedia — HTTPS/localhost 에서만 동작)

export async function startCamera(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('이 브라우저는 카메라를 지원하지 않아요.')
  }
  return navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: { ideal: 'environment' }, // 후면 카메라 우선
      width: { ideal: 1280 },
      height: { ideal: 1280 },
    },
    audio: false,
  })
}

/** 현재 영상 프레임을 JPEG Blob 으로 캡처 (폰 메모리 위해 긴변 1024로 축소) */
export async function captureFrame(video: HTMLVideoElement): Promise<Blob> {
  const vw = video.videoWidth || 720
  const vh = video.videoHeight || 960
  const maxSide = 1024
  const scale = Math.min(1, maxSide / Math.max(vw, vh))
  const w = Math.round(vw * scale)
  const h = Math.round(vh * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('캔버스 컨텍스트를 만들 수 없어요.')
  ctx.drawImage(video, 0, 0, w, h)
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('프레임 캡처 실패'))), 'image/jpeg', 0.92)
  })
}

export function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((t) => t.stop())
}
