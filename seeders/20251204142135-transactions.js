"use strict";

const { format } = require("date-fns");

const LAUNDRY_STATUSES = ["new", "processing", "done", "taken"];
const PAYMENT_STATUSES = ["pending", "paid"];
const MAX_DISCOUNT = 0.15;
const NUM_TRANSACTIONS = 50;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ✨ LOGIKA SAKTI NANCY: Import Faker secara dinamis agar tidak error ESM! ✨
    const { faker } = await import("@faker-js/faker");

    console.log("✨ Mulai menanam data Transaksi dan Detail...");

    const db = require("../models/index");
    const { Transaction, TransactionDetail, User, Customer, Package } = db;

    // Ambil data referensi dari tabel lain
    const customers = await Customer.findAll({ attributes: ["id"] });
    const packages = await Package.findAll({ attributes: ["id", "price"] });
    const cashiers = await User.findAll({ attributes: ["id"] });

    if (
      customers.length === 0 ||
      packages.length === 0 ||
      cashiers.length === 0
    ) {
      console.warn(
        "⚠️ Gagal: Pastikan tabel Customer, Package, dan User sudah ada isinya dulu ya, Bestie!"
      );
      return;
    }

    const transactionsToInsert = [];

    for (let i = 0; i < NUM_TRANSACTIONS; i++) {
      const customer = faker.helpers.arrayElement(customers);
      const cashier = faker.helpers.arrayElement(cashiers);
      const laundryStatus = faker.helpers.arrayElement(LAUNDRY_STATUSES);
      const paymentStatus = faker.helpers.arrayElement(PAYMENT_STATUSES);

      // Mengatur tanggal-tanggal laundry
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

      // Format tanggal biar cantik di database
      const dropOffDateFormatted = format(dropOffDate, "yyyy-MM-dd");
      const estimatedPickupDateFormatted = format(
        estimatedPickupDate,
        "yyyy-MM-dd"
      );
      const actualPickupDateFormatted = actualPickupDate
        ? format(actualPickupDate, "yyyy-MM-dd")
        : null;

      // Logika Item & Subtotal
      const numItems = faker.number.int({ min: 1, max: 3 });
      let subtotal = 0;
      const currentDetails = [];

      for (let j = 0; j < numItems; j++) {
        const pkg = faker.helpers.arrayElement(packages);
        const qtyWeight = faker.number.float({
          min: 1,
          max: 8,
          multipleOf: 0.1,
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

      // Kalkulasi Diskon & Total
      const subtotalBeforeDiscount = parseFloat(subtotal.toFixed(2));
      const discountPercentage = faker.number.float({
        min: 0,
        max: MAX_DISCOUNT,
        multipleOf: 0.05,
      });
      const discountAmount = parseFloat(
        (subtotalBeforeDiscount * discountPercentage).toFixed(2)
      );
      const totalPrice = parseFloat(
        (subtotalBeforeDiscount - discountAmount).toFixed(2)
      );

      // Objek Transaksi
      const transaction = {
        invoice_code: faker.string.alphanumeric(8).toUpperCase(),
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

    // Eksekusi Insert ke Database
    let totalDetails = 0;
    for (const { transaction, details } of transactionsToInsert) {
      const createdTransaction = await Transaction.create(transaction);

      const finalDetails = details.map((d) => ({
        ...d,
        TransactionId: createdTransaction.id,
        created_at: new Date(),
        updated_at: new Date(),
      }));

      // Sesuaikan nama field di bawah ini dengan nama kolom di DB kamu ya!
      await TransactionDetail.bulkCreate(finalDetails, {
        ignoreDuplicates: true,
      });
      totalDetails += finalDetails.length;
    }

    console.log(
      `🎉 BERHASIL! Nancy sudah menanam ${transactionsToInsert.length} Transaksi & ${totalDetails} Detail untukmu! 😘✨`
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("TransactionDetails", null, {});
    await queryInterface.bulkDelete("Transactions", null, {});
  },
};
