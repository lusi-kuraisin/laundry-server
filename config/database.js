const { Sequelize } = require("sequelize");
const path = require("path");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "..", "db.sqlite"),
  logging: console.log,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log(
      "🤩 Database connection has been established and synced successfully! 💖"
    );
  } catch (error) {
    console.error("😭 Unable to connect to the database:", error);
  }
};

module.exports = { sequelize, connectDB };
