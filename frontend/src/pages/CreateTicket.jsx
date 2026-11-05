import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ticketsApi } from '../api/tickets';
import { attachmentsApi } from '../api/attachments';
import TicketForm from '../components/tickets/TicketForm';

export default function CreateTicket() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (data, files) => {
    try {
      // 1. Создаём заявку
      const res = await ticketsApi.create(data);
      const ticketId = res.data.id;

      // 2. Загружаем файлы (если есть)
      if (files && files.length > 0) {
        setUploading(true);
        const errors = [];

        for (const file of files) {
          try {
            await attachmentsApi.upload(ticketId, file);
          } catch (err) {
            errors.push(file.name);
          }
        }

        if (errors.length > 0) {
          alert(
            `Заявка создана, но не удалось загрузить файлы:\n${errors.join('\n')}`
          );
        }
      }

      // 3. Редирект на карточку
      navigate(`/tickets/${ticketId}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Не удалось создать заявку');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/tickets')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад к заявкам
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Новая заявка</h1>
        <p className="text-sm text-gray-500 mt-1">
          Опишите проблему — специалист техподдержки свяжется с вами
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <TicketForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/tickets')}
        />
      </div>
    </div>
  );
}