import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Trash2, Bell, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { notificationsApi } from '../api/notifications';

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | unread

  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    notificationsApi
      .list()
      .then((res) => setItems(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleClick = async (n) => {
    if (!n.isRead) {
      await notificationsApi.markAsRead(n.id);
      setItems((prev) =>
        prev.map((it) => (it.id === n.id ? { ...it, isRead: true } : it))
      );
    }
    if (n.ticketId) {
      navigate(`/tickets/${n.ticketId}`);
    }
  };

  const handleMarkAll = async () => {
    await notificationsApi.markAllAsRead();
    setItems((prev) => prev.map((it) => ({ ...it, isRead: true })));
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await notificationsApi.remove(id);
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const visible =
    filter === 'unread' ? items.filter((n) => !n.isRead) : items;

  const unreadCount = items.filter((n) => !n.isRead).length;

  return (
    <div>
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Уведомления</h1>
          <p className="text-sm text-gray-500 mt-1">
            Непрочитанных: {unreadCount}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Фильтр */}
          <div className="flex items-center bg-white border border-gray-300 rounded-lg p-0.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                filter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                filter === 'unread'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Непрочитанные
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="flex items-center gap-2 px-3 h-9 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Check className="w-4 h-4" />
              Прочитать все
            </button>
          )}
        </div>
      </div>

      {/* Список */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-sm text-gray-500">Загрузка...</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <Bell className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Уведомлений нет</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {visible.map((n, idx) => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              className={`flex items-start gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition ${
                idx !== visible.length - 1 ? 'border-b border-gray-100' : ''
              } ${!n.isRead ? 'bg-blue-50/30' : ''}`}
            >
              <div className="mt-1.5 shrink-0">
                {!n.isRead ? (
                  <span className="block w-2 h-2 rounded-full bg-blue-500" />
                ) : (
                  <span className="block w-2 h-2 rounded-full bg-gray-200" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm leading-snug ${
                    !n.isRead ? 'text-gray-900 font-medium' : 'text-gray-700'
                  }`}
                >
                  {n.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {format(new Date(n.createdAt), 'dd.MM.yyyy HH:mm', {
                    locale: ru,
                  })}
                </p>
              </div>

              {n.ticketId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/tickets/${n.ticketId}`);
                  }}
                  className="text-xs text-gray-400 hover:text-gray-900 flex items-center gap-1 shrink-0"
                  title="Открыть заявку"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={(e) => handleDelete(e, n.id)}
                className="text-gray-300 hover:text-red-600 shrink-0 transition"
                title="Удалить"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}