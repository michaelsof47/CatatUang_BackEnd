const express = require('express');
const multer = require('multer');
const router = express.Router();
const plannerBooksController = require('../controllers/planner_book_controller')
const upload = multer({ storage: multer.memoryStorage() });
const authentication = require('../middleware/authentication');

router.post('/create_book', authentication, upload.none(), plannerBooksController.createNewBook);
router.get('/get_all_books/:id', authentication, plannerBooksController.getAllBooks);
router.post('/update_book', authentication, upload.none(), plannerBooksController.updateBook);
router.post('/check_amount_limit', authentication, upload.none(), plannerBooksController.checkTotalAmountLimit);
router.post('/create_detail_book', authentication, upload.none(), plannerBooksController.createDetailPlannerBook);
router.get('/get_detail_books/:id', authentication, plannerBooksController.getAllDetailPlannerBooks);

module.exports = router;
