
/**
 * 
 * @param {import('sequelize').Sequelize} sequelize 
 * @param {import('sequelize').DataTypes} DataTypes 
 */

export default (sequelize, DataTypes) => {
    const Categories = sequelize.define('Categories', {
        id : {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            primaryKey: true,
        },
        name : {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description : {
            type: DataTypes.STRING,
            allowNull: true,
        },
        url_image : {
            type: DataTypes.BLOB,
            allowNull: true,
        }
    }, {
        tableName: 'categories',
        timestamps: false,
    })

    return Categories;
}