const Sequelize = require('sequelize');
const db = require('../config/database');

const Balance = db.define('Balance', {
        id : {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        balances_amount : {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        user_id : {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'User',
                key: 'id',
            }
        }
    }, {
        freezeTableName: true,
    });

module.exports = Balance;