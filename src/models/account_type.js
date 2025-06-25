const Sequelize = require('sequelize');
const db = require('../config/database');

const AccountType = db.define('AccountType', {
        id : {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        account_status : {
            type: Sequelize.ENUM('active', 'inactive', 'suspended'),
            defaultValue: 'active',
            allowNull: false,
        },
    }, {
        freezeTableName: true,
        timestamps: false,
    })

module.exports = AccountType;