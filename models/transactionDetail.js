"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TransactionDetail extends Model {
    static associate(models) {
      this.belongsTo(models.Transaction, {
        foreignKey: "TransactionId",
        as: "transaction",
      });

      this.belongsTo(models.Package, {
        foreignKey: "package_id",
        as: "package",
      });
    }
  }
  TransactionDetail.init(
    {
      TransactionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      package_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      qty_weight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      price_per_unit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "TransactionDetail",
    }
  );
  return TransactionDetail;
};
