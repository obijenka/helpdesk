import { useState } from 'react';
import { profileApi } from '../../api/profile';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function ProfileInfo({ profile, onUpdated }) {
  const [form, setForm] = useState({
    fullName: profile.fullName || '',
    position: profile.position || '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await profileApi.update(form);
      setMessage('Профиль обновлён');
      onUpdated();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
        Личные данные
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="ФИО"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          required
        />

        <Input
          label="Email"
          value={profile.email}
          disabled
          className="opacity-60"
        />

        <Input
          label="Отдел"
          value={profile.department || '—'}
          disabled
          className="opacity-60"
        />

        <Input
          label="Должность"
          value={form.position}
          onChange={(e) => setForm({ ...form, position: e.target.value })}
          placeholder="Например, Бухгалтер"
        />

        {message && (
          <p className="text-sm text-emerald-600">{message}</p>
        )}

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        </div>
      </form>
    </div>
  );
}