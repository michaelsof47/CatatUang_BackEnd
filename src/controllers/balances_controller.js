const Balances = require("../models/balance");

exports.createOrUpdateBalance = async (req, res) => {
  const { id, balances_amount, user_id } = req.body;

  try {
    if (id == "") {
      await Balances.create({
        balances_amount,
        user_id,
      });

      res.status(201).json({ message: "Saldo berhasil dibuat" });
    } else {
      await Balances.upsert({
        id,
        balances_amount,
        user_id,
      });

      res.status(201).json({ message: "Saldo berhasil diperbarui" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error("Error creating balance: ", error);
  }
};

exports.getBalance = async (req, res) => {
  const { id } = req.params;
  try {
    const balance = await Balances.findByPk(id);

    if (!balance) {
      return res.status(404).json({ error: "Saldo tidak ditemukan" });
    }

    res.status(200).json({
      id: balance.id,
      balances_amount: balance.balances_amount,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error("Error fetching balance: ", error);
  }
};

exports.addMoreBalance = async (req, res) => {
  const { balances_amount, user_id } = req.body;

  try {
    const balance = await Balances.findOne({ where: { user_id } });

    if (!balance) {
      return res.status(404).json({ error: "Saldo tidak ditemukan" });
    }

    balance.balances_amount += parseInt(balances_amount);
    await balance.save();

    res.status(200).json({ message: "Saldo berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error("Error updating balance: ", error);
  }
};
