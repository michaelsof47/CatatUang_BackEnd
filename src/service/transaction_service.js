const {
  NotFoundError,
  BadRequestError,
  AuthenticationError,
  ConflictError,
} = require("../utils/index");

class TransactionService {
  constructor({ Transaction, Category, Balances, sharp, localStorageService }) {
    this.Transaction = Transaction;
    this.Category = Category;
    this.Balances = Balances;
    this.sharp = sharp;
    this.storage = localStorageService;
  }

  // Helper: compress gambar dan simpan ke disk lokal
  async _compressAndSaveImage(buffer, folder) {
    if (!buffer) return null;
    const compressedBuffer = await this.sharp(buffer, { rotate: false })
      .resize({ width: 500, height: 500 })
      .jpeg({ quality: 80 })
      .toBuffer();
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
    return this.storage.saveImageLocally(compressedBuffer, folder, filename);
  }

  async createTransaction(userId, userData) {
    const t = await this.Transaction.sequelize.transaction();
    try {
      const {
        trans_name,
        trans_date,
        trans_amount,
        outlet_name,
        trans_price,
        trans_disc_percent,
        trans_disc_rp,
        trans_total_price,
        category_id,
        balances_id,
      } = userData;

      const balance = await this.Balances.findByPk(balances_id, {
        transaction: t,
      });

      if (!balance) {
        throw new BadRequestError("Saldo akun tidak tersedia");
      }

      balance.balances_amount -= parseInt(trans_total_price);
      await balance.save({ transaction: t });

      const newTransaction = await this.Transaction.create(
        {
          name: trans_name,
          transaction_date: trans_date,
          amount: trans_amount,
          outlet_name,
          price: trans_price,
          disc_percent: trans_disc_percent,
          disc_rp: trans_disc_rp,
          total_price: trans_total_price,
          user_id: userId,
          category_id: category_id,
        },
        { transaction: t },
      );

      await t.commit();
      return newTransaction;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async createCategory(userId, userData, imageBuffer) {
    const { cat_name, cat_desc } = userData;

    const imagePath = await this._compressAndSaveImage(
      imageBuffer,
      "categories",
    );

    const newCategory = await this.Category.create({
      name: cat_name,
      description: cat_desc,
      url_image: imagePath,
      user_id: userId,
    });

    return newCategory;
  }

  async getTransaction(userId, paginationOptions) {
    const { limit, offset, categoryId } = paginationOptions;

    const whereClause = { user_id: userId };

    if (categoryId) {
      whereClause.category_id = categoryId;
    }

    const { count, rows } = await this.Transaction.findAndCountAll({
      where: whereClause,
      order: [
        ["transaction_date", "DESC"],
        ["id", "DESC"],
      ],
      limit,
      offset,
    });

    if (rows.length === 0 && offset === 0) {
      throw new NotFoundError("Transaksi tidak ditemukan");
    }

    return { transactions: rows, totalItems: count };
  }

  async getCategory(userId) {
    const categories = await this.Category.findAll({
      where: { user_id: userId },
    });

    if (categories.length === 0) {
      throw new NotFoundError("Kategori tidak ditemukan");
    }

    const categoriesWithUrls = categories.map((cat) => {
      // Gambar di-serve langsung via static /uploads/<path>
      const imageUrl = cat.url_image ? `uploads/${cat.url_image}` : null;
      return {
        id: cat.id,
        name: cat.name,
        description: cat.description,
        category_url_image: imageUrl,
      };
    });

    return categoriesWithUrls;
  }

  async getCategoryImage(imageToken, categoryIdFromUrl) {
    // Endpoint ini tidak lagi diperlukan — gambar di-serve static via /uploads.
    // Tetap ada untuk backward compat.
    const { NotFoundError } = require("../utils/index");
    throw new NotFoundError(
      "Gunakan URL gambar yang diberikan dari /transactions/categories",
    );
  }

  async removeCategory(categoryId, userId) {
    console.log(userId);
    const category = await this.Category.findOne({
      where: { id: categoryId, user_id: userId },
    });

    if (!category) {
      throw new NotFoundError("Kategori tidak ditemukan");
    }

    const transactionCount = await this.Transaction.count({
      where: { category_id: categoryId, user_id: userId },
    });

    if (transactionCount > 0) {
      throw new ConflictError(
        `Kategori "${category.name}" tidak dapat dihapus karena sudah digunakan oleh ${transactionCount} transaksi.`,
      );
    }

    // Hapus file gambar dari disk jika ada
    if (category.url_image) {
      this.storage.deleteImageLocally(category.url_image);
    }

    const deleteRow = await this.Category.destroy({
      where: { id: categoryId, user_id: userId },
    });

    return deleteRow;
  }
}

module.exports = TransactionService;
