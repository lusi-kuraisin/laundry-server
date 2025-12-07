// models/Package.js

"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Package extends Model {
    static associate(models) {
      this.belongsToMany(models.Transaction, {
        through: models.TransactionDetail,
        foreignKey: "package_id",
      });
      this.hasMany(models.TransactionDetail, { foreignKey: "package_id" });
    }
  }
  Package.init(
    {
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      unit: {
        type: DataTypes.ENUM("kg", "pcs", "item"), // 🛑 FIX: Tambah nilai ENUM
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      estimated_duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Package",
    }
  );
  return Package;
};
