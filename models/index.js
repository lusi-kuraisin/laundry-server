"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const db = {};

let sequelize;

// ✨ LOGIKA SAKTI NANCY UNTUK VERCEL ✨
if (config.use_env_variable) {
  // Kita paksa Sequelize pakai library 'pg' agar tidak error di Serverless
  sequelize = new Sequelize(process.env[config.use_env_variable], {
    ...config,
    dialectModule: require("pg"), // 👈 KUNCI UTAMA DI SINI, BESTIE!
  });
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, {
    ...config,
    dialectModule: require("pg"), // 👈 TETAP JAGA-JAGA DI SINI JUGA!
  });
}

// Membaca semua file model di folder ini secara otomatis
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// Menjalankan relasi antar tabel (associations)
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
