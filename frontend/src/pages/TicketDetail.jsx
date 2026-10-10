import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { ticketsApi } from "../api/tickets";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/ui/StatusBadge";
import PriorityBadge from "../components/ui/PriorityBadge";
import Avatar from "../components/ui/Avatar";
import CommentList from "../components/tickets/CommentList";
import CommentForm from "../components/tickets/CommentForm";
import StatusChanger from "../components/tickets/StatusChanger";
import PriorityChanger from "../components/tickets/PriorityChanger";
import AssignExecutorModal from "../components/tickets/AssignExecutorModal";

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [assignModalOpen, setAssignModalOpen] = useState(false);

  useEffect(() => {
    Promise.all([ticketsApi.get(id), ticketsApi.comments(id)])
      .then(([t, c]) => {
        setTicket(t.data);
        setComments(c.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Не удалось загрузить заявку");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleCommentAdded = (newComment) => {
    setComments((prev) => [...prev, newComment]);
  };

  const handleStatusChanged = (newStatusId) => {
    setTicket((prev) => ({
      ...prev,
      status: { ...prev.status, id: newStatusId },
    }));
    ticketsApi.get(id).then((res) => setTicket(res.data));
  };

  // Назначение исполнителя (вызывается из модалки)
  const handleAssigned = async (executorId) => {
    await ticketsApi.assignExecutor(ticket.id, executorId);
    const res = await ticketsApi.get(id);
    setTicket(res.data);
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Загрузка...</p>;
  }

  if (error) {
    return (
      <div>
        <button
          onClick={() => navigate("/tickets")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Назад
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  const canChangeStatus = user?.role === "executor" || user?.role === "admin";
  const canAssign = user?.role === "admin";

  return (
    <div>
      {/* Назад */}
      <button
        onClick={() => navigate("/tickets")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад к заявкам
      </button>

      {/* Заголовок */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <span>#{ticket.id}</span>
          <span>·</span>
          <span>{ticket.category.name}</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {ticket.subject}
        </h1>

        <div className="flex flex-wrap items-center gap-3 mt-3">
          <StatusBadge status={ticket.status.name} />
          <PriorityBadge priority={ticket.priority.name} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая часть — основная */}
        <div className="lg:col-span-2 space-y-6">
          {/* Описание */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Описание
            </h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          {/* Комментарии */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
              Комментарии ({comments.length})
            </h2>
            <CommentList comments={comments} />
            <div className="mt-4 pt-4 border-t border-gray-100">
              <CommentForm ticketId={ticket.id} onAdded={handleCommentAdded} />
            </div>
          </div>
        </div>

        {/* Правая часть — мета */}
        <div className="space-y-4">
          {/* Информация */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">
              Информация
            </h3>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Автор</p>
                <p className="text-gray-900">{ticket.author.name}</p>
                {ticket.author.department && (
                  <p className="text-xs text-gray-500">
                    {ticket.author.department}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-0.5">Создано</p>
                <p className="text-gray-900">
                  {format(new Date(ticket.createdAt), "dd.MM.yyyy HH:mm", {
                    locale: ru,
                  })}
                </p>
              </div>

              {ticket.closedAt && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Закрыто</p>
                  <p className="text-gray-900">
                    {format(new Date(ticket.closedAt), "dd.MM.yyyy HH:mm", {
                      locale: ru,
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Исполнитель */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              Исполнитель
            </h3>

            {ticket.assignee ? (
              <div className="flex items-center gap-3">
                <Avatar name={ticket.assignee.name} size="sm" />
                <p className="text-sm font-medium text-gray-900 truncate">
                  {ticket.assignee.name}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">— Не назначен</p>
            )}

            {canAssign && (
              <button
                onClick={() => setAssignModalOpen(true)}
                className="mt-3 w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg py-2 hover:bg-gray-50 transition"
              >
                <UserPlus className="w-4 h-4" />
                {ticket.assignee ? "Изменить исполнителя" : "Назначить исполнителя"}
              </button>
            )}
          </div>

          {/* Действия */}
          {canChangeStatus && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Сменить статус
              </h3>
              <StatusChanger
                ticketId={ticket.id}
                currentStatusId={ticket.status.id}
                onChanged={handleStatusChanged}
              />
            </div>
          )}

          {/* Приоритет */}
          {canChangeStatus && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Приоритет
              </h3>
              <PriorityChanger
                ticketId={ticket.id}
                currentPriorityId={ticket.priority.id}
                onChanged={() =>
                  ticketsApi.get(id).then((res) => setTicket(res.data))
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* Модалка назначения исполнителя */}
      {canAssign && (
        <AssignExecutorModal
          open={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          ticket={ticket}
          currentAssigneeId={ticket.assignee?.id || null}
          onAssigned={handleAssigned}
        />
      )}
    </div>
  );
}