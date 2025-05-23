'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Post.belongsTo(models.Mechanic, {
        foreignKey: 'MechanicId'
      })
    }
  }
  Post.init({
    title: DataTypes.STRING,
    content: DataTypes.STRING,
    imgUrl: DataTypes.STRING,
    MechanicId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Mechanics',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Post',
  });
  return Post;
};