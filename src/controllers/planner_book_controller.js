class PlannerBookController {
  constructor({ PlannerBookService }) {
    this.PlannerBookService = PlannerBookService;
  }

  createNewBook = async (req, res, next) => {
    try {
      const createBook = await this.PlannerBookService.createNewBook(
        req.user.id,
        req.body
      );

      res
        .status(201)
        .json({ message: "Buku berhasil dibuat", bookId: createBook.id });
    } catch (error) {
      next(error);
    }
  };

  getBook = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const offset = (page - 1) * limit;

      const bookName = req.query.book_name;

      const { books, totalItems } = await this.PlannerBookService.getBook(
        req.user.id, {
          limit,
          offset,
          bookName,
        }
      );

      const booksList = books.map((book) => ({
        id: book.id,
        name: book.name,
        target_start: book.target_start,
        target_end: book.target_end,
        target_amount: book.target_amount,
        user_id: book.user_id,
      }));

      res.status(200).json({
        pagination: {
          currentPage: page,
          pageSize: limit,
          totalItems: totalItems,
        },
        data: booksList,
      });
    } catch (error) {
      next(error);
    }
  };

  updateBook = async (req, res, next) => {
    try {
      const { bookId } = req.params;
      const book = await this.PlannerBookService.updateBook(
        req.user.id,
        bookId,
        req.body
      );

      res
        .status(200)
        .json({ message: "Buku berhasil diperbarui", bookId: book.id });
    } catch (error) {
      next(error);
    }
  };

  checkTotalAmountLimit = async (req, res, next) => {
    try {
      const { bookId } = req.params;
      await this.PlannerBookService.checkTotalAmountLimit(
        req.user.id,
        bookId,
        req.body
      );

      res
        .status(200)
        .json({ message: "Jumlah nominal sesuai batas yang ditentukan" });
    } catch (error) {
      next(error);
    }
  };

  createDetailPlannerBook = async (req, res, next) => {
    try {
      const { bookId } = req.params;
      const detail = await this.PlannerBookService.createDetailPlannerBook(
        req.user.id,
        bookId,
        req.body
      );

      res
        .status(201)
        .json({ message: "Detail berhasil dibuat", detailId: detail.id });
    } catch (error) {
      next(error);
    }
  };

  getAllDetailPlannerBook = async (req, res, next) => {
    try {
      const { bookId } = req.params;

      const details = await this.PlannerBookService.getAllDetailPlannerbook(
        bookId,
        req.user.id,
      );

      res.status(200).json({
        count: details.length,
        details_item: details.map((detail) => ({
          id: detail.id,
          name: detail.name,
          total_amount: detail.total_amount,
          planner_book_id: detail.planner_book_id,
        })),
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = PlannerBookController;
