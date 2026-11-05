import { useEffect, useState } from 'react';
import { Paperclip, Download, Trash2, Upload, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { attachmentsApi } from '../../api/attachments';
import { useAuth } from '../../context/AuthContext';

export default function AttachmentsList({ ticketId }) {
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const load = () => {
    attachmentsApi
      .list(ticketId)
      .then((res) => setAttachments(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    load();
  }, [ticketId]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);

    try {
      await attachmentsApi.upload(ticketId, file);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка загрузки');
    } finally {
      setUploading(false);
      e.target.value = ''; // сброс input
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить файл?')) return;
    try {
      await attachmentsApi.remove(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка удаления');
    }
  };

  // Форматируем размер — пока не храним, но можно добавить
  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <Paperclip className="w-4 h-4" />
          Вложения ({attachments.length})
        </h2>

        <label className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition">
          <Upload className="w-4 h-4" />
          {uploading ? 'Загрузка...' : 'Загрузить'}
          <input
            type="file"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading || attachments.length >= 5}
          />
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
          {error}
        </p>
      )}

      {attachments.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          Нет вложений
        </p>
      ) : (
        <div className="space-y-2">
          {attachments.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition group"
            >
              <FileText className="w-4 h-4 text-gray-400 shrink-0" />

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">{a.fileName}</p>
                <p className="text-xs text-gray-500">
                  {a.user.name} · {format(new Date(a.uploadedAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
                </p>
              </div>

              <a
                href={attachmentsApi.downloadUrl(a.id)}
                download
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition"
                title="Скачать"
              >
                <Download className="w-4 h-4 text-gray-500" />
              </a>

              {(a.user.id === user?.id || user?.role === 'admin') && (
                <button
                  onClick={() => handleDelete(a.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition"
                  title="Удалить"
                >
                  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}