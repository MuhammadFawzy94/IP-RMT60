'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Package extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Package.hasMany(models.Order, {
        foreignKey: 'PackageId'
      })
    }
  }
  Package.init({
    namePackage: DataTypes.STRING,
    price: DataTypes.INTEGER,
    description: DataTypes.STRING,
    imgUrl: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Package',
  });
  return Package;
};