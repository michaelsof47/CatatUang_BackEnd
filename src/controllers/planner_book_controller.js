const plannerBook = require('../models/planner_book');
const detailPlannerBook = require('../models/detail_planner_book');

exports.createNewBook = async (req,res) => {
    const { book_name, target_start_date, target_end_date, target_amount, user_id } =  req.body;

    try {

        const existingBook = await plannerBook.findOne({
            where: { name: book_name }
        });

        if(existingBook) {
            return res.status(400).json({ error: 'Book with this name already exists' });
        }

        const createBook = await plannerBook.create({
            name:book_name,
            target_start:target_start_date,
            target_end:target_end_date,
            target_amount,
            user_id,
        })
        res.status(201).json({ message: 'Book created successfully', bookId: createBook.id });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        console.error('Error creating book: ', error);
    }
}

exports.getAllBooks = async (req, res) => {
    const userId = req.params.id;

    try {
        const books = await plannerBook.findAll({
            where: { user_id: userId},
            order: [['id', 'ASC']],
        });

        if (books.length === 0) {
            return res.status(404).json({ message: 'No Books Found' });
        }    

        res.status(200).json({
            count: books.length,
            books_item: books.map(book => ({
                id: book.id,
                name: book.name,
                target_start: book.target_start,
                target_end: book.target_end,
                target_amount: book.target_amount,
                user_id: book.user_id,
            }))
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        console.error('Error fetching books: ', error);
    }
}

exports.updateBook = async (req,res) => {
    const { book_id, book_name, target_start_date, target_end_date, target_amount } = req.body;

    try {
        const book = await plannerBook.findByPk(book_id);

        if(!book) {
            return res.status(404).json({ error: 'Book Not Found' });
        }

        book.name = book_name;
        book.target_start = target_start_date;
        book.target_end = target_end_date;
        book.target_amount = target_amount;

        await book.save();

        res.status(200).json({ message: 'Book updated successfully', bookId: book.id });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        console.error('Error updating book: ', error);
    }
}

exports.checkTotalAmountLimit = async (req,res) => {
    const { book_id, current_amount } = req.body;

    try {
        const book = await plannerBook.findByPk(book_id);

        if (!book) {
            return res.status(404).json({ error: 'Book Not Found' });
        }

        const totalAmount = book.target_amount;

        if(current_amount > totalAmount) {
            return res.status(400).json({ error: 'Current Amount Exceeds Target Amount' });
        }

        res.status(200).json({ message: 'Current Amount is within the limit' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        console.error('Error checking total amount limit: ', error);
    }
}

exports.createDetailPlannerBook = async (req, res) => {
    const { book_id, detail_book_name, total_amount} = req.body;
    console.log('Received body:', req.body);

    try {

        const book = await plannerBook.findByPk(book_id);

        if (!book) {
            return res.status(404).json({ error: 'Book Not Found' });
        }

        

        const existingDetail = await detailPlannerBook.findOne({
            where: { name: detail_book_name }
        });

        if (existingDetail) {
            return res.status(400).json({ error: 'Detail with this name already exists' });
        }

        const detail = await detailPlannerBook.create({
            name: detail_book_name,
            total_amount,
            planner_book_id: book_id,
        });

        res.status(201).json({ message: 'Detail created successfully', detailId: detail.id });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        console.error('Error creating detail planner book: ', error);
    }
}

exports.getAllDetailPlannerBooks = async (req,res) => {
    const bookId = req.params.id;

    try {
        const details = await detailPlannerBook.findAll({
            where: { planner_book_id: bookId },
            order: [['id', 'ASC']], 
        });

        if (details.length === 0) {
            return res.status(404).json({ message: 'No Details Found' });
        }

        res.status(200).json({
            count: details.length,
            details_item: details.map(detail => ({
                id: detail.id,
                name: detail.name,
                total_amount: detail.total_amount,
                planner_book_id: detail.planner_book_id,
            }))
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        console.error('Error fetching detail planner books: ', error);
    }
}