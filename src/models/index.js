const sequelize = require('../config/database');

const AccountType = require('./account_type');
const User = require('./user');
const Balance = require('./balance');
const PlannerBooks = require('./planner_book');
const Transaction = require('./transaction');
const Category = require('./category');

User.belongsTo(AccountType, {foreignKey: 'account_type_id'});
AccountType.hasMany(User, {foreignKey: 'account_type_id'});

Balance.belongsTo(User, {foreignKey: 'user_id'});
User.hasOne(Balance, {foreignKey: 'user_id'});

PlannerBooks.belongsTo(User, {foreignKey: 'user_id'});
User.hasMany(PlannerBooks, {foreignKey: 'user_id'});

Transaction.belongsTo(User, {foreignKey: 'user_id'});
User.hasMany(Transaction, {foreignKey: 'user_id'});

Transaction.belongsTo(Balance, {foreignKey: 'balances_id'});
Balance.hasOne(Transaction, {foreignKey: 'balances_id'});

Transaction.belongsTo(Category, {foreignKey: 'category_id'});
Category.hasMany(Transaction, {foreignKey: 'category_id'});

module.exports = {
    sequelize,
    AccountType,
    User,
    Balance,
}