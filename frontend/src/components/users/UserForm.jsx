import { useEffect, useState } from 'react';
import { usersApi } from '../../api/users';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

export default function UserForm({ user, onSubmit, onCancel }) {
  const isEdit = !!user;

  const [meta, setMeta] = useState({ roles: [], departments: [] });
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    password: '',
    roleId: user?.role?.id || '',
    departmentId: user?.department?.id || '',
    position: user?.position || '',
    isActive: user?.isActive ?? true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    usersApi.meta().then((res) => {
      setMeta(res.data);
      if (!isEdit) {
        setForm((f) => ({
          ...f,
          roleId: res.data.roles[0]?.id || '',
          departmentId: res.data.departments[0]?.id || '',
        }));
      }
    });
  }, [isEdit]);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Укажите ФИО';
    if (!isEdit) {
      if (!form.email.trim()) e.email = 'Укажите email';
      else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Некорректный email';
      if (!form.password) e.password = 'Укажите пароль';
      else if (form.password.length < 6) e.password = 'Минимум 6 символов';
    }
    if (!form.roleId) e.roleId = 'Выберите роль';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eObj = validate();
    setErrors(eObj);
    if (Object.keys(eObj).length > 0) return;

    setLoading(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        roleId: Number(form.roleId),
        departmentId: form.departmentId ? Number(form.departmentId) : null,
        position: form.position.trim() || null,
        isActive: form.isActive,
      };

      if (!isEdit) {
        payload.email = form.email.trim().toLowerCase();
        payload.password = form.password;
      }

      await onSubmit(payload);
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="ФИО"
        required
        value={form.fullName}
        onChange={update('fullName')}
        error={errors.fullName}
      />

      <Input
        label="Email (логин)"
        type="email"
        required
        value={form.email}
        onChange={update('email')}
        error={errors.email}
        disabled={isEdit}
        className={isEdit ? 'opacity-60' : ''}
      />

      {!isEdit && (
        <Input
          label="Пароль"
          type="password"
          required
          value={form.password}
          onChange={update('password')}
          error={errors.password}
          placeholder="Минимум 6 символов"
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Роль"
          required
          value={form.roleId}
          onChange={update('roleId')}
          error={errors.roleId}
        >
          {meta.roles.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </Select>

        <Select
          label="Отдел"
          value={form.departmentId}
          onChange={update('departmentId')}
        >
          <option value="">— Не указан —</option>
          {meta.departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </Select>
      </div>

      <Input
        label="Должность"
        value={form.position}
        onChange={update('position')}
        placeholder="Например, Бухгалтер"
      />

      {isEdit && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
          />
          <span className="text-sm text-gray-700">Активен</span>
        </label>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Отмена
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать'}
        </Button>
      </div>
    </form>
  );
}