const transaction = require('../models/transaction');
const balances = require('../models/balance');
const category = require('../models/category');   

exports.createTransaction = async (req,res) => {
    const {
        trans_name,
        trans_amount,
        outlet_name,
        trans_price,
        trans_disc_percent,
        trans_disc_rp,
        trans_total_price,
        user_id,
        category_id,
        balances_id,
    } = req.body;

    try {
        const balance = await balances.findByPk(balances_id);
        console.log('Balance found:', balance);
        balance.balances_amount -= trans_total_price;
        await balance.save();

        if(balance.balances_amount < 0) {
            return res.status(400).json({
                message: 'Insufficient balance',
            });
        } 

        const newTransaction = await transaction.create({
            name: trans_name,
            amount: trans_amount,
            outlet_name,
            price: trans_price,
            disc_percent: trans_disc_percent,
            disc_rp: trans_disc_rp,
            total_price: trans_total_price,
            user_id: user_id,
            category_id: category_id,
        });
        
        res.status(201).json({
            message: 'Transaction created successfully',
            transaction: newTransaction.id,
        });
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({
            message: 'Failed to create transaction',
            error: error.message,
        });
    }
}

exports.createCategory = async (req,res) => {
    const { cat_name, cat_desc, cat_url_image } = req.body;

    try {
        const newCategory = await category.create({
            name: cat_name,
            description: cat_desc,
            url_image: cat_url_image,
        });

        res.status(201).json({
            message: 'Category created successfully',
            category: newCategory.id,
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({message: 'Failed to create category',error: error.message});
    }
}