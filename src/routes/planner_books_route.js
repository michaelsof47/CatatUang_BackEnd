const express = require('express');
const multer = require('multer');
const router = express.Router();
const container = require('../container');
const { PlannerBookController, authentication } = container.cradle;
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', authentication, upload.none(), PlannerBookController.createNewBook);
router.get('/', authentication, PlannerBookController.getBook);
router.put('/:bookId', authentication, upload.none(), PlannerBookController.updateBook);
router.post('/:bookId/check-amount', authentication, upload.none(), PlannerBookController.checkTotalAmountLimit);
router.post('/:bookId/details', authentication, upload.none(), PlannerBookController.createDetailPlannerBook);
router.get('/:bookId/details', authentication, PlannerBookController.getAllDetailPlannerBook)

module.exports = router;
