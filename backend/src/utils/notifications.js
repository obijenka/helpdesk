const pool = require('../config/db');

/**
 * Создать уведомление
 * @param {number} userId - кому
 * @param {number|null} ticketId - по какой заявке
 * @param {string} message - текст
 */
async function createNotification(userId, ticketId, message) {
  if (!userId) return;
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, ticket_id, message, is_read)
       VALUES (?, ?, ?, 0)`,
      [userId, ticketId || null, message]
    );
  } catch (err) {
    console.error('Ошибка создания уведомления:', err);
  }
}

/**
 * Создать уведомления нескольким пользователям
 */
async function createNotificationForMany(userIds, ticketId, message) {
  if (!userIds || userIds.length === 0) return;
  for (const userId of userIds) {
    await createNotification(userId, ticketId, message);
  }
}

/**
 * Получить всех админов
 */
async function getAdminIds() {
  const [rows] = await pool.query(
    `SELECT u.user_id FROM users u
     JOIN roles r ON u.role_id = r.role_id
     WHERE r.name = 'admin' AND u.is_active = 1`
  );
  return rows.map((r) => r.user_id);
}

module.exports = {
  createNotification,
  createNotificationForMany,
  getAdminIds,
};