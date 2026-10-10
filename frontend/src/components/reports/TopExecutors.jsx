import Avatar from '../ui/Avatar';

export default function TopExecutors({ executors }) {
  if (executors.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
        Нет данных
      </p>
    );
  }

  const maxResolved = Math.max(...executors.map((e) => e.resolvedCount), 1);

  return (
    <div className="space-y-4">
      {executors.map((e, idx) => {
        const percent = (e.resolvedCount / maxResolved) * 100;
        return (
          <div key={e.id}>
            <div className="flex items-center gap-3 mb-1.5">
              <span className="text-xs text-gray-400 w-4 text-right">
                {idx + 1}
              </span>
              <Avatar name={e.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {e.name}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-medium text-gray-900">
                  {e.resolvedCount}
                </p>
                <p className="text-xs text-gray-400">
                  активных: {e.activeCount}
                </p>
              </div>
            </div>
            <div className="ml-7 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}