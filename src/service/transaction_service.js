const {
  NotFoundError,
  BadRequestError,
  AuthenticationError,
  ConflictError,
} = require("../utils/index");

class TransactionService {
  constructor({
    Transaction,
    Category,
    Balances,
    bufferToBase64,
    base64ToBuffer,
    sharp,
    jwt,
  }) {
    this.Transaction = Transaction;
    this.Category = Category;
    this.Balances = Balances;
    this.bufferToBase64 = bufferToBase64;
    this.base64ToBuffer = base64ToBuffer;
    this.sharp = sharp;
    this.jwt = jwt;
  }

  // Helper "private" untuk memproses gambar
  async _compressAndEncodeImage(buffer) {
    if (!buffer) return null;
    const compressedBuffer = await this.sharp(buffer, {
      rotate: false,
    })
      .resize({ width: 500, height: 500 })
      .jpeg({ quality: 80 })
      .toBuffer();
    return this.bufferToBase64(compressedBuffer);
  }

  // Helper "private" untuk menandatangani token tanpa query database
  _generateCategoryImageUrl(categoryId, userId) {
    const imageToken = this.jwt.sign(
      { categoryId: categoryId, userId: userId },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return `transactions/categories/${categoryId}/image?token=${imageToken}`;
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
        { transaction: t }
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

    const base64Image = await this._compressAndEncodeImage(imageBuffer);

    const newCategory = await this.Category.create({
      name: cat_name,
      description: cat_desc,
      url_image: base64Image,
      user_id: userId,
    });

    return newCategory;
  }

  async getTransaction(userId, paginationOptions) {
    const { limit, offset } = paginationOptions;
    const { count, rows } = await this.Transaction.findAndCountAll({
      where: { user_id: userId },
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
      const imageUrl = cat.url_image
        ? this._generateCategoryImageUrl(cat.id, userId)
        : null;
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
    if (!imageToken) {
      throw new BadRequestError("Token tidak ditemukan");
    }

    let payload;

    try {
      payload = this.jwt.verify(imageToken, process.env.JWT_SECRET);
    } catch (error) {
      throw new AuthenticationError("Invalid Token");
    }

    if (payload.categoryId.toString() !== categoryIdFromUrl) {
      throw new AuthenticationError("Invalid token for this resource");
    }

    const categoryImage = await this.Category.findOne({
      where: { id: payload.categoryId, user_id: payload.userId },
    });

    if (!categoryImage || !categoryImage.url_image) {
      throw new NotFoundError("Gambar kategori tidak ditemukan");
    }

    const imageBuffer = this.base64ToBuffer(categoryImage.url_image);

    return imageBuffer;
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
        `Kategori "${category.name}" tidak dapat dihapus karena sudah digunakan oleh ${transactionCount} transaksi.`
      );
    }

    const deleteRow = await this.Category.destroy({
      where: { id: categoryId, user_id: userId },
    });

    return deleteRow;
  }
}

module.exports = TransactionService;
