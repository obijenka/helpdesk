export default function ProfileStats({ stats }) {
  const items = [
    { label: 'Создано заявок', value: stats.total, color: 'text-gray-900' },
    { label: 'Решено', value: stats.resolved, color: 'text-emerald-600' },
    { label: 'В работе', value: stats.active, color: 'text-amber-600' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white border border-gray-200 rounded-xl p-5"
        >
          <p className="text-xs text-gray-500">{item.label}</p>
          <p className={`text-2xl font-semibold mt-1 ${item.color}`}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}