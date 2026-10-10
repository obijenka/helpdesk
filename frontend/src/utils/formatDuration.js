// Минуты → "4 ч 20 мин" или "45 мин"
export function formatDuration(minutes) {
  if (minutes === null || minutes === undefined) return '—';
  if (minutes < 60) return `${minutes} мин`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) return `${hours} ч`;
  return `${hours} ч ${mins} мин`;
}