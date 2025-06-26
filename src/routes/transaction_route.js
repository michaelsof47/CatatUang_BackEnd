const express = require('express');
const multer = require('multer');
const router = express.Router();
const transactionController = require('../controllers/transaction_controller');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/create_transaction', upload.none(), transactionController.createTransaction);
router.post('/create_category', upload.single('cat_url_image'), transactionController.createCategory);


module.exports = router;