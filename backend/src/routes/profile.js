const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', profileController.getProfile);
router.patch('/', profileController.updateProfile);
router.patch('/password', profileController.changePassword);

module.exports = router;