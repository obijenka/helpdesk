import { Inbox, FolderOpen, CheckCircle2, Clock } from 'lucide-react';
import { formatDuration } from '../../utils/formatDuration';

export default function KpiCards({ kpi }) {
  const cards = [
    {
      icon: Inbox,
      label: 'Всего заявок',
      value: kpi.total,
      color: 'text-gray-900',
      bg: 'bg-gray-100',
    },
    {
      icon: FolderOpen,
      label: 'Открыто',
      value: kpi.open,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: CheckCircle2,
      label: 'Закрыто',
      value: kpi.closed,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      icon: Clock,
      label: 'Среднее решение',
      value: formatDuration(kpi.avgResolutionMinutes),
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      isText: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className="bg-white border border-gray-200 rounded-xl p-5"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 ${c.bg} rounded-lg flex items-center justify-center shrink-0`}
              >
                <Icon className={`w-5 h-5 ${c.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">{c.label}</p>
                <p
                  className={`${
                    c.isText ? 'text-xl' : 'text-2xl'
                  } font-semibold mt-0.5 ${c.color} truncate`}
                >
                  {c.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}