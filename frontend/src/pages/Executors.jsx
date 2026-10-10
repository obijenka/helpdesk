import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Users,
  UserCheck,
  AlertTriangle,
  Clock,
  ArrowUpDown,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { usersApi } from '../api/users';
import Avatar from '../components/ui/Avatar';
import ExecutorLoadBadge from '../components/ui/ExecutorLoadBadge';
import { formatDuration } from '../utils/formatDuration';

const MAX_LOAD = 7;

export default function Executors() {
  const [executors, setExecutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('load'); // load | name | resolved

  const navigate = useNavigate();

  useEffect(() => {
    usersApi
      .executorsWithLoad()
      .then((res) => setExecutors(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Фильтрация + сортировка
  const visibleExecutors = useMemo(() => {
    let list = executors.filter(
      (e) =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase())
    );

    list = [...list].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'ru');
      if (sortBy === 'resolved') return b.resolvedCount - a.resolvedCount;
      // по загрузке (по умолчанию)
      return a.activeCount - b.activeCount;
    });

    return list;
  }, [executors, search, sortBy]);

  // Сводка
  const summary = {
    total: executors.length,
    free: executors.filter((e) => e.loadLevel === 'low').length,
    overloaded: executors.filter((e) => e.loadLevel === 'high').length,
  };

  return (
    <div>
      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Исполнители</h1>
        <p className="text-sm text-gray-500 mt-1">
          Загрузка специалистов технической поддержки
        </p>
      </div>

      {/* Сводка */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          icon={Users}
          label="Всего исполнителей"
          value={summary.total}
          color="text-gray-900"
        />
        <SummaryCard
          icon={UserCheck}
          label="Свободны"
          value={summary.free}
          color="text-emerald-600"
        />
        <SummaryCard
          icon={AlertTriangle}
          label="Перегружены"
          value={summary.overloaded}
          color="text-red-600"
        />
      </div>

      {/* Поиск + сортировка */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по имени или email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 appearance-none"
          >
            <option value="load">По загрузке</option>
            <option value="name">По имени (А–Я)</option>
            <option value="resolved">По решённым</option>
          </select>
        </div>
      </div>

      {/* Список */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-sm text-gray-500">Загрузка...</p>
        </div>
      ) : visibleExecutors.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-sm text-gray-500">Исполнителей не найдено</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleExecutors.map((e) => (
            <ExecutorCard
              key={e.id}
              executor={e}
              onClick={() => navigate(`/tickets?assignee=${e.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className={`text-2xl font-semibold mt-0.5 ${color}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

function ExecutorCard({ executor: e, onClick }) {
  const percent = Math.min((e.activeCount / MAX_LOAD) * 100, 100);

  const barColor =
    e.loadLevel === 'high'
      ? 'bg-red-500'
      : e.loadLevel === 'medium'
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  // Цветная полоса слева
  const stripeColor =
    e.loadLevel === 'high'
      ? 'bg-red-500'
      : e.loadLevel === 'medium'
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  return (
    <button
      onClick={onClick}
      className="w-full bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-400 hover:shadow-sm transition text-left relative overflow-hidden"
    >
      {/* Цветная полоса слева */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${stripeColor}`} />

      <div className="flex items-start gap-4 pl-3">
        <Avatar name={e.name} size="lg" online={e.isOnline} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-base font-medium text-gray-900">{e.name}</p>
            <ExecutorLoadBadge level={e.loadLevel} />
            {e.isOnline && (
              <span className="text-xs text-emerald-600">· онлайн</span>
            )}
          </div>

          <p className="text-sm text-gray-500 mt-0.5">
            {e.department || '—'} · {e.position || 'Исполнитель'}
          </p>

          <p className="text-xs text-gray-400 mt-0.5">{e.email}</p>

          {/* Прогресс-бар */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Загрузка: {e.activeCount} из {MAX_LOAD}</span>
              <span>
                {e.loadLevel === 'high'
                  ? 'Перегружен'
                  : e.loadLevel === 'medium'
                  ? 'Средняя загрузка'
                  : 'Свободен'}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${barColor} transition-all`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Статистика */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
            <Stat label="Активных" value={e.activeCount} />
            <Stat label="Решено" value={e.resolvedCount} />
            <Stat label="Всего" value={e.totalCount} />
            <Stat
              icon={Clock}
              label="Средн. решение"
              value={formatDuration(e.avgResolutionMinutes)}
            />
            {e.lastActiveAt && (
              <Stat
                label="Последняя активность"
                value={formatDistanceToNow(new Date(e.lastActiveAt), {
                  locale: ru,
                  addSuffix: true,
                })}
              />
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </p>
      <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}