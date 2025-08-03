const Sequelize = require('sequelize');
const db = require('../config/database');
const AccountType = require('./account_type');

const User = db.define('User', {
        id : {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        first_name : {
            type: Sequelize.STRING,
            allowNull: false,
        },
        last_name : {
            type: Sequelize.STRING,
            allowNull: false,
        },
        reward_status : {
            type: Sequelize.ENUM('bronze', 'silver', 'gold', 'platinum'),
            defaultValue: 'bronze',
            allowNull: false,
        },
        url_user_image : {
            type: Sequelize.TEXT('long'),
            allowNull: true,
        },
        email : {
            type: Sequelize.STRING,
            allowNull: false,
        },
        phone : {
            type: Sequelize.STRING,
            allowNull: false,
        },
        password : {
            type: Sequelize.STRING,
            allowNull: false,
        },
        account_type_id : {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: AccountType,
                key: 'id',
            }
        }   
    }, {
        freezeTableName: true,
    })
 
module.exports = User;