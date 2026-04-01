"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Sale extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Sale.hasMany(models.SaleItem, {
        foreignKey: "saleId",
      });
    }
  }
  Sale.init(
    {
      total: DataTypes.FLOAT,
      userId: DataTypes.INTEGER,
      date: DataTypes.DATE,
      paymentMethod: {
        type: DataTypes.STRING,
        defaultValue: "cash",
      },
      paymentAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      changeAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      customerName: DataTypes.STRING,
      notes: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Sale",
    }
  );
  return Sale;
};
