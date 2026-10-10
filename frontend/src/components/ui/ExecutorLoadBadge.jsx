export default function ExecutorLoadBadge({ level }) {
  const config = {
    low: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Свободен' },
    medium: { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Средняя' },
    high: { color: 'bg-red-50 text-red-700 border-red-200', label: 'Высокая' },
  };

  const { color, label } = config[level] || config.low;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border ${color}`}>
      {label}
    </span>
  );
}