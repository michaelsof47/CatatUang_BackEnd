const { NotFoundError, ConflictError, BadRequestError } = require("../utils/index");

class PlannerbookService {
  constructor({ PlannerBook, DetailPlannerBook, Op }) {
    this.PlannerBook = PlannerBook;
    this.DetailPlannerBook = DetailPlannerBook;
    this.Op = Op;
  }

  async createNewBook(userId, userData) {
    const { book_name, target_start_date, target_end_date, target_amount } =
      userData;

    const existingBook = await this.PlannerBook.findOne({
      where: { name: book_name, user_id: userId },
    });

    if (existingBook) {
      throw new ConflictError("Buku dengan nama yang sama sudah ada");
    }

    const createBook = await this.PlannerBook.create({
      name: book_name,
      target_start: target_start_date,
      target_end: target_end_date,
      target_amount,
      user_id: userId,
    });

    return createBook;
  }

  async getBook(userId, userData) {
    const { book_name: bookName } = userData || {};

    const whereClause = {
      user_id: userId,
    };
    if (bookName) {
      whereClause.name = { [this.Op.iLike]: `%${bookName}%` };
    }

    const book = await this.PlannerBook.findAll({
      where: whereClause,
      order: [["id", "ASC"]],
    });

    return book;
  }

  async updateBook(userId, bookId, userData) {
    const {
      book_name,
      target_start_date,
      target_end_date,
      target_amount,
    } = userData;

    const book = await this.PlannerBook.findOne({ where: { id: bookId, user_id: userId } });

    if (!book) {
      throw new NotFoundError("Buku perencanaan tidak ditemukan atau Anda tidak memiliki akses");
    }

    const existingBook = await this.PlannerBook.findOne({
      where: { name: book_name, user_id: userId, id: { [this.Op.ne]: bookId } },
    });

    if (existingBook) {
      throw new ConflictError("Buku dengan nama yang sama sudah ada");
    }

    await book.update(
      {
      name: book_name,
      target_start: target_start_date,
      target_end: target_end_date,
      target_amount: target_amount,
    },
    );

    return book;
  }

  async checkTotalAmountLimit(userId, bookId, userData) {
    const { current_amount } = userData;

    const book = await this.PlannerBook.findOne({ where: { id: bookId, user_id: userId } });

    if (!book) {
      throw new NotFoundError("Buku tidak ditemukan");
    }

    const totalAmount = book.target_amount;

    if (current_amount > totalAmount) {
      throw new BadRequestError("Jumlah nominal melebihi batas yang ditentukan");
    }

    return book;
  }

  async createDetailPlannerBook(userId, bookId, userData) {
    const { detail_book_name, total_amount } = userData;

    const book = await this.PlannerBook.findOne({ where: { id: bookId, user_id: userId } });

    if (!book) {
      throw new NotFoundError("Buku tidak ditemukan");
    }

    const existingDetail = await this.DetailPlannerBook.findOne({
      where: { name: detail_book_name, planner_book_id: bookId },
    });

    if (existingDetail) {
      throw new ConflictError("Detail dengan nama yang sama sudah ada");
    }

    const detail = await this.DetailPlannerBook.create({
      name: detail_book_name,
      total_amount,
      planner_book_id: bookId,
    });

    return detail;
  }

  async getAllDetailPlannerbook(bookId, userId) {
    const book = await this.PlannerBook.findOne({
      where: { id: bookId, user_id: userId },
    });

    if (!book) {
      throw new NotFoundError("Buku perencanaan tidak ditemukan atau Anda tidak memiliki akses");
    }

    const details = await this.DetailPlannerBook.findAll({
      where: { planner_book_id: bookId },
      order: [["id", "ASC"]],
    });

    return details;
  }
}

module.exports = PlannerbookService;
