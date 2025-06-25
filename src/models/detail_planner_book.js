const Sequelize = require('sequelize');
const db = require('../config/database');

const PercentagePlannerBook = db.define('PercentagePlannerBook', {
        id : {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name : {
            type: Sequelize.STRING,
            allowNull: false,
        },
        percentage_amount : {
            type: Sequelize.DOUBLE,
            allowNull: true,
        },
        total_amount : {
            type: Sequelize.DOUBLE,
            allowNull: false,
        },
        planner_book_id : {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'PlannerBook',
                key: 'id',
            }
        }
    }, {
        freezeTableName: true,
        timestamps: false,
    })

module.exports = PercentagePlannerBook;