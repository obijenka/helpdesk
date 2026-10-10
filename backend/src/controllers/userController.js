const bcrypt = require('bcrypt');
const pool = require('../config/db');

// Список пользователей (только админ)
exports.getUsers = async (req, res) => {
  const { search, role, department } = req.query;

  try {
    let sql = `
      SELECT u.user_id, u.full_name, u.email, u.position, u.is_active, u.created_at,
             r.role_id, r.name AS role_name,
             d.department_id, d.name AS department_name
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN departments d ON u.department_id = d.department_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ' AND (u.full_name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (role) {
      sql += ' AND r.role_id = ?';
      params.push(role);
    }
    if (department) {
      sql += ' AND d.department_id = ?';
      params.push(department);
    }

    sql += ' ORDER BY u.full_name';

    const [rows] = await pool.query(sql, params);

    res.json(
      rows.map((r) => ({
        id: r.user_id,
        fullName: r.full_name,
        email: r.email,
        position: r.position,
        isActive: !!r.is_active,
        createdAt: r.created_at,
        role: { id: r.role_id, name: r.role_name },
        department: r.department_id
          ? { id: r.department_id, name: r.department_name }
          : null,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Справочники для формы (роли, отделы)
exports.getMeta = async (req, res) => {
  try {
    const [[roles], [departments]] = await Promise.all([
      pool.query('SELECT role_id AS id, name FROM roles ORDER BY role_id'),
      pool.query('SELECT department_id AS id, name FROM departments ORDER BY name'),
    ]);

    res.json({ roles, departments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Создать пользователя
exports.createUser = async (req, res) => {
  const { fullName, email, password, roleId, departmentId, position } = req.body;

  if (!fullName?.trim() || !email?.trim() || !password || !roleId) {
    return res.status(400).json({ message: 'Заполните обязательные поля' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Пароль должен быть не менее 6 символов' });
  }

  try {
    const [exists] = await pool.query(
      'SELECT user_id FROM users WHERE email = ?',
      [email.trim().toLowerCase()]
    );
    if (exists.length > 0) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users 
        (role_id, department_id, full_name, email, password_hash, position, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [
        roleId,
        departmentId || null,
        fullName.trim(),
        email.trim().toLowerCase(),
        passwordHash,
        position?.trim() || null,
      ]
    );

    res.status(201).json({ id: result.insertId, message: 'Пользователь создан' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Обновить пользователя
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { fullName, roleId, departmentId, position, isActive } = req.body;

  if (!fullName?.trim() || !roleId) {
    return res.status(400).json({ message: 'Заполните обязательные поля' });
  }

  try {
    await pool.query(
      `UPDATE users 
       SET full_name = ?, role_id = ?, department_id = ?, position = ?, is_active = ?
       WHERE user_id = ?`,
      [
        fullName.trim(),
        roleId,
        departmentId || null,
        position?.trim() || null,
        isActive ? 1 : 0,
        id,
      ]
    );

    res.json({ message: 'Пользователь обновлён' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Сбросить пароль
exports.resetPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Пароль должен быть не менее 6 символов' });
  }

  try {
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [hash, id]);

    res.json({ message: 'Пароль сброшен' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

exports.getExecutorsWithLoad = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        u.user_id, u.full_name, u.email, u.position,
        d.name AS department,
        COUNT(CASE WHEN s.name IN ('Новая', 'В работе', 'Ожидает ответа') 
              THEN 1 END) AS active_count,
        COUNT(CASE WHEN s.name IN ('Решена', 'Закрыта') 
              THEN 1 END) AS resolved_count,
        COUNT(t.ticket_id) AS total_count,
        ROUND(AVG(CASE 
          WHEN s.name IN ('Решена', 'Закрыта') AND t.closed_at IS NOT NULL
          THEN TIMESTAMPDIFF(MINUTE, t.created_at, t.closed_at)
        END), 0) AS avg_resolution_minutes,
        (SELECT MAX(c.created_at) 
         FROM comments c 
         WHERE c.user_id = u.user_id) AS last_comment_at,
        (SELECT MAX(th.changed_at) 
         FROM ticket_history th 
         WHERE th.user_id = u.user_id) AS last_action_at
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN departments d ON u.department_id = d.department_id
      LEFT JOIN tickets t ON t.assignee_id = u.user_id
      LEFT JOIN statuses s ON t.status_id = s.status_id
      WHERE r.name = 'executor' AND u.is_active = 1
      GROUP BY u.user_id
      ORDER BY active_count ASC, u.full_name`
    );

    const executors = rows.map((r) => {
      // Последняя активность = максимум из комментария и действия
      const dates = [r.last_comment_at, r.last_action_at].filter(Boolean);
      const lastActiveAt = dates.length
        ? new Date(Math.max(...dates.map((d) => new Date(d).getTime())))
        : null;

      // "Онлайн" — активность за последние 15 минут
      const isOnline = lastActiveAt
        ? Date.now() - lastActiveAt.getTime() < 15 * 60 * 1000
        : false;

      return {
        id: r.user_id,
        name: r.full_name,
        email: r.email,
        position: r.position,
        department: r.department,
        activeCount: Number(r.active_count),
        resolvedCount: Number(r.resolved_count),
        totalCount: Number(r.total_count),
        avgResolutionMinutes: r.avg_resolution_minutes
          ? Number(r.avg_resolution_minutes)
          : null,
        lastActiveAt,
        isOnline,
        loadLevel:
          r.active_count >= 5 ? 'high' :
          r.active_count >= 3 ? 'medium' : 'low',
      };
    });

    res.json(executors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};