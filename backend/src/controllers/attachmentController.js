const path = require('path');
const fs = require('fs');
const pool = require('../config/db');
const { UPLOAD_DIR } = require('../middleware/upload');

// Загрузить файл к заявке
exports.uploadAttachment = async (req, res) => {
  const { ticketId } = req.params;
  const userId = req.user.id;

  if (!req.file) {
    return res.status(400).json({ message: 'Файл не загружен' });
  }

  try {
    // Проверка: заявка существует и доступна
    const [tickets] = await pool.query(
      'SELECT author_id, assignee_id FROM tickets WHERE ticket_id = ?',
      [ticketId]
    );

    if (tickets.length === 0) {
      // Удаляем загруженный файл
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    const { author_id, assignee_id } = tickets[0];
    const { role } = req.user;

    if (
      (role === 'user' && author_id !== userId) ||
      (role === 'executor' && assignee_id !== userId)
    ) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ message: 'Нет доступа к этой заявке' });
    }

    // Лимит: 5 файлов на заявку
    const [count] = await pool.query(
      'SELECT COUNT(*) AS count FROM attachments WHERE ticket_id = ?',
      [ticketId]
    );

    if (count[0].count >= 5) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Максимум 5 вложений на заявку' });
    }

    // Сохраняем в БД
    const [result] = await pool.query(
      `INSERT INTO attachments (ticket_id, user_id, file_name, file_path)
       VALUES (?, ?, ?, ?)`,
      [ticketId, userId, req.file.originalname, req.file.filename]
    );

    res.status(201).json({
      id: result.insertId,
      fileName: req.file.originalname,
      filePath: req.file.filename,
      uploadedAt: new Date(),
    });
  } catch (err) {
    console.error(err);
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch {}
    }
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Список вложений заявки
exports.getAttachments = async (req, res) => {
  const { ticketId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT 
        a.attachment_id, a.file_name, a.file_path, a.uploaded_at,
        u.user_id, u.full_name AS user_name
       FROM attachments a
       JOIN users u ON a.user_id = u.user_id
       WHERE a.ticket_id = ?
       ORDER BY a.uploaded_at ASC`,
      [ticketId]
    );

    res.json(
      rows.map((r) => ({
        id: r.attachment_id,
        fileName: r.file_name,
        filePath: r.file_path,
        uploadedAt: r.uploaded_at,
        user: { id: r.user_id, name: r.user_name },
        url: `/api/attachments/download/${r.attachment_id}`,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Скачать файл
exports.downloadAttachment = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT file_name, file_path FROM attachments WHERE attachment_id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Файл не найден' });
    }

    const { file_name, file_path } = rows[0];
    const fullPath = path.join(UPLOAD_DIR, file_path);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'Файл отсутствует на сервере' });
    }

    res.download(fullPath, file_name);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Удалить вложение
exports.deleteAttachment = async (req, res) => {
  const { id } = req.params;
  const { id: userId, role } = req.user;

  try {
    const [rows] = await pool.query(
      'SELECT user_id, file_path FROM attachments WHERE attachment_id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Файл не найден' });
    }

    const { user_id, file_path } = rows[0];

    // Удалить может: автор файла или админ
    if (user_id !== userId && role !== 'admin') {
      return res.status(403).json({ message: 'Нет прав на удаление' });
    }

    const fullPath = path.join(UPLOAD_DIR, file_path);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    await pool.query('DELETE FROM attachments WHERE attachment_id = ?', [id]);

    res.json({ message: 'Файл удалён' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};