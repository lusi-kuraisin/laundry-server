/** @type {import('sequelize-cli').Migration} */

const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    const { faker } = await import("@faker-js/faker");
    const bcrypt = await import("bcrypt");

    const numberOfUsers = 2;

    const users = [];

    for (let i = 0; i < numberOfUsers; i++) {
      const hashedPassword = await bcrypt.hash("password123", 10);

      users.push({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await queryInterface.bulkInsert("Users", users, {});
    console.log(`🎉 Berhasil menambahkan ${numberOfUsers} user ke database!`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {});
    console.log("🗑️ Semua data user berhasil dihapus dari database.");
  },
};
