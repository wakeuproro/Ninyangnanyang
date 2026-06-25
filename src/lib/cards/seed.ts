// 결정적(deterministic) 시드 해시 — 같은 입력이면 항상 같은 결과.
// cyrb53: 빠르고 충돌 적은 53bit 문자열 해시.

export function hashSeed(str: string): number {
  let h1 = 0xdeadbeef ^ str.length
  let h2 = 0x41c6ce57 ^ str.length
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}

/** seed+salt 로 1..max(포함) 정수 굴리기 (재현 가능) */
export function roll(seed: string, salt: string, max = 10): number {
  return (hashSeed(`${seed}|${salt}`) % max) + 1
}
