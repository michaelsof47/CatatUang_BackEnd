const Sequelize = require('sequelize');
const db = require('../config/database');

const Category = db.define('Category', {
        id : {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name : {
            type: Sequelize.STRING,
            allowNull: false,
        },
        description : {
            type: Sequelize.STRING,
            allowNull: true,
        },
        url_image : {
            type: Sequelize.BLOB,
            allowNull: true,
        }
    }, {
        freezeTableName: true,
        timestamps: false,
    });

module.exports = Category;