const cache = new Map<string, string>()

export function getCached(key: string): string | null {
  return cache.get(key) ?? null
}

export function setCached(key: string, value: string): void {
  cache.set(key, value)
}

export function hasCached(key: string): boolean {
  return cache.has(key)
}