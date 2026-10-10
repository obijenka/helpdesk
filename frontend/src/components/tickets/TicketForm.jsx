import { useEffect, useState } from 'react';
import { ticketsApi } from '../../api/tickets';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';

export default function TicketForm({ onSubmit, onCancel }) {
  const [meta, setMeta] = useState({ categories: [], priorities: [] });
  const [form, setForm] = useState({
    subject: '',
    description: '',
    categoryId: '',
    priorityId: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ticketsApi.meta().then((res) => {
      setMeta({
        categories: res.data.categories,
        priorities: res.data.priorities,
      });
      // Дефолтные значения
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
      await onSubmit({
        subject: form.subject.trim(),
        description: form.description.trim(),
        categoryId: Number(form.categoryId),
        priorityId: Number(form.priorityId),
      });
    } finally {
      setLoading(false);
    }
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