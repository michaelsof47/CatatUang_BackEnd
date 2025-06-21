const Balances = require('../models/balances');

exports.createBalance = async (req,res) => {
    const { balances_amount, user_id } = req.body;

    try {
        const newBalance = await Balances.create({
            balances_amount,
            user_id,
        })

        res.status(201).json({message: 'Balance created successfully'});
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        console.error('Error creating balance: ', error);
    }
}

exports.getBalance = async (req,res) => {
    const { id } = req.params;
    try {
        const balance = await Balances.findByPk(id);

        if (!balance) {
            return res.status(404).json({ error: 'Balance Not Found' });
        }

        res.status(200).json(balance.balances_amount);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        console.error('Error fetching balance: ', error);
    }
}

exports.updateBalance = async (req,res) => {
    const { balances_amount, user_id } = req.body;

    try {
        const balance = await Balances.findOne({ where: { user_id } });

        if (!balance) {
            return res.status(404).json({ error: 'Balance Not Found' });
        }

        balance.balances_amount += parseInt(balances_amount);
        await balance.save();

        res.status(200).json({ message: 'Balance updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        console.error('Error updating balance: ', error);
    }
}