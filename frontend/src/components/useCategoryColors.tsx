const PALETTE = [
  '#22d3ee', '#a78bfa', '#4ade80', '#fb923c', '#fb7185',
  '#38bdf8', '#f472b6', '#facc15', '#34d399', '#818cf8',
]

const cache: Record<string, string> = {}
let idx = 0

export function getCatColor(cat: string): string {
  if (!cat || cat === 'Default' || cat === '') return '#64748b'
  if (!cache[cat]) {
    cache[cat] = PALETTE[idx % PALETTE.length]
    idx++
  }
  return cache[cat]
}

export function CatBadge({ cat }: { cat: string }) {
  const color = getCatColor(cat)
  return (
    <span style={{ color, borderColor: color + '40', backgroundColor: color + '15' }}
      className="text-xs px-2 py-0.5 rounded-full border font-medium shrink-0">
      {cat || 'Default'}
    </span>
  )
}
