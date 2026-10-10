import { useEffect, useState } from 'react';
import { ticketsApi } from '../../api/tickets';

export default function AssigneeSelector({ ticketId, currentAssigneeId, onChanged }) {
  const [executors, setExecutors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ticketsApi.executors().then((res) => setExecutors(res.data));
  }, []);

  const handleChange = async (e) => {
    const newAssigneeId = e.target.value ? Number(e.target.value) : null;
    if (newAssigneeId === currentAssigneeId) return;

    setLoading(true);
    try {
      await ticketsApi.assignExecutor(ticketId, newAssigneeId);
      onChanged(newAssigneeId);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Не удалось назначить исполнителя');
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={currentAssigneeId || ''}
      onChange={handleChange}
      disabled={loading}
      className="text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50 w-full"
    >
      <option value="">— Не назначен —</option>
      {executors.map((e) => (
        <option key={e.id} value={e.id}>
          {e.name} {e.department ? `(${e.department})` : ''}
        </option>
      ))}
    </select>
  );
}