'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mechanic extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Mechanic.hasMany(models.Order, {
        foreignKey: 'MechanicId'
      })
      Mechanic.hasMany(models.Post, {
        foreignKey: 'MechanicId'
      })
    }
  }
  Mechanic.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    location: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    imageURL: DataTypes.STRING,
    experience: DataTypes.STRING,
    speciality: DataTypes.STRING,
    fullName: DataTypes.STRING,
    role: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Mechanic',
  });
  return Mechanic;
};