const express = require('express');
const multer = require('multer');
const router = express.Router();
const balancesController = require('../controllers/balances_controller');
const upload = multer({ storage: multer.memoryStorage() });
const authentication = require('../middleware/authentication');

router.post('/create_balances', authentication, upload.none(), balancesController.createOrUpdateBalance);
router.get('/:id', authentication, balancesController.getBalance);
router.post('/add_more_balances', authentication, upload.none(), balancesController.addMoreBalance);

module.exports = router;
