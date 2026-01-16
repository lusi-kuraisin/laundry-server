"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
      this.belongsTo(models.Customer, {
        foreignKey: "customer_id",
        as: "customer",
      });

      this.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "cashier",
      });

      this.hasMany(models.TransactionDetail, {
        foreignKey: "TransactionId",
        as: "details",
      });
    }
  }
  Transaction.init(
    {
      invoice_code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      drop_off_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      estimated_pickup_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      actual_pickup_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      laundry_status: {
        type: DataTypes.ENUM("new", "processing", "done", "taken"),
        defaultValue: "new",
      },
      payment_status: {
        type: DataTypes.ENUM("pending", "paid"),
        defaultValue: "pending",
      },
    },
    {
      sequelize,
      modelName: "Transaction",
    }
  );
  return Transaction;
};
