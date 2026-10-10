import { useEffect, useState } from 'react';
import { ticketsApi } from '../../api/tickets';

export default function StatusChanger({ ticketId, currentStatusId, onChanged }) {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ticketsApi.meta().then((res) => setStatuses(res.data.statuses));
  }, []);

  const handleChange = async (e) => {
    const newStatusId = Number(e.target.value);
    if (newStatusId === currentStatusId) return;

    setLoading(true);
    try {
      await ticketsApi.updateStatus(ticketId, newStatusId);
      onChanged(newStatusId);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Не удалось сменить статус');
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={currentStatusId}
      onChange={handleChange}
      disabled={loading}
      className="text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50"
    >
      {statuses.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}