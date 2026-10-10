import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { usersApi } from '../../api/users';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import ExecutorLoadBadge from '../ui/ExecutorLoadBadge';

const MAX_LOAD = 7; // условная норма активных заявок

export default function AssignExecutorModal({
  open,
  onClose,
  ticket,
  currentAssigneeId,
  onAssigned,
}) {
  const [executors, setExecutors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    usersApi
      .executorsWithLoad()
      .then((res) => setExecutors(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open]);

  const handleAssign = async (executorId) => {
    setAssigningId(executorId);
    try {
      await onAssigned(executorId);
      onClose();
    } finally {
      setAssigningId(null);
    }
  };

  const handleUnassign = async () => {
    setAssigningId('none');
    try {
      await onAssigned(null);
      onClose();
    } finally {
      setAssigningId(null);
    }
  };

  const filtered = executors.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Назначить исполнителя"
      size="lg"
    >
      {/* Инфа о заявке */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
        <p className="text-xs text-gray-400 mb-1">Заявка #{ticket?.id}</p>
        <p className="text-sm font-medium text-gray-900">{ticket?.subject}</p>
        <p className="text-xs text-gray-500 mt-1">
          {ticket?.category?.name} · Приоритет: {ticket?.priority?.name}
        </p>
      </div>

      {/* Поиск */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Поиск по имени или email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>

      {/* Кнопка снятия назначения */}
      {currentAssigneeId && (
        <button
          onClick={handleUnassign}
          disabled={assigningId !== null}
          className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg mb-2 transition"
        >
          — Снять назначение
        </button>
      )}

      {/* Список исполнителей */}
      {loading ? (
        <p className="text-sm text-gray-500 text-center py-8">Загрузка...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">
          Исполнителей не найдено
        </p>
      ) : (
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {filtered.map((e) => {
            const isCurrent = e.id === currentAssigneeId;
            const percent = Math.min((e.activeCount / MAX_LOAD) * 100, 100);

            const barColor =
              e.loadLevel === 'high'
                ? 'bg-red-500'
                : e.loadLevel === 'medium'
                ? 'bg-amber-500'
                : 'bg-emerald-500';

            return (
              <div
                key={e.id}
                className={`border rounded-xl p-4 transition ${
                  isCurrent
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar name={e.name} size="md" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-gray-900">
                        {e.name}
                      </p>
                      <ExecutorLoadBadge level={e.loadLevel} />
                      {isCurrent && (
                        <span className="text-xs text-gray-500">· текущий</span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mt-0.5">
                      {e.department || '—'} · {e.position || 'Исполнитель'}
                    </p>

                    {/* Прогресс-бар загрузки */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Загрузка: {e.activeCount} из {MAX_LOAD}</span>
                        <span>Активных: {e.activeCount}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColor} transition-all`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Мини-статистика */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>Решено: {e.resolvedCount}</span>
                      <span>Всего: {e.totalCount}</span>
                    </div>
                  </div>

                  {/* Кнопка */}
                  <div className="shrink-0">
                    {isCurrent ? (
                      <Button
                        variant="secondary"
                        onClick={() => handleAssign(e.id)}
                        disabled={assigningId !== null}
                      >
                        Оставить
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleAssign(e.id)}
                        disabled={assigningId !== null}
                      >
                        {assigningId === e.id ? '...' : 'Назначить'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}