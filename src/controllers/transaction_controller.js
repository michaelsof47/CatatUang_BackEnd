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
      const page = parseInt(req.params.page, 10) || 1;
      const limit = parseInt(req.params.limit, 10) || 10;
      const offset = (page - 1) * limit;

      const { transactions, totalItems } =
        await this.TransactionService.getTransaction(req.user.id, {
          limit,
          offset,
        });

      res.status(200).json({
        pagination: {
          currentPage: page,
          pageSize: limit,
          totalItems: totalItems,
        },
        data: transactions.map((transaction) => ({
          id: transaction.id,
          name: transaction.name,
          transaction_date: transaction.transaction_date
            .toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" })
            .replace(" ", "T"),
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

  removeCategory = async (req, res, next) => {
    const { categoryId } = req.params;
    try {
      await this.TransactionService.removeCategory(categoryId, req.user.id);

      res.status(200).json({ message: "Kategori berhasil dihapus. " });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = TransactionController;
