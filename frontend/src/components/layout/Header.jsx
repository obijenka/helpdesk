import { Link } from 'react-router-dom';
import { LifeBuoy, Bell } from 'lucide-react';
import { useState } from 'react';
import Badge from '../ui/Badge';
import UserMenu from './UserMenu';

export default function Header() {
  // Пока заглушка — позже загрузим из API
  const [unreadCount] = useState(3);

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <Link to="/tickets" className="flex items-center gap-2 group">
        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center group-hover:bg-gray-800 transition">
          <LifeBuoy className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-gray-900">Help Desk</span>
      </Link>

      <div className="flex items-center gap-2">
        <button
          className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
          title="Уведомления"
        >
          <Bell className="w-[18px] h-[18px] text-gray-600" />
          <Badge count={unreadCount} />
        </button>

        <UserMenu />
      </div>
    </header>
  );
}