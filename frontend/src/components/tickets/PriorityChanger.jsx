import { useEffect, useState } from 'react';
import { ticketsApi } from '../../api/tickets';

export default function PriorityChanger({ ticketId, currentPriorityId, onChanged }) {
  const [priorities, setPriorities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ticketsApi.meta().then((res) => setPriorities(res.data.priorities));
  }, []);

  const handleChange = async (e) => {
    const newId = Number(e.target.value);
    if (newId === currentPriorityId) return;

    setLoading(true);
    try {
      await ticketsApi.updatePriority(ticketId, newId);
      onChanged(newId);
    } catch (err) {
      alert(err.response?.data?.message || 'Не удалось сменить приоритет');
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={currentPriorityId}
      onChange={handleChange}
      disabled={loading}
      className="text-sm bg-white border border-gray-300 rounded-lg px-3 py-2
                 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50 w-full"
    >
      {priorities.map((p) => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
  );
}