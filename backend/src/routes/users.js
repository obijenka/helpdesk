const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

router.use(authMiddleware);
router.use(roleMiddleware('admin'));  // только админ

router.get('/meta', userController.getMeta);
router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.get('/executors-with-load', userController.getExecutorsWithLoad);
router.patch('/:id', userController.updateUser);
router.patch('/:id/password', userController.resetPassword);

module.exports = router;