import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Dropdown from '../ui/Dropdown';
import Avatar from '../ui/Avatar';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Dropdown
      trigger={
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition">
          <Avatar name={user?.fullName} size="sm" />
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-gray-900 leading-tight">
              {user?.fullName}
            </p>
            <p className="text-xs text-gray-500 leading-tight">{user?.role}</p>
          </div>
        </div>
      }
    >
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
        <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
        <p className="text-xs text-gray-400 mt-0.5">{user?.department}</p>
      </div>

      <button
        onClick={() => navigate('/profile')}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
      >
        <User className="w-4 h-4 text-gray-400" />
        Профиль
      </button>

      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition border-t border-gray-100"
      >
        <LogOut className="w-4 h-4" />
        Выйти
      </button>
    </Dropdown>
  );
}