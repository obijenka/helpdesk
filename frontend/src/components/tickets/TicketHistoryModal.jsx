import { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { ticketsApi } from '../../api/tickets';
import Modal from '../ui/Modal';
import HistoryItem from './HistoryItem';

export default function TicketHistoryModal({ open, onClose, ticketId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !ticketId) return;
    setLoading(true);
    ticketsApi
      .history(ticketId)
      .then((res) => setHistory(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, ticketId]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`История изменений заявки #${ticketId}`}
      size="lg"
    >
      {loading ? (
        <p className="text-sm text-gray-500 text-center py-8">
          Загрузка...
        </p>
      ) : history.length === 0 ? (
        <div className="text-center py-8">
          <History className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">История пуста</p>
        </div>
      ) : (
        <div>
          {history.map((item, idx) => (
            <HistoryItem
              key={item.id}
              item={item}
              isLast={idx === history.length - 1}
            />
          ))}
        </div>
      )}
    </Modal>
  );
}