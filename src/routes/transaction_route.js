const express = require("express");
const multer = require("multer");
const router = express.Router();
const container = require("../container");
const { TransactionController } = container.cradle;
const upload = multer({ storage: multer.memoryStorage() });
const authentication = require("../middleware/authentication");

router.post(
  "/",
  authentication,
  upload.none(),
  TransactionController.createTransaction
);
router.post(
  "/categories",
  authentication,
  upload.single("cat_url_image"),
  TransactionController.createCategory
);
router.get("/categories", authentication, TransactionController.getCategory);
router.get(
  "/categories/:categoryId/image",
  TransactionController.getCategoryImage
);
router.delete(
  "/categories/:categoryId",
  authentication,
  TransactionController.removeCategory
);

router.get("/", authentication, TransactionController.getTransaction);

module.exports = router;
