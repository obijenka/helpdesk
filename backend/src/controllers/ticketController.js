const pool = require('../config/db');

exports.getTickets = async (req, res) => {
  const { id: userId, role } = req.user;
  const { status, priority, category, search, assignee } = req.query;

  try {
    let sql = `
      SELECT 
        t.ticket_id, t.subject, t.description,
        t.created_at, t.updated_at, t.closed_at,
        s.status_id, s.name AS status_name,
        p.priority_id, p.name AS priority_name, p.level AS priority_level,
        c.category_id, c.name AS category_name,
        u1.user_id AS author_id, u1.full_name AS author_name,
        u2.user_id AS assignee_id, u2.full_name AS assignee_name
      FROM tickets t
      JOIN statuses s ON t.status_id = s.status_id
      JOIN priorities p ON t.priority_id = p.priority_id
      JOIN categories c ON t.category_id = c.category_id
      JOIN users u1 ON t.author_id = u1.user_id
      LEFT JOIN users u2 ON t.assignee_id = u2.user_id
      WHERE 1=1
    `;

    const params = [];

    // Принудительные фильтры по роли
    if (role === 'user') {
      sql += ' AND t.author_id = ?';
      params.push(userId);
    } else if (role === 'executor') {
      sql += ' AND t.assignee_id = ?';
      params.push(userId);
    }

    // Фильтры из query-параметров
    if (status) {
      sql += ' AND t.status_id = ?';
      params.push(status);
    }
    if (priority) {
      sql += ' AND t.priority_id = ?';
      params.push(priority);
    }
    if (category) {
      sql += ' AND t.category_id = ?';
      params.push(category);
    }
    if (assignee && role === 'admin') {
      sql += ' AND t.assignee_id = ?';
      params.push(assignee);
    }
    if (search) {
      sql += ' AND (t.subject LIKE ? OR t.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY t.created_at DESC';

    const [rows] = await pool.query(sql, params);

    const tickets = rows.map((r) => ({
      id: r.ticket_id,
      subject: r.subject,
      description: r.description,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      closedAt: r.closed_at,
      status: { id: r.status_id, name: r.status_name },
      priority: { id: r.priority_id, name: r.priority_name, level: r.priority_level },
      category: { id: r.category_id, name: r.category_name },
      author: { id: r.author_id, name: r.author_name },
      assignee: r.assignee_id
        ? { id: r.assignee_id, name: r.assignee_name }
        : null,
    }));

    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

exports.getMeta = async (req, res) => {
  try {
    const [[statuses], [priorities], [categories]] = await Promise.all([
      pool.query('SELECT status_id AS id, name FROM statuses ORDER BY status_id'),
      pool.query('SELECT priority_id AS id, name, level FROM priorities ORDER BY level DESC'),
      pool.query('SELECT category_id AS id, name FROM categories ORDER BY name'),
    ]);

    res.json({ statuses, priorities, categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получить одну заявку
exports.getTicketById = async (req, res) => {
  const { id } = req.params;
  const { id: userId, role } = req.user;

  try {
    const [rows] = await pool.query(
      `SELECT 
        t.ticket_id, t.subject, t.description,
        t.created_at, t.updated_at, t.closed_at,
        s.status_id, s.name AS status_name,
        p.priority_id, p.name AS priority_name, p.level AS priority_level,
        c.category_id, c.name AS category_name,
        u1.user_id AS author_id, u1.full_name AS author_name, u1.email AS author_email,
        d.name AS author_department,
        u2.user_id AS assignee_id, u2.full_name AS assignee_name
      FROM tickets t
      JOIN statuses s ON t.status_id = s.status_id
      JOIN priorities p ON t.priority_id = p.priority_id
      JOIN categories c ON t.category_id = c.category_id
      JOIN users u1 ON t.author_id = u1.user_id
      LEFT JOIN departments d ON u1.department_id = d.department_id
      LEFT JOIN users u2 ON t.assignee_id = u2.user_id
      WHERE t.ticket_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    const r = rows[0];

    // Проверка прав: user видит только свои, executor — назначенные, admin — все
    if (role === 'user' && r.author_id !== userId) {
      return res.status(403).json({ message: 'Нет доступа к этой заявке' });
    }
    if (role === 'executor' && r.assignee_id !== userId) {
      return res.status(403).json({ message: 'Нет доступа к этой заявке' });
    }

    res.json({
      id: r.ticket_id,
      subject: r.subject,
      description: r.description,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      closedAt: r.closed_at,
      status: { id: r.status_id, name: r.status_name },
      priority: { id: r.priority_id, name: r.priority_name, level: r.priority_level },
      category: { id: r.category_id, name: r.category_name },
      author: {
        id: r.author_id,
        name: r.author_name,
        email: r.author_email,
        department: r.author_department,
      },
      assignee: r.assignee_id
        ? { id: r.assignee_id, name: r.assignee_name }
        : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Комментарии заявки
exports.getComments = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT 
        c.comment_id, c.text, c.created_at,
        u.user_id, u.full_name, u.email,
        r.name AS role
      FROM comments c
      JOIN users u ON c.user_id = u.user_id
      JOIN roles r ON u.role_id = r.role_id
      WHERE c.ticket_id = ?
      ORDER BY c.created_at ASC`,
      [id]
    );

    const comments = rows.map((r) => ({
      id: r.comment_id,
      text: r.text,
      createdAt: r.created_at,
      user: {
        id: r.user_id,
        name: r.full_name,
        email: r.email,
        role: r.role,
      },
    }));

    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Добавить комментарий
exports.addComment = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const userId = req.user.id;

  if (!text || !text.trim()) {
    return res.status(400).json({ message: 'Текст комментария не может быть пустым' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO comments (ticket_id, user_id, text) VALUES (?, ?, ?)',
      [id, userId, text.trim()]
    );

    // Возвращаем созданный комментарий
    const [rows] = await pool.query(
      `SELECT 
        c.comment_id, c.text, c.created_at,
        u.user_id, u.full_name, u.email,
        r.name AS role
      FROM comments c
      JOIN users u ON c.user_id = u.user_id
      JOIN roles r ON u.role_id = r.role_id
      WHERE c.comment_id = ?`,
      [result.insertId]
    );

    const r = rows[0];
    res.status(201).json({
      id: r.comment_id,
      text: r.text,
      createdAt: r.created_at,
      user: { id: r.user_id, name: r.full_name, email: r.email, role: r.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Сменить статус
exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { statusId } = req.body;
  const { id: userId, role } = req.user;

  if (role === 'user') {
    return res.status(403).json({ message: 'Недостаточно прав' });
  }

  try {
    // Проверяем, что заявка доступна
    const [tickets] = await pool.query(
      'SELECT assignee_id, status_id FROM tickets WHERE ticket_id = ?',
      [id]
    );

    if (tickets.length === 0) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    if (role === 'executor' && tickets[0].assignee_id !== userId) {
      return res.status(403).json({ message: 'Заявка назначена не вам' });
    }

    const oldStatusId = tickets[0].status_id;

    // Обновляем
    let sql = 'UPDATE tickets SET status_id = ?';
    const params = [statusId];

    // Если статус "Закрыта" — проставляем closed_at
    const [status] = await pool.query('SELECT name FROM statuses WHERE status_id = ?', [statusId]);
    if (status[0]?.name === 'Закрыта') {
      sql += ', closed_at = NOW()';
    }

    sql += ' WHERE ticket_id = ?';
    params.push(id);

    await pool.query(sql, params);

    // Записываем в историю
    await pool.query(
      `INSERT INTO ticket_history (ticket_id, user_id, field_name, old_value, new_value)
       VALUES (?, ?, 'status', ?, ?)`,
      [id, userId, String(oldStatusId), String(statusId)]
    );

    res.json({ message: 'Статус обновлён' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Назначить исполнителя (только админ)
exports.assignExecutor = async (req, res) => {
  const { id } = req.params;
  const { assigneeId } = req.body;
  const { id: userId, role } = req.user;

  if (role !== 'admin') {
    return res.status(403).json({ message: 'Только администратор может назначать исполнителя' });
  }

  try {
    const [old] = await pool.query('SELECT assignee_id FROM tickets WHERE ticket_id = ?', [id]);
    const oldAssignee = old[0]?.assignee_id;

    await pool.query(
      'UPDATE tickets SET assignee_id = ? WHERE ticket_id = ?',
      [assigneeId || null, id]
    );

    await pool.query(
      `INSERT INTO ticket_history (ticket_id, user_id, field_name, old_value, new_value)
       VALUES (?, ?, 'assignee', ?, ?)`,
      [id, userId, String(oldAssignee || ''), String(assigneeId || '')]
    );

    res.json({ message: 'Исполнитель назначен' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Список исполнителей (для админа)
exports.getExecutors = async (req, res) => {
  const { role } = req.user;

  if (role !== 'admin') {
    return res.status(403).json({ message: 'Недостаточно прав' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT u.user_id, u.full_name, u.email, d.name AS department
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       LEFT JOIN departments d ON u.department_id = d.department_id
       WHERE r.name = 'executor' AND u.is_active = 1
       ORDER BY u.full_name`
    );

    res.json(
      rows.map((r) => ({
        id: r.user_id,
        name: r.full_name,
        email: r.email,
        department: r.department,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Создать заявку
exports.createTicket = async (req, res) => {
  const { subject, description, categoryId, priorityId } = req.body;
  const userId = req.user.id;
  const { role } = req.user;

  // Только пользователи могут создавать заявки
  if (role !== 'user') {
    return res.status(403).json({ message: 'Только сотрудники могут создавать заявки' });
  }

  // Валидация
  if (!subject?.trim() || !description?.trim()) {
    return res.status(400).json({ message: 'Заполните тему и описание' });
  }
  if (subject.length > 200) {
    return res.status(400).json({ message: 'Тема не должна превышать 200 символов' });
  }
  if (!categoryId || !priorityId) {
    return res.status(400).json({ message: 'Выберите категорию и приоритет' });
  }

  try {
    // Статус "Новая" — ID 1
    const [statusRows] = await pool.query(
      "SELECT status_id FROM statuses WHERE name = 'Новая' LIMIT 1"
    );
    const statusId = statusRows[0]?.status_id || 1;

    const [result] = await pool.query(
      `INSERT INTO tickets 
        (author_id, status_id, priority_id, category_id, subject, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, statusId, priorityId, categoryId, subject.trim(), description.trim()]
    );

    // Запись в историю
    await pool.query(
      `INSERT INTO ticket_history (ticket_id, user_id, field_name, new_value)
       VALUES (?, ?, 'status', 'Новая')`,
      [result.insertId, userId]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Заявка создана',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

exports.updatePriority = async (req, res) => {
  const { id } = req.params;
  const { priorityId } = req.body;
  const { id: userId, role } = req.user;

  if (role === 'user') {
    return res.status(403).json({ message: 'Недостаточно прав' });
  }

  try {
    const [tickets] = await pool.query(
      'SELECT assignee_id, priority_id FROM tickets WHERE ticket_id = ?',
      [id]
    );

    if (tickets.length === 0) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }
    if (role === 'executor' && tickets[0].assignee_id !== userId) {
      return res.status(403).json({ message: 'Заявка назначена не вам' });
    }

    const oldId = tickets[0].priority_id;

    await pool.query(
      'UPDATE tickets SET priority_id = ? WHERE ticket_id = ?',
      [priorityId, id]
    );

    await pool.query(
      `INSERT INTO ticket_history (ticket_id, user_id, field_name, old_value, new_value)
       VALUES (?, ?, 'priority', ?, ?)`,
      [id, userId, String(oldId), String(priorityId)]
    );

    res.json({ message: 'Приоритет обновлён' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};