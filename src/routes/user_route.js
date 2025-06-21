const express = require('express');
const multer = require('multer');
const router = express.Router();
const userController = require('../controllers/user_controller');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/register', upload.single('url_user_image'), userController.registerUser)
router.get('/:id/profile_picture', userController.getProfileImage)
router.post('/login', upload.none(), userController.loginUser);
router.get('/:id', userController.getUserById);

module.exports = router;
