const express = require('express');
const router = express.Router();
const attachmentController = require('../controllers/attachmentController');
const authMiddleware = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(authMiddleware);

// Загрузка (multipart/form-data)
router.post(
  '/:ticketId',
  upload.single('file'),
  attachmentController.uploadAttachment
);

// Список
router.get('/:ticketId', attachmentController.getAttachments);

// Скачать
router.get('/download/:id', attachmentController.downloadAttachment);

// Удалить
router.delete('/:id', attachmentController.deleteAttachment);

module.exports = router;