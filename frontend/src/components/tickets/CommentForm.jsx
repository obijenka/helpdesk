import { useState } from 'react';
import { Send } from 'lucide-react';
import { ticketsApi } from '../../api/tickets';

export default function CommentForm({ ticketId, onAdded }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSending(true);
    try {
      const res = await ticketsApi.addComment(ticketId, text.trim());
      onAdded(res.data);
      setText('');
    } catch (err) {
      console.error(err);
      alert('Не удалось отправить комментарий');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-start">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Написать комментарий..."
        rows={2}
        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
      />
      <button
        type="submit"
        disabled={sending || !text.trim()}
        className="flex items-center gap-1.5 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <Send className="w-4 h-4" />
        {sending ? '...' : 'Отправить'}
      </button>
    </form>
  );
}