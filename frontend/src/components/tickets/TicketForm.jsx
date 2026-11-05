import { useEffect, useState } from 'react';
import { Paperclip, X, FileText, Upload } from 'lucide-react';
import { ticketsApi } from '../../api/tickets';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';

const MAX_FILES = 5;
const MAX_SIZE = 10 * 1024 * 1024; // 10 МБ

export default function TicketForm({ onSubmit, onCancel }) {
  const [meta, setMeta] = useState({ categories: [], priorities: [] });
  const [form, setForm] = useState({
    subject: '',
    description: '',
    categoryId: '',
    priorityId: '',
  });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [fileError, setFileError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ticketsApi.meta().then((res) => {
      setMeta({
        categories: res.data.categories,
        priorities: res.data.priorities,
      });
      setForm((f) => ({
        ...f,
        categoryId: res.data.categories[0]?.id || '',
        priorityId:
          res.data.priorities.find((p) => p.name === 'Средний')?.id ||
          res.data.priorities[0]?.id ||
          '',
      }));
    });
  }, []);

  // Валидация формы
  const validate = () => {
    const e = {};
    if (!form.subject.trim()) e.subject = 'Укажите тему';
    else if (form.subject.length > 200) e.subject = 'Максимум 200 символов';
    if (!form.description.trim()) e.description = 'Опишите проблему';
    if (!form.categoryId) e.categoryId = 'Выберите категорию';
    if (!form.priorityId) e.priorityId = 'Выберите приоритет';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eObj = validate();
    setErrors(eObj);
    if (Object.keys(eObj).length > 0) return;

    setLoading(true);
    try {
      await onSubmit(
        {
          subject: form.subject.trim(),
          description: form.description.trim(),
          categoryId: Number(form.categoryId),
          priorityId: Number(form.priorityId),
        },
        files // ← передаём файлы наверх
      );
    } finally {
      setLoading(false);
    }
  };

  // Добавление файлов
  const handleFileChange = (e) => {
    setFileError('');
    const selected = Array.from(e.target.files || []);

    // Проверка лимита
    if (files.length + selected.length > MAX_FILES) {
      setFileError(`Максимум ${MAX_FILES} файлов`);
      return;
    }

    // Проверка размера и дубликатов
    const valid = [];
    for (const f of selected) {
      if (f.size > MAX_SIZE) {
        setFileError(`Файл «${f.name}» больше 10 МБ`);
        return;
      }
      if (files.some((existing) => existing.name === f.name && existing.size === f.size)) {
        setFileError(`Файл «${f.name}» уже добавлен`);
        return;
      }
      valid.push(f);
    }

    setFiles((prev) => [...prev, ...valid]);
    e.target.value = ''; // сброс input
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setFileError('');
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
  };

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Тема"
        required
        placeholder="Кратко опишите проблему"
        value={form.subject}
        onChange={update('subject')}
        error={errors.subject}
        maxLength={200}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Категория"
          required
          value={form.categoryId}
          onChange={update('categoryId')}
          error={errors.categoryId}
        >
          {meta.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Select
          label="Приоритет"
          required
          value={form.priorityId}
          onChange={update('priorityId')}
          error={errors.priorityId}
        >
          {meta.priorities.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>

      <Textarea
        label="Описание"
        required
        rows={6}
        placeholder="Опишите проблему подробно: что произошло, когда началось, что уже пробовали"
        value={form.description}
        onChange={update('description')}
        error={errors.description}
      />

      {/* Вложения */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Вложения
          <span className="text-gray-400 font-normal ml-1">
            (до {MAX_FILES} файлов, до 10 МБ)
          </span>
        </label>

        {/* Кнопка выбора */}
        {files.length < MAX_FILES && (
          <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 cursor-pointer transition">
            <Upload className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              Выбрать файлы
            </span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.txt,.log,.zip,.doc,.docx"
            />
          </label>
        )}

        {/* Ошибка */}
        {fileError && (
          <p className="text-xs text-red-600 mt-2">{fileError}</p>
        )}

        {/* Список выбранных */}
        {files.length > 0 && (
          <div className="mt-3 space-y-2">
            {files.map((f, idx) => (
              <div
                key={`${f.name}-${idx}`}
                className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg"
              >
                <Paperclip className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{f.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatSize(f.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white transition"
                  title="Убрать"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-red-600" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Отмена
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Создание...' : 'Создать заявку'}
        </Button>
      </div>
    </form>
  );
}