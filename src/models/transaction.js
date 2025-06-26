const Sequelize = require('sequelize');
const db = require('../config/database');

const Transaction = db.define('Transaction', {
        id : {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name : {
            type: Sequelize.STRING,
            allowNull: false,
        },
        amount : {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        outlet_name : {
            type: Sequelize.STRING,
            allowNull: false,
        },
        price : {
            type: Sequelize.DOUBLE,
            allowNull: false,
        },
        disc_percent : {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        disc_rp : {
            type: Sequelize.DOUBLE,
            allowNull: true,
        },
        total_price : {
            type: Sequelize.DOUBLE,
            allowNull: false,
        },
        user_id : {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'User',
                key: 'id',
            }
        },
        category_id : {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Category',
                key: 'id',
            }
        }
    }, {
        freezeTableName: true,
        timestamps: true,
    })

module.exports = Transaction;