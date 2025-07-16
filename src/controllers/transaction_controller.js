const transaction = require("../models/transaction");
const balances = require("../models/balance");
const category = require("../models/category");

exports.createTransaction = async (req, res) => {
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
    console.log("Balance found:", balance);
    balance.balances_amount -= trans_total_price;
    await balance.save();

    if (balance.balances_amount < 0) {
      return res.status(400).json({
        message: "Insufficient balance",
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
      message: "Transaksi berhasil dibuat",
      transaction: newTransaction.id,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.error("Error creating transaction:", error);
  }
};

exports.createCategory = async (req, res) => {
  const { cat_name, cat_desc, user_id } = req.body;
  const cat_url_image = req.file?.buffer;

  try {
    const newCategory = await category.create({
      name: cat_name,
      description: cat_desc,
      url_image: cat_url_image,
      user_id: user_id,
    });

    res.status(201).json({
      message: "Kategori berhasil dibuat",
      category: newCategory.id,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.error("Error creating category:", error);
  }
};

exports.getTransaction = async (req, res) => {
  const userId = req.params.id;

  try {
    const transactionData = await transaction.findAll({
      where: { user_id: userId },
      order: [["id", "DESC"]],
    });

    if (transactionData.length === 0) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    }

    res.status(200).json({
      count: transactionData.length,
      details_item: transactionData.map((transaction) => ({
        id: transaction.id,
        name: transaction.name,
        amount: transaction.amount,
        outlet_name: transaction.outlet_name,
        price: transaction.price,
        disc_percent: transaction.disc_percent,
        disc_rp: transaction.disc_rp,
        total_price: transaction.total_price,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error("Error fetching transaction: ", error);
  }
};

exports.getCategory = async (req, res) => {
  const userId = req.params.id;

  try {
    const categoryData = await category.findAll({ where: { user_id: userId } });

    if (categoryData.length === 0) {
      return res.status(404).json({ error: "Kategori tidak ditemukan" });
    }

    res.status(200).json({
      count: categoryData.length,
      details_item: categoryData.map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error("Error fetching category: ", error);
  }
};

exports.getCategoryImage = async (req, res) => {
  try {
    const categoryImage = await category.findByPk(req.params.id);

    if (!categoryImage || !categoryImage.url_image) {
      return res.status(404).send("Gambar kategori tidak ditemukan");
    }

    res.set("Content-Type", "image/jpeg");
    res.send(categoryImage.url_image);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error("Error fetching category image: ", error);
  }
};
