import { Pencil, KeyRound } from 'lucide-react';
import Avatar from '../ui/Avatar';

export default function UserTable({ users, onEdit, onResetPassword }) {
  if (users.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <p className="text-sm text-gray-500">Пользователей не найдено</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Сотрудник</th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Роль</th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Отдел</th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Статус</th>
            <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Действия</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <Avatar name={u.fullName} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{u.fullName}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700 capitalize">{u.role.name}</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {u.department?.name || '—'}
              </td>
              <td className="px-6 py-4">
                {u.isActive ? (
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border bg-emerald-50 text-emerald-700 border-emerald-200">
                    Активен
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border bg-gray-100 text-gray-600 border-gray-200">
                    Заблокирован
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onEdit(u)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
                    title="Редактировать"
                  >
                    <Pencil className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => onResetPassword(u)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
                    title="Сбросить пароль"
                  >
                    <KeyRound className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}