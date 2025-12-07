"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const packagesData = [
      {
        name: "Cuci Kering Lipat Reguler",
        description:
          "Layanan cuci dan pengeringan standar, tidak termasuk setrika.",
        unit: "kg",
        price: 7500.0,
        estimated_duration: 3,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Cuci Setrika Reguler",
        description: "Layanan lengkap cuci, kering, dan setrika standar.",
        unit: "kg",
        price: 12000.0,
        estimated_duration: 5,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Cuci Kilat (Express)",
        description: "Layanan cuci, kering, dan lipat dalam waktu 24 jam.",
        unit: "kg",
        price: 18000.0,
        estimated_duration: 1,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Setrika Saja",
        description: "Hanya layanan setrika untuk pakaian yang sudah dicuci.",
        unit: "kg",
        price: 8000.0,
        estimated_duration: 2,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Sepatu (Per Pasang)",
        description: "Pencucian premium untuk sepatu. Harga per pasang.",
        unit: "pcs",
        price: 35000.0,
        estimated_duration: 7,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Boneka Besar",
        description: "Pencucian khusus untuk boneka besar. Harga per item.",
        unit: "item",
        price: 50000.0,
        estimated_duration: 4,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Diskon Musiman (Nonaktif)",
        description: "Paket diskon yang sedang tidak aktif.",
        unit: "kg",
        price: 5000.0,
        estimated_duration: 3,
        is_active: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("Packages", packagesData, {});

    console.log("✅ Data paket berhasil di-seed!");
  },

  async down(queryInterface, Sequelize) {
    /**
     * Hapus semua data yang di-seed di fungsi 'up'
     */
    await queryInterface.bulkDelete("Packages", null, {});

    console.log("🗑️ Data paket berhasil di-undo!");
  },
};
