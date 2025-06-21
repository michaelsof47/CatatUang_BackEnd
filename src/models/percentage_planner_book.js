
/**
 * 
 * @param {import('sequelize').Sequelize} sequelize 
 * @param {import('sequelize').DataTypes} DataTypes 
 */

export default (sequelize, DataTypes) => {
    const PercentagePlannerBook = sequelize.define('PercentagePlannerBook', {
        id : {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            primaryKey: true,
        },
        name : {
            type: DataTypes.STRING,
            allowNull: false,
        },
        percentage_amount : {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        total_amount : {
            type: DataTypes.DOUBLE,
            allowNull: false,
        }
    }, {
        tableName: 'percentage_planner_book',
        timestamps: false,
    })

    return PercentagePlannerBook;
}