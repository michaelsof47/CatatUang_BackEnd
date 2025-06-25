const sequelize = require('../config/database');

const AccountType = require('./account_type');
const User = require('./user');
const Balances = require('./balances');
const PlannerBooks = require('./planner_book');

User.belongsTo(AccountType, { foreignKey: 'account_type_id'});
AccountType.hasMany(User, { foreignKey: 'account_type_id' });

Balances.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(Balances, { foreignKey: 'user_id' });

PlannerBooks.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(PlannerBooks, { foreignKey: 'user_id' });

module.exports = {
    sequelize,
    AccountType,
    User,
    Balances,
}