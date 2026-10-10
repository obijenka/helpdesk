const bcrypt = require('bcrypt');
const pool = require('../config/db');

// Получить профиль
exports.getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.user_id, u.full_name, u.email, u.position, u.created_at,
              r.name AS role, d.name AS department, d.department_id
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       LEFT JOIN departments d ON u.department_id = d.department_id
       WHERE u.user_id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const u = rows[0];

    // Статистика по заявкам (для пользователя)
    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN s.name IN ('Решена', 'Закрыта') THEN 1 ELSE 0 END) AS resolved,
        SUM(CASE WHEN s.name IN ('Новая', 'В работе', 'Ожидает ответа') THEN 1 ELSE 0 END) AS active
       FROM tickets t
       JOIN statuses s ON t.status_id = s.status_id
       WHERE t.author_id = ?`,
      [req.user.id]
    );

    res.json({
      id: u.user_id,
      fullName: u.full_name,
      email: u.email,
      position: u.position,
      role: u.role,
      department: u.department,
      departmentId: u.department_id,
      createdAt: u.created_at,
      stats: {
        total: Number(stats[0].total) || 0,
        resolved: Number(stats[0].resolved) || 0,
        active: Number(stats[0].active) || 0,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Обновить профиль
exports.updateProfile = async (req, res) => {
  const { fullName, position } = req.body;

  if (!fullName?.trim()) {
    return res.status(400).json({ message: 'ФИО не может быть пустым' });
  }
  if (fullName.length > 150) {
    return res.status(400).json({ message: 'ФИО слишком длинное' });
  }

  try {
    await pool.query(
      'UPDATE users SET full_name = ?, position = ? WHERE user_id = ?',
      [fullName.trim(), position?.trim() || null, req.user.id]
    );

    res.json({ message: 'Профиль обновлён' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Сменить пароль
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Заполните все поля' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Пароль должен быть не менее 6 символов' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT password_hash FROM users WHERE user_id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const isValid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!isValid) {
      return res.status(400).json({ message: 'Текущий пароль неверен' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE users SET password_hash = ? WHERE user_id = ?',
      [newHash, req.user.id]
    );

    res.json({ message: 'Пароль изменён' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};