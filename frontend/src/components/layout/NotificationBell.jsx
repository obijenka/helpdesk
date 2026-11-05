import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { notificationsApi } from '../../api/notifications';
import Badge from '../ui/Badge';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const ref = useRef(null);
  const navigate = useNavigate();

  // Загрузка данных
  const load = async () => {
    setLoading(true);
    try {
      const [listRes, countRes] = await Promise.all([
        notificationsApi.list(),
        notificationsApi.unreadCount(),
      ]);
      setItems(listRes.data.slice(0, 7)); // последние 7
      setUnread(countRes.data.count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка при монтировании + каждые 30 сек
  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  // Закрытие по клику вне
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleOpen = () => {
    setOpen(!open);
    if (!open) load();
  };

  // Клик по уведомлению — отметить прочитанным + перейти к заявке
  const handleClickNotification = async (n) => {
    try {
      if (!n.isRead) {
        await notificationsApi.markAsRead(n.id);
        setItems((prev) =>
          prev.map((it) => (it.id === n.id ? { ...it, isRead: true } : it))
        );
        setUnread((c) => Math.max(0, c - 1));
      }
      setOpen(false);
      if (n.ticketId) {
        navigate(`/tickets/${n.ticketId}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Отметить все
  const handleMarkAll = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setItems((prev) => prev.map((it) => ({ ...it, isRead: true })));
      setUnread(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative" ref={ref}>
      {/* Колокольчик */}
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
        title="Уведомления"
      >
        <Bell className="w-[18px] h-[18px] text-gray-600" />
        <Badge count={unread} />
      </button>

      {/* Выпадающий список */}
      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {/* Шапка */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-900">
              Уведомления
            </span>
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Прочитать все
              </button>
            )}
          </div>

          {/* Список */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="text-sm text-gray-500 text-center py-6">
                Загрузка...
              </p>
            ) : items.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                Нет уведомлений
              </p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClickNotification(n)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${
                    !n.isRead ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Точка непрочитанного */}
                    <div className="mt-1.5 shrink-0">
                      {!n.isRead ? (
                        <span className="block w-2 h-2 rounded-full bg-blue-500" />
                      ) : (
                        <span className="block w-2 h-2 rounded-full bg-gray-200" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 leading-snug">
                        {n.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), {
                          locale: ru,
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Подвал */}
          <button
            onClick={() => {
              setOpen(false);
              navigate('/notifications');
            }}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 border-t border-gray-100 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Все уведомления
          </button>
        </div>
      )}
    </div>
  );
}