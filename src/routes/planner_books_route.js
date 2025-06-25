const express = require('express');
const multer = require('multer');
const router = express.Router();
const plannerBooksController = require('../controllers/planner_book_controller')
const upload = multer({ storage: multer.memoryStorage() });

router.post('/create_book', upload.none(), plannerBooksController.createNewBook);
router.get('/get_all_books/:id', plannerBooksController.getAllBooks);
router.post('/update_book', upload.none(), plannerBooksController.updateBook);
router.post('/check_amount_limit', upload.none(), plannerBooksController.checkTotalAmountLimit);
router.post('/create_detail_book', upload.none(), plannerBooksController.createDetailPlannerBook);
router.get('/get_detail_books/:id', plannerBooksController.getAllDetailPlannerBooks);

module.exports = router;
