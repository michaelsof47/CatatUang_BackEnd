const sequelize = require('../config/database');

const AccountType = require('./account_type');
const User = require('./user');

User.belongsTo(AccountType, { foreignKey: 'account_type_id' });
AccountType.hasMany(User, { foreignKey: 'account_type_id' });

module.exports = {
    sequelize,
    AccountType,
    User,
}