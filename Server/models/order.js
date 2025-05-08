'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Order.belongsTo(models.User, {
        foreignKey: 'UserId'
      })
      Order.belongsTo(models.Mechanic, {
        foreignKey: 'MechanicId'
      })
      Order.belongsTo(models.Package, {
        foreignKey: 'PackageId'
      })
    }
  }
  Order.init({
    UserId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    MechanicId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Mechanics',
        key: 'id'
      }
    },
    PackageId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Packages',
        key: 'id'
      }
    },
    description: DataTypes.STRING,
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending'
    },
    date: DataTypes.DATE,
    paymentStatus: {
      type: DataTypes.STRING,
      defaultValue: 'unpaid'
    },
    paymentMethod: DataTypes.STRING,
    transactionId: DataTypes.STRING,
    transactionToken: DataTypes.STRING,
    totalAmount: DataTypes.INTEGER,
    transferProof: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};