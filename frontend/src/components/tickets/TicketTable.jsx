import { useNavigate } from 'react-router-dom';
import StatusBadge from '../ui/StatusBadge';
import PriorityBadge from '../ui/PriorityBadge';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function TicketTable({ tickets }) {
  const navigate = useNavigate();

  if (tickets.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <p className="text-gray-500 text-sm">Заявок не найдено</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
              ID
            </th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
              Тема
            </th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
              Статус
            </th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
              Приоритет
            </th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
              Дата
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {tickets.map((t) => (
            <tr
              key={t.id}
              onClick={() => navigate(`/tickets/${t.id}`)}
              className="hover:bg-gray-50 cursor-pointer transition"
            >
              <td className="px-6 py-4 text-sm text-gray-500">#{t.id}</td>
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-gray-900 truncate max-w-md">
                  {t.subject}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t.category.name} · {t.author.name}
                </p>
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={t.status.name} />
              </td>
              <td className="px-6 py-4">
                <PriorityBadge priority={t.priority.name} />
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {format(new Date(t.createdAt), 'dd.MM.yyyy', { locale: ru })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}