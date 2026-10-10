import { NavLink, useNavigate } from "react-router-dom";
import { Inbox, PlusCircle, BarChart3, Users, UserCheck, LogOut } from 'lucide-react';
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      to: "/tickets",
      label: "Заявки",
      icon: Inbox,
      roles: ["user", "executor", "admin"],
    },
    {
      to: "/tickets/new",
      label: "Создать заявку",
      icon: PlusCircle,
      roles: ["user"],
    },
    {
      to: "/executors",
      label: "Исполнители",
      icon: UserCheck,
      roles: ["admin"],
    },
    {
      to: "/reports",
      label: "Отчёты",
      icon: BarChart3,
      roles: ["admin"],
    },
    {
      to: "/users",
      label: "Пользователи",
      icon: Users,
      roles: ["admin"],
    },
  ];

  const visibleItems = menuItems.filter((item) =>
    item.roles.includes(user?.role),
  );

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <nav className="flex-1 py-4 px-3 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition
                 ${
                   isActive
                     ? "bg-gray-100 text-gray-900"
                     : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                 }`
              }
            >
              <Icon className="w-[18px] h-[18px]" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Выйти
        </button>
      </div>
    </aside>
  );
}
