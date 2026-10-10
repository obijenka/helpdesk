export default function StatusBadge({ status }) {
  const colors = {
    'Новая': 'bg-blue-50 text-blue-700 border-blue-200',
    'В работе': 'bg-amber-50 text-amber-700 border-amber-200',
    'Ожидает ответа': 'bg-orange-50 text-orange-700 border-orange-200',
    'Решена': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Закрыта': 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border ${
        colors[status] || 'bg-gray-50 text-gray-600 border-gray-200'
      }`}
    >
      {status}
    </span>
  );
}