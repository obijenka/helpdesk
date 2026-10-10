import { useEffect, useState } from 'react';
import { RefreshCw, Download } from 'lucide-react';
import { reportsApi } from '../api/reports';
import { exportToCsv } from '../utils/exportCsv';
import KpiCards from '../components/reports/KpiCards';
import StatusPieChart from '../components/reports/StatusPieChart';
import CategoryBarChart from '../components/reports/CategoryBarChart';
import DailyLineChart from '../components/reports/DailyLineChart';
import TopExecutors from '../components/reports/TopExecutors';

const PERIODS = [
  { value: 'week', label: 'За неделю' },
  { value: 'month', label: 'За месяц' },
  { value: 'quarter', label: 'За 3 месяца' },
  { value: 'all', label: 'Всё время' },
];

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const load = (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    reportsApi
      .summary(period)
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    load();
  }, [period]);

  // Экспорт в CSV
  const handleExport = () => {
    if (!data) return;

    const rows = [
      ...data.byStatus.map((s) => ({
        'Тип': 'Статус',
        'Название': s.name,
        'Количество': s.count,
      })),
      ...data.byCategory.map((c) => ({
        'Тип': 'Категория',
        'Название': c.name,
        'Количество': c.count,
      })),
      ...data.byPriority.map((p) => ({
        'Тип': 'Приоритет',
        'Название': p.name,
        'Количество': p.count,
      })),
      ...data.topExecutors.map((e) => ({
        'Тип': 'Исполнитель',
        'Название': e.name,
        'Количество': e.resolvedCount,
      })),
    ];

    exportToCsv(`report-${period}-${Date.now()}.csv`, rows);
  };

  if (loading && !data) {
    return <p className="text-sm text-gray-500">Загрузка...</p>;
  }

  if (!data) {
    return <p className="text-sm text-red-600">Не удалось загрузить отчёты</p>;
  }

  return (
    <div>
      {/* Заголовок + кнопки */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Отчёты</h1>
          <p className="text-sm text-gray-500 mt-1">
            Статистика работы службы технической поддержки
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Кнопка обновления */}
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50"
            title="Обновить"
          >
            <RefreshCw
              className={`w-4 h-4 text-gray-600 ${
                refreshing ? 'animate-spin' : ''
              }`}
            />
          </button>

          {/* Кнопка CSV */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 h-9 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            title="Скачать CSV"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>

          {/* Фильтр по периоду */}
          <div className="flex items-center bg-white border border-gray-300 rounded-lg p-0.5">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                  period === p.value
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI */}
      <div className="mb-6">
        <KpiCards kpi={data.kpi} />
      </div>

      {/* Диаграммы: статусы + категории */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
            Распределение по статусам
          </h2>
          <StatusPieChart data={data.byStatus} />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
            Заявки по категориям
          </h2>
          <CategoryBarChart data={data.byCategory} />
        </div>
      </div>

      {/* Динамика по дням */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
          Динамика заявок по дням
        </h2>
        <DailyLineChart data={data.byDay} />
      </div>

      {/* Топ исполнителей */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
          Топ исполнителей по решённым заявкам
        </h2>
        <TopExecutors executors={data.topExecutors} />
      </div>
    </div>
  );
}