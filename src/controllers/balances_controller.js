class BalancesController {
  constructor({ BalancesService }) {
    this.BalancesService = BalancesService;
  }

  createOrUpdateBalance = async (req, res, next) => {
    const { balances_amount } = req.body;

    try {
      const isNewBalance = await this.BalancesService.createOrUpdateBalance(
        req.user.id,
        balances_amount
      );

      if (isNewBalance) {
        res.status(201).json({ message: "Saldo berhasil dibuat" });
      } else {
        res.status(200).json({ message: "Saldo berhasil diperbarui" });
      }
    } catch (error) {
      next(error);
    }
  };

  getBalance = async (req, res, next) => {
    try {
      const balance = await this.BalancesService.getBalance(req.user.id);

      res.status(200).json({
        id: balance.id,
        balances_amount: balance.balances_amount,
      });
    } catch (error) {
      next(error);
    }
  };

  addMoreBalance = async (req, res, next) => {
    const { balances_amount } = req.body;

    try {
      await this.BalancesService.addMoreBalance(
        req.user.id,
        balances_amount,
      );

      res.status(200).json({ message: "Saldo berhasil diperbarui" });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = BalancesController;
