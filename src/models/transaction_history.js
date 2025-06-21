
/**
 * 
 * @param {import('sequelize').Sequelize} sequelize 
 * @param {import('sequelize').DataTypes} DataTypes 
 */

export default (sequelize, DataTypes) => {
    const TransactionHistory = sequelize.define('TransactionHistory', {
        id : {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            primaryKey: true,
        },
        name : {
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
        price : {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        disc_percent : {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        disc_rp : {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        total_price : {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        created_at : {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
        user_id : {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'User',
                key: 'id',
            }
        },
        category_id : {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Category',
                key: 'id',
            }
        },
        transcation_type_id : {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'TransactionType',
                key: 'id',
            }
        },
        balances_id : {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Balances',
                key: 'id',
            }
        }
    }, {
        tableName: 'users',
        timestamps: false,
    })

    return TransactionHistory;
}