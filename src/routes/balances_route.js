const express = require('express');
const multer = require('multer');
const router = express.Router();
const balancesController = require('../controllers/balances_controller');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/create_balances', upload.none(), balancesController.createBalance);
router.get('/:id', balancesController.getBalance);
router.post('/update_balances', upload.none(), balancesController.updateBalance);

module.exports = router;
