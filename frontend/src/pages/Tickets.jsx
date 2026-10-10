import { useEffect, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import TicketTable from '../components/tickets/TicketTable';
import { useAuth } from '../context/AuthContext';

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [meta, setMeta] = useState({ statuses: [], priorities: [], categories: [] });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');

  const navigate = useNavigate();
  const { user } = useAuth();

  // Фильтр по исполнителю из URL (?assignee=2)
  const [searchParams, setSearchParams] = useSearchParams();
  const assigneeFilter = searchParams.get('assignee') || '';

  // Загрузка справочников
  useEffect(() => {
    api.get('/tickets/meta').then((res) => setMeta(res.data)).catch(console.error);
  }, []);

  // Загрузка заявок с фильтрами
  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (status) params.status = status;
    if (priority) params.priority = priority;
    if (category) params.category = category;
    if (assigneeFilter) params.assignee = assigneeFilter;

    const timer = setTimeout(() => {
      api
        .get('/tickets', { params })
        .then((res) => setTickets(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 300); // debounce для поиска

    return () => clearTimeout(timer);
  }, [search, status, priority, category, assigneeFilter]);

  const canCreate = user?.role === 'user';

  // Название фильтра по исполнителю (можно вытянуть из meta, если нужно)
  // Простое отображение, без имени
  const clearAssigneeFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('assignee');
    setSearchParams(next);
  };

  return (
    <div>
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Заявки</h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? 'Загрузка...' : `Найдено: ${tickets.length}`}
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => navigate('/tickets/new')}
            className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            <Plus className="w-4 h-4" />
            Создать заявку
          </button>
        )}
      </div>

      {/* Плашка активного фильтра по исполнителю */}
      {assigneeFilter && (
        <div className="mb-4 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5">
          <span className="text-sm text-blue-800">
            Показаны заявки исполнителя <strong>#{assigneeFilter}</strong>
          </span>
          <button
            onClick={clearAssigneeFilter}
            className="flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 transition"
          >
            <X className="w-3.5 h-3.5" />
            Сбросить
          </button>
        </div>
      )}

      {/* Фильтры */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        {/* Поиск */}
        <div className="relative md:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        {/* Статус */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">Все статусы</option>
          {meta.statuses.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Приоритет */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">Все приоритеты</option>
          {meta.priorities.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Категория */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">Все категории</option>
          {meta.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Таблица */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-sm text-gray-500">Загрузка заявок...</p>
        </div>
      ) : (
        <TicketTable tickets={tickets} />
      )}
    </div>
  );
}