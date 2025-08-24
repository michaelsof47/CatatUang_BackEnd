class TransactionController {
  constructor({ TransactionService }) {
    this.TransactionService = TransactionService;
  }

  createTransaction = async (req, res, next) => {
    try {
      const newTransaction = await this.TransactionService.createTransaction(
        req.user.id,
        req.body
      );

      res.status(201).json({
        message: "Transaksi berhasil dibuat",
        transaction_id: newTransaction.id,
      });
    } catch (error) {
      next(error);
    }
  };

  createCategory = async (req, res, next) => {
    const cat_url_image = req.file?.buffer;

    try {
      const newCategory = await this.TransactionService.createCategory(
        req.user.id,
        req.body,
        cat_url_image
      );

      res.status(201).json({
        message: "Kategori berhasil dibuat",
        category_id: newCategory.id,
      });
    } catch (error) {
      next(error);
    }
  };

  getTransaction = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const offset = (page - 1) * limit;

      const { transactions, totalItems } = await this.TransactionService.getTransaction(
        req.user.id,
        { limit, offset }
      );

      const totalPages = Math.ceil(totalItems / limit);

      res.status(200).json({
        pagination: {
          totalItems,
          totalPages,
          currentPage: page,
          pageSize: limit,
        },
        data: transactions.map((transaction) => ({
          id: transaction.id,
          name: transaction.name,
          amount: transaction.amount,
          outlet_name: transaction.outlet_name,
          price: transaction.price,
          disc_percent: transaction.disc_percent,
          disc_rp: transaction.disc_rp,
          total_price: transaction.total_price,
          created_at: transaction.createdAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  };

  getCategory = async (req, res, next) => {
    try {
      const categoriesWithUrls = await this.TransactionService.getCategory(
        req.user.id
      );

      res.status(200).json({
        count: categoriesWithUrls.length,
        details_item: categoriesWithUrls,
      });
    } catch (error) {
      next(error);
    }
  };

  getCategoryImage = async (req, res, next) => {
    const { token } = req.query;
    const { categoryId } = req.params;
    try {
      const categoryImage = await this.TransactionService.getCategoryImage(
        token,
        categoryId
      );

      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      res.set("Content-Type", "image/jpeg");
      res.send(categoryImage);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = TransactionController;
