
/**
 * 
 * @param {import('sequelize').Sequelize} sequelize 
 * @param {import('sequelize').DataTypes} DataTypes 
 */

export default (sequelize, DataTypes) => {
    const PlannerBook = sequelize.define('PlannerBook', {
        id : {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            primaryKey: true,
        },
        name : {
            type: DataTypes.STRING,
            allowNull: false,
        },
        target_start : {
            type: DataTypes.DATE,
            allowNull: false,
        },
        target_end : {
            type: DataTypes.DATE,
            allowNull: false,
        },
        target_amount : {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        created_at : {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
        created_by : {
            type: DataTypes.STRING,
            allowNull: false,
        },
        updated_at : {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
        updated_by : {
            type: DataTypes.STRING,
            allowNull: false,
        },
        user_id : {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'User',
                key: 'id',
            }
        }
    }, {
        tableName: 'planner_book',
        timestamps: false,
    })

    return PlannerBook;
}