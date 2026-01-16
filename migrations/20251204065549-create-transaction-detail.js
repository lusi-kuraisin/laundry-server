"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "TransactionDetails",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        qty_weight: {
          type: Sequelize.DECIMAL(8, 2),
          allowNull: false,
        },
        price_per_unit: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
        },
        subtotal: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
        },
        TransactionId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: "Transactions", key: "id" },
          onDelete: "CASCADE",
        },
        package_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: "Packages", key: "id" },
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      },
      {
        uniqueKeys: {
          transaction_package_unique: {
            fields: ["TransactionId", "package_id"],
          },
        },
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("TransactionDetails");
  },
};
