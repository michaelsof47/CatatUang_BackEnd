const container = require("../container");

const { Transaction, Category, Balances } = container.cradle;

exports.createTransaction = async (req, res) => {
  const {
    trans_name,
    trans_amount,
    outlet_name,
    trans_price,
    trans_disc_percent,
    trans_disc_rp,
    trans_total_price,
    category_id,
    balances_id,
  } = req.body;

  try {
    const balance = await Balances.findByPk(balances_id);
    console.log("Balance found:", balance);
    balance.balances_amount -= trans_total_price;
    await balance.save();

    if (balance.balances_amount < 0) {
      return res.status(400).json({
        message: "Insufficient balance",
      });
    }

    const newTransaction = await Transaction.create({
      name: trans_name,
      amount: trans_amount,
      outlet_name,
      price: trans_price,
      disc_percent: trans_disc_percent,
      disc_rp: trans_disc_rp,
      total_price: trans_total_price,
      user_id: req.user.id,
      category_id: category_id,
    });

    res.status(201).json({
      message: "Transaksi berhasil dibuat",
      Transaction: newTransaction.id,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.error("Error creating Transaction:", error);
  }
};

exports.createCategory = async (req, res) => {
  const { cat_name, cat_desc } = req.body;
  const cat_url_image = req.file?.buffer;

  try {
    const newCategory = await Category.create({
      name: cat_name,
      description: cat_desc,
      url_image: cat_url_image,
      user_id: req.user.id,
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
  try {
    const TransactionData = await Transaction.findAll({
      where: { user_id: req.user.id },
      order: [["id", "DESC"]],
    });

    if (TransactionData.length === 0) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    }

    res.status(200).json({
      count: TransactionData.length,
      details_item: TransactionData.map((Transaction) => ({
        id: Transaction.id,
        name: Transaction.name,
        amount: Transaction.amount,
        outlet_name: Transaction.outlet_name,
        price: Transaction.price,
        disc_percent: Transaction.disc_percent,
        disc_rp: Transaction.disc_rp,
        total_price: Transaction.total_price,
        created_at: Transaction.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error("Error fetching Transaction: ", error);
  }
};

exports.getCategory = async (req, res) => {
  try {
    const categoryData = await Category.findAll({
      where: { user_id: req.user.id },
    });

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
    const categoryImage = await Category.findByPk(req.params.id);

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
