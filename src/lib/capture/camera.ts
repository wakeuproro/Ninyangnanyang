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

/** 현재 영상 프레임을 JPEG Blob 으로 캡처 */
export async function captureFrame(video: HTMLVideoElement): Promise<Blob> {
  const w = video.videoWidth || 720
  const h = video.videoHeight || 960
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
