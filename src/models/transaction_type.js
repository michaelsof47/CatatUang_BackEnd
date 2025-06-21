
/**
 * 
 * @param {import('sequelize').Sequelize} sequelize 
 * @param {import('sequelize').DataTypes} DataTypes 
 */

export default (sequelize, DataTypes) => {
    const TransactionType = sequelize.define('TransactionType', {
        id : {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            primaryKey: true,
        },
        type : {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        tableName: 'transaction_type',
        timestamps: false,
    })

    return TransactionType;
}