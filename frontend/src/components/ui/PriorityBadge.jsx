import { ArrowDown, Minus, ArrowUp, AlertTriangle } from 'lucide-react';

export default function PriorityBadge({ priority, level }) {
  const config = {
    'Низкий': { icon: ArrowDown, color: 'text-gray-500' },
    'Средний': { icon: Minus, color: 'text-blue-500' },
    'Высокий': { icon: ArrowUp, color: 'text-orange-500' },
    'Критический': { icon: AlertTriangle, color: 'text-red-500' },
  };

  const { icon: Icon, color } = config[priority] || config['Низкий'];

  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
      <Icon className={`w-4 h-4 ${color}`} />
      {priority}
    </span>
  );
}