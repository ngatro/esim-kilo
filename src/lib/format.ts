// Consistent data formatting: <1024MB → MB, >=1024MB → GB
export function formatData(gb: number): string {
  if (gb >= 999) return "Unlimited";
  if (gb < 1) return `${Math.round(gb * 1024)}MB`;
  if (gb >= 1024) return `${Math.round(gb)}GB`;
  return `${gb}GB`;
}

// Format price from raw (10000 = $1.00)
export function formatPrice(raw: number): string {
  return `$${(raw / 10000).toFixed(2)}`;
}