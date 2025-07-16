const express = require('express');
const multer = require('multer');
const router = express.Router();
const transactionController = require('../controllers/transaction_controller');
const upload = multer({ storage: multer.memoryStorage() });
const authentication = require('../middleware/authentication');

router.post('/create_transaction',authentication, upload.none(), transactionController.createTransaction);
router.post('/create_category',authentication, upload.single('cat_url_image'), transactionController.createCategory);
router.get('/get_transactions/:id', authentication, transactionController.getTransaction);
router.get('/:id/get_category_image', transactionController.getCategoryImage);
router.get('/get_categories/:id', authentication, transactionController.getCategory);


module.exports = router;