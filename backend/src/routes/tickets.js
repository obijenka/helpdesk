const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/meta', ticketController.getMeta);
router.get('/executors', ticketController.getExecutors);

router.get('/', ticketController.getTickets);
router.post('/', ticketController.createTicket);

router.get('/:id', ticketController.getTicketById);
router.get('/:id/comments', ticketController.getComments);
router.post('/:id/comments', ticketController.addComment);
router.patch('/:id/status', ticketController.updateStatus);
router.patch('/:id/priority', ticketController.updatePriority);
router.patch('/:id/assignee', ticketController.assignExecutor);


module.exports = router;