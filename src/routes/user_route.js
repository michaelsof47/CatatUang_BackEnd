const express = require('express');
const multer = require('multer');
const container = require('../container');
const router = express.Router();
const { UserController } = container.cradle;
const upload = multer({ storage: multer.memoryStorage() });
const authentication = require('../middleware/authentication');

router.post('/register', upload.single('url_user_image'), UserController.registerUser);
router.post('/login', upload.none(), UserController.loginUser);
router.post('/check_email', upload.none(), UserController.isEmailRegistered);
router.post('/logout', authentication, UserController.logoutUser);

router.get('/profile', authentication, UserController.getProfile);
router.put('/profile',authentication, upload.none(), UserController.updateProfile);
router.put('/profile/photo', authentication, upload.single('url_user_image'), UserController.updatePhotoProfile);
router.put('/profile/password',authentication, upload.none(), UserController.updatePassword);
router.get('/profile/picture', UserController.getProfileImage);

module.exports = router;
