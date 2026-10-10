import { useState } from 'react';
import { profileApi } from '../../api/profile';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function PasswordForm() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: 'error', text: 'Пароли не совпадают' });
      return;
    }
    if (form.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Пароль должен быть не менее 6 символов' });
      return;
    }

    setLoading(true);
    try {
      await profileApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setMessage({ type: 'success', text: 'Пароль изменён' });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Ошибка',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
        Смена пароля
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="password"
          label="Текущий пароль"
          value={form.currentPassword}
          onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
          required
        />

        <Input
          type="password"
          label="Новый пароль"
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          required
          minLength={6}
        />

        <Input
          type="password"
          label="Повторите новый пароль"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          required
        />

        {message.text && (
          <p
            className={`text-sm ${
              message.type === 'success' ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {message.text}
          </p>
        )}

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? 'Смена...' : 'Сменить пароль'}
          </Button>
        </div>
      </form>
    </div>
  );
}