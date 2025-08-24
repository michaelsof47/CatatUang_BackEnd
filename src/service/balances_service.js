const { NotFoundError } = require("../utils/index");

class BalancesService {
  constructor({ Balances }) {
    this.Balances = Balances;
  }

  async createOrUpdateBalance(userId, balancesAmount) {
    const [balance, created] = await this.Balances.findOrCreate({
      where: { user_id: userId },
      defaults: { balances_amount: balancesAmount },
    });

    if (!created) {
      // Jika saldo sudah ada (ditemukan), perbarui jumlahnya
      balance.balances_amount = balancesAmount;
      await balance.save();
    }
    return created;
  }

  async getBalance(userId) {
    const balance = await this.Balances.findOne({
      where: { user_id: userId },
    });

    if (!balance) {
      throw new NotFoundError("Saldo tidak ditemukan");
    }

    return balance;
  }

  async addMoreBalance(userId, balancesAmount) {
    const balance = await this.Balances.findOne({
      where: { user_id: userId },
    });

    if (!balance) {
      throw new NotFoundError("Saldo tidak ditemukan");
    }

    // Menggunakan operasi atomik yang lebih efisien dan aman
    await balance.increment('balances_amount', { by: parseInt(balancesAmount, 10) });
  }
}

module.exports = BalancesService;
