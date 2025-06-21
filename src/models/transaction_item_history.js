
/**
 * 
 * @param {import('sequelize').Sequelize} sequelize 
 * @param {import('sequelize').DataTypes} DataTypes 
 */

export default (sequelize, DataTypes) => {
    const TransactionItemHistory = sequelize.define('TransactionItemHistory', {
        id : {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            primaryKey: true,
        },
        item_name : {
            type: DataTypes.STRING,
            allowNull: false,
        },
        amount : {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        outlet_name : {
            type: DataTypes.STRING,
            allowNull: false,
        },
        created_at : {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
        transaction_history_id : {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'TransactionHistory',
                key: 'id',
            }
        }
    }, {
        tableName: 'transaction_item_history',
        timestamps: false,
    })

    return TransactionItemHistory;
}