export type CoverArtworkVariant = 'architecture' | 'operations' | 'tooling'

export function getCoverArtworkVariant(seed: string): CoverArtworkVariant {
  const normalized = seed.toLowerCase()
  if (
    normalized.includes('architect') ||
    normalized.includes('kien-truc') ||
    normalized.includes('monolith')
  ) {
    return 'architecture'
  }
  if (
    normalized.includes('operation') ||
    normalized.includes('van-hanh') ||
    normalized.includes('observ')
  ) {
    return 'operations'
  }
  return 'tooling'
}
