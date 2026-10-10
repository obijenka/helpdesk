import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { usersApi } from '../api/users';
import UserTable from '../components/users/UserTable';
import UserForm from '../components/users/UserForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ roles: [], departments: [] });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const loadUsers = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    if (deptFilter) params.department = deptFilter;

    usersApi
      .list(params)
      .then((res) => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    usersApi.meta().then((res) => setMeta(res.data));
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadUsers, 300);
    return () => clearTimeout(timer);
  }, [search, roleFilter, deptFilter]);

  const openCreate = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleSubmit = async (payload) => {
    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, payload);
      } else {
        await usersApi.create(payload);
      }
      setModalOpen(false);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('Пароль должен быть не менее 6 символов');
      return;
    }
    try {
      await usersApi.resetPassword(resetTarget.id, newPassword);
      setResetTarget(null);
      setNewPassword('');
      alert('Пароль сброшен');
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  return (
    <div>
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Пользователи</h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? 'Загрузка...' : `Всего: ${users.length}`}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Добавить
        </Button>
      </div>

      {/* Фильтры */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по ФИО или email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">Все роли</option>
          {meta.roles.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">Все отделы</option>
          {meta.departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* Таблица */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-sm text-gray-500">Загрузка...</p>
        </div>
      ) : (
        <UserTable
          users={users}
          onEdit={openEdit}
          onResetPassword={setResetTarget}
        />
      )}

      {/* Модалка создания/редактирования */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? 'Редактировать пользователя' : 'Новый пользователь'}
      >
        <UserForm
          user={editingUser}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      {/* Модалка сброса пароля */}
      <Modal
        open={!!resetTarget}
        onClose={() => {
          setResetTarget(null);
          setNewPassword('');
        }}
        title="Сбросить пароль"
        size="sm"
      >
        <p className="text-sm text-gray-700 mb-4">
          Пользователь: <strong>{resetTarget?.fullName}</strong>
        </p>
        <input
          type="password"
          placeholder="Новый пароль (минимум 6 символов)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 mb-4"
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setResetTarget(null)}>
            Отмена
          </Button>
          <Button onClick={handleResetPassword}>Сбросить</Button>
        </div>
      </Modal>
    </div>
  );
}