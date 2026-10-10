const pool = require('../config/db');

exports.getSummary = async (req, res) => {
  const { period = 'all' } = req.query;

  // Определяем дату начала
  let dateFilter = '';
  const params = [];

  if (period === 'week') {
    dateFilter = ' AND t.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
  } else if (period === 'month') {
    dateFilter = ' AND t.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
  } else if (period === 'quarter') {
    dateFilter = ' AND t.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)';
  }
  // period === 'all' → без фильтра

  try {
    // 1. KPI
    const [kpiRows] = await pool.query(
      `SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN s.name IN ('Новая', 'В работе', 'Ожидает ответа') 
            THEN 1 ELSE 0 END) AS open_count,
        SUM(CASE WHEN s.name IN ('Решена', 'Закрыта') 
            THEN 1 ELSE 0 END) AS closed_count,
        ROUND(AVG(CASE 
          WHEN s.name IN ('Решена', 'Закрыта') AND t.closed_at IS NOT NULL
          THEN TIMESTAMPDIFF(MINUTE, t.created_at, t.closed_at)
        END), 0) AS avg_resolution_minutes
      FROM tickets t
      JOIN statuses s ON t.status_id = s.status_id
      WHERE 1=1 ${dateFilter}`
    );

    const kpi = kpiRows[0];

    // 2. По статусам
    const [byStatus] = await pool.query(
      `SELECT s.name, COUNT(t.ticket_id) AS count
       FROM statuses s
       LEFT JOIN tickets t ON t.status_id = s.status_id 
         ${dateFilter ? dateFilter.replace('t.created_at', 't.created_at') : ''}
       GROUP BY s.status_id
       ORDER BY s.status_id`
    );

    // 3. По категориям
    const [byCategory] = await pool.query(
      `SELECT c.name, COUNT(t.ticket_id) AS count
       FROM categories c
       LEFT JOIN tickets t ON t.category_id = c.category_id 
         ${dateFilter ? dateFilter : ''}
       GROUP BY c.category_id
       ORDER BY count DESC`
    );

    // 4. По приоритетам
    const [byPriority] = await pool.query(
      `SELECT p.name, p.level, COUNT(t.ticket_id) AS count
       FROM priorities p
       LEFT JOIN tickets t ON t.priority_id = p.priority_id 
         ${dateFilter ? dateFilter : ''}
       GROUP BY p.priority_id
       ORDER BY p.level DESC`
    );

    // 5. Топ исполнителей
    const [topExecutors] = await pool.query(
      `SELECT 
        u.user_id, u.full_name,
        COUNT(CASE WHEN s.name IN ('Решена', 'Закрыта') 
              THEN 1 END) AS resolved_count,
        COUNT(CASE WHEN s.name IN ('Новая', 'В работе', 'Ожидает ответа') 
              THEN 1 END) AS active_count
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       LEFT JOIN tickets t ON t.assignee_id = u.user_id 
         ${dateFilter ? dateFilter : ''}
       LEFT JOIN statuses s ON t.status_id = s.status_id
       WHERE r.name = 'executor' AND u.is_active = 1
       GROUP BY u.user_id
       ORDER BY resolved_count DESC, u.full_name
       LIMIT 10`
    );

    // 6. Динамика по дням (для линейного графика)
    const daysBack = period === 'week' ? 7 : period === 'month' ? 30 : period === 'quarter' ? 90 : 30;

    const [byDay] = await pool.query(
      `SELECT 
        DATE(t.created_at) AS date,
        COUNT(*) AS count
       FROM tickets t
       WHERE t.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(t.created_at)
       ORDER BY date ASC`,
      [daysBack]
    );

    res.json({
      period,
      kpi: {
        total: Number(kpi.total) || 0,
        open: Number(kpi.open_count) || 0,
        closed: Number(kpi.closed_count) || 0,
        avgResolutionMinutes: kpi.avg_resolution_minutes
          ? Number(kpi.avg_resolution_minutes)
          : null,
      },
      byStatus: byStatus.map((r) => ({
        name: r.name,
        count: Number(r.count),
      })),
      byCategory: byCategory.map((r) => ({
        name: r.name,
        count: Number(r.count),
      })),
      byPriority: byPriority.map((r) => ({
        name: r.name,
        level: r.level,
        count: Number(r.count),
      })),
      topExecutors: topExecutors.map((r) => ({
        id: r.user_id,
        name: r.full_name,
        resolvedCount: Number(r.resolved_count),
        activeCount: Number(r.active_count),
      })),
      byDay: byDay.map((r) => ({
        date: r.date,
        count: Number(r.count),
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};