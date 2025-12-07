"use strict";

const { format } = require("date-fns");
const { faker } = require("@faker-js/faker");

const LAUNDRY_STATUSES = ["new", "processing", "done", "taken"];
const PAYMENT_STATUSES = ["pending", "paid"];
const MAX_DISCOUNT = 0.15;
const NUM_TRANSACTIONS = 50;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log("✨ Mulai menanam data Transaksi dan Detail...");

    const db = require("../models/index");

    const { Transaction, TransactionDetail, User, Customer, Package } = db;

    const customers = await Customer.findAll({ attributes: ["id"] });
    const packages = await Package.findAll({ attributes: ["id", "price"] });
    const cashiers = await User.findAll({ attributes: ["id"] });

    if (
      customers.length === 0 ||
      packages.length === 0 ||
      cashiers.length === 0
    ) {
      console.warn(
        "⚠️ Tidak bisa menanam Transaksi: Customer, Package, atau User kosong."
      );
      return;
    }

    const transactionsToInsert = [];

    for (let i = 0; i < NUM_TRANSACTIONS; i++) {
      const customer = faker.helpers.arrayElement(customers);
      const cashier = faker.helpers.arrayElement(cashiers);
      const laundryStatus = faker.helpers.arrayElement(LAUNDRY_STATUSES);
      const paymentStatus = faker.helpers.arrayElement(PAYMENT_STATUSES);

      const dropOffDate = faker.date.recent({ days: 60 });
      const estimatedPickupDate = faker.date.soon({
        days: faker.number.int({ min: 2, max: 7 }),
        refDate: dropOffDate,
      });
      let actualPickupDate = null;
      if (laundryStatus === "taken") {
        actualPickupDate = faker.date.soon({
          days: faker.number.int({ min: 1, max: 3 }),
          refDate: estimatedPickupDate,
        });
      }

      const dropOffDateFormatted = format(dropOffDate, "yyyy-MM-dd");
      const estimatedPickupDateFormatted = format(
        estimatedPickupDate,
        "yyyy-MM-dd"
      );
      const actualPickupDateFormatted = actualPickupDate
        ? format(actualPickupDate, "yyyy-MM-dd")
        : null;

      const numItems = faker.number.int({ min: 1, max: 3 });
      let subtotal = 0;
      const currentDetails = [];

      for (let j = 0; j < numItems; j++) {
        const pkg = faker.helpers.arrayElement(packages);
        const qtyWeight = faker.number.float({
          min: 1,
          max: 8,
          precision: 0.1,
        });
        const pricePerUnit = parseFloat(pkg.price);
        const itemSubtotal = parseFloat((qtyWeight * pricePerUnit).toFixed(2));
        subtotal += itemSubtotal;

        currentDetails.push({
          package_id: pkg.id,
          qty_weight: qtyWeight,
          price_per_unit: pricePerUnit,
          subtotal: itemSubtotal,
        });
      }

      const subtotalBeforeDiscount = parseFloat(subtotal.toFixed(2));
      const discountPercentage = faker.number.float({
        min: 0,
        max: MAX_DISCOUNT,
        precision: 0.05,
      });
      const discountAmount = parseFloat(
        (subtotalBeforeDiscount * discountPercentage).toFixed(2)
      );
      const totalPrice = parseFloat(
        (subtotalBeforeDiscount - discountAmount).toFixed(2)
      );

      const transaction = {
        invoice_code: faker.string.uuid().substring(0, 8).toUpperCase(),
        customer_id: customer.id,
        user_id: cashier.id,
        subtotal: subtotalBeforeDiscount,
        discount_amount: discountAmount,
        total_price: totalPrice,
        drop_off_date: dropOffDateFormatted,
        estimated_pickup_date: estimatedPickupDateFormatted,
        actual_pickup_date: actualPickupDateFormatted,
        laundry_status: laundryStatus,
        payment_status: paymentStatus,
        created_at: new Date(),
        updated_at: new Date(),
      };

      transactionsToInsert.push({ transaction, details: currentDetails });
    }

    let totalDetails = 0;
    for (const { transaction, details } of transactionsToInsert) {
      const createdTransaction = await Transaction.create(transaction);

      const finalDetails = details.map((d) => ({
        ...d,
        TransactionId: createdTransaction.id,
        created_at: new Date(),
        updated_at: new Date(),
      }));

      const detailFields = [
        "TransactionId",
        "package_id",
        "qty_weight",
        "price_per_unit",
        "subtotal",
        "createdAt",
        "updatedAt",
      ];

      await TransactionDetail.bulkCreate(finalDetails, {
        fields: detailFields,
        ignoreDuplicates: true,
      });
      totalDetails += finalDetails.length;
    }

    console.log(
      `🎉 Berhasil menanam ${transactionsToInsert.length} Transaksi dengan total ${totalDetails} Detail!`
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("TransactionDetails", null, {});
    await queryInterface.bulkDelete("Transactions", null, {});
  },
};
