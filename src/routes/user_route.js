const express = require('express');
const multer = require('multer');
const router = express.Router();
const userController = require('../controllers/user_controller');
const upload = multer({ storage: multer.memoryStorage() });
const authentication = require('../middleware/authentication');

router.post('/register', upload.single('url_user_image'), userController.registerUser);
router.post('/update_profile',authentication, upload.none(),userController.updateProfile);
router.get('/:id/profile_picture', userController.getProfileImage);
router.post('/login', upload.none(), userController.loginUser);
router.get('/',authentication, userController.getUserById);
router.post('/update_photo_profile', authentication, upload.single('url_user_image'), userController.updatePhotoProfile);
router.post('/check_email', upload.none(), userController.isEmailRegistered);
router.post('/logout', authentication, userController.logoutUser);

module.exports = router;
