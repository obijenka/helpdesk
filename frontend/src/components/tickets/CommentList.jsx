import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Avatar from '../ui/Avatar';

export default function CommentList({ comments }) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-4 text-center">
        Комментариев пока нет
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((c) => (
        <div key={c.id} className="flex gap-3">
          <Avatar name={c.user.name} size="sm" />
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-gray-900">
                {c.user.name}
              </span>
              <span className="text-xs text-gray-400">
                {c.user.role === 'executor' && '· исполнитель'}
                {c.user.role === 'admin' && '· админ'}
              </span>
              <span className="text-xs text-gray-400 ml-auto">
                {format(new Date(c.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
              </span>
            </div>
            <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
              {c.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}