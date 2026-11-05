import {
  Circle,
  RefreshCw,
  CheckCircle2,
  Lock,
  UserPlus,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const ICONS = {
  status: { icon: Circle, color: 'text-blue-500', bg: 'bg-blue-50' },
  progress: { icon: RefreshCw, color: 'text-amber-500', bg: 'bg-amber-50' },
  resolved: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  closed: { icon: Lock, color: 'text-gray-500', bg: 'bg-gray-100' },
  assignee: { icon: UserPlus, color: 'text-purple-500', bg: 'bg-purple-50' },
  priority: { icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' },
};

const ROLE_LABELS = {
  admin: 'Администратор',
  executor: 'Исполнитель',
  user: 'Пользователь',
};

export default function HistoryItem({ item, isLast }) {
  const config = ICONS[item.icon] || ICONS.status;
  const Icon = config.icon;

  return (
    <div className="flex gap-3">
      {/* Иконка + линия */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center shrink-0`}
        >
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-gray-200 mt-1" />}
      </div>

      {/* Контент */}
      <div className={`flex-1 ${isLast ? '' : 'pb-5'}`}>
        <p className="text-sm text-gray-900 font-medium">
          {item.description}
        </p>

        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          <span className="font-medium text-gray-600">
            {item.user.name}
          </span>
          <span>·</span>
          <span>{ROLE_LABELS[item.user.role] || item.user.role}</span>
          <span>·</span>
          <span>
            {format(new Date(item.changedAt), 'dd.MM.yyyy HH:mm', {
              locale: ru,
            })}
          </span>
        </div>
      </div>
    </div>
  );
}