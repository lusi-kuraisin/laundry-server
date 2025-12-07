"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Transactions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      invoice_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      drop_off_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      estimated_pickup_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      actual_pickup_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      total_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      laundry_status: {
        type: Sequelize.ENUM("new", "processing", "done", "taken"),
        defaultValue: "new",
        allowNull: false,
      },
      payment_status: {
        type: Sequelize.ENUM("pending", "paid"),
        defaultValue: "pending",
        allowNull: false,
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Customers",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Transactions");
  },
};
