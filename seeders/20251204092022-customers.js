/** @type {import('sequelize-cli').Migration} */

// const { faker } = require("@faker-js/faker");

module.exports = {
  async up(queryInterface, Sequelize) {
    const { faker } = await import("@faker-js/faker");
    const numberOfCustomers = 15;

    const customers = [];

    for (let i = 0; i < numberOfCustomers; i++) {
      customers.push({
        name: faker.person.fullName(),
        phone:
          "08" + faker.string.numeric(faker.number.int({ min: 9, max: 11 })),
        address:
          faker.location.streetAddress(true) + ", " + faker.location.city(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await queryInterface.bulkInsert("Customers", customers, {});
    console.log(
      `🎉 Berhasil menambahkan ${numberOfCustomers} pelanggan ke database!`
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Customers", null, {});
    console.log("🗑️ Semua data pelanggan berhasil dihapus dari database.");
  },
};
