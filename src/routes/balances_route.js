const express = require('express');
const multer = require('multer');
const router = express.Router();
const container = require('../container');
const {BalancesController, authentication} = container.cradle;
const upload = multer({ storage: multer.memoryStorage() });

router.put('/', authentication, upload.none(),BalancesController.createOrUpdateBalance);
router.get('/', authentication, BalancesController.getBalance);
router.patch('/', authentication, upload.none(), BalancesController.addMoreBalance);

module.exports = router;
