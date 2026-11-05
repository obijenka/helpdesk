const pool = require('../config/db');

// Список уведомлений текущего пользователя
exports.getNotifications = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        n.notification_id, n.ticket_id, n.message, n.is_read, n.created_at,
        t.subject AS ticket_subject
       FROM notifications n
       LEFT JOIN tickets t ON n.ticket_id = t.ticket_id
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC
       LIMIT 100`,
      [req.user.id]
    );

    res.json(
      rows.map((r) => ({
        id: r.notification_id,
        ticketId: r.ticket_id,
        ticketSubject: r.ticket_subject,
        message: r.message,
        isRead: !!r.is_read,
        createdAt: r.created_at,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Количество непрочитанных
exports.getUnreadCount = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    );
    res.json({ count: Number(rows[0].count) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Отметить одно прочитанным
exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      'UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?',
      [id, req.user.id]
    );
    res.json({ message: 'Прочитано' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Отметить все прочитанными
exports.markAllAsRead = async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    );
    res.json({ message: 'Все прочитаны' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Удалить уведомление
exports.deleteNotification = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      'DELETE FROM notifications WHERE notification_id = ? AND user_id = ?',
      [id, req.user.id]
    );
    res.json({ message: 'Удалено' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};