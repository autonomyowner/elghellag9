export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ar-DZ", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(price) + " د.ج";
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(timestamp));
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  if (days < 7) return `منذ ${days} يوم`;
  if (days < 30) return `منذ ${Math.floor(days / 7)} أسبوع`;
  return formatDate(timestamp);
}
