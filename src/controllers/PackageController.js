const { Package } = require("../../models");
const { Op } = require("sequelize");
const { validationResult } = require("express-validator");

const index = async (req, res) => {
  try {
    const { search, page = 1, limit = 15 } = req.query;

    const offset = (page - 1) * limit;

    let whereClause = {};
    if (search) {
      whereClause = {
        name: { [Op.like]: `%${search}%` },
      };
    }

    const { count, rows: packages } = await Package.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: offset,
      order: [["createdAt", "DESC"]],
    });

    const lastPage = Math.ceil(count / limit);

    return res.status(200).json({
      status: "Success",
      message: "Data paket berhasil diambil! 🎉",
      data: packages,
      meta: {
        total: count,
        per_page: parseInt(limit),
        current_page: parseInt(page),
        last_page: lastPage,
        from: offset + 1,
        to: offset + packages.length,
        filters: { search },
      },
    });
  } catch (error) {
    console.error("❌ Package Index Error:", error);
    return res.status(500).json({ message: "Gagal mengambil data paket." });
  }
};

const store = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn("⚠️ Validation Errors:", errors.array());
    return res.status(400).json({ status: "Failed", errors: errors.array() });
  }

  const { name, description, unit, price, estimated_duration, is_active } =
    req.body;

  try {
    const existingName = await Package.findOne({ where: { name } });
    if (existingName) {
      return res.status(400).json({
        status: "Failed",
        message: `Nama paket ${name} sudah terdaftar.`,
        errors: [{ param: "name", msg: "Nama paket sudah digunakan." }],
      });
    }

    const newPackage = await Package.create({
      name,
      description,
      unit,
      price,
      estimated_duration,
      is_active: is_active !== undefined ? is_active : true,
    });

    console.log(`✅ Paket ${name} berhasil ditambahkan!`);

    return res.status(201).json({
      status: "Success",
      message: "Paket layanan baru berhasil ditambahkan! ✨",
      data: newPackage,
    });
  } catch (error) {
    console.error("❌ Package Store Error:", error);
    return res.status(500).json({ message: "Gagal menyimpan data paket." });
  }
};

const show = async (req, res) => {
  try {
    const packageId = req.params.id;
    const packageItem = await Package.findByPk(packageId);

    if (!packageItem) {
      return res.status(404).json({ message: "Paket tidak ditemukan,!" });
    }

    return res.status(200).json({
      status: "Success",
      data: packageItem,
    });
  } catch (error) {
    console.error("❌ Package Show Error:", error);
    return res.status(500).json({ message: "Gagal mengambil detail paket." });
  }
};

const update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn("⚠️ Validation Errors:", errors.array());
    return res.status(400).json({ status: "Failed", errors: errors.array() });
  }

  const packageId = req.params.id;
  const { name, description, unit, price, estimated_duration, is_active } =
    req.body;

  try {
    const packageItem = await Package.findByPk(packageId);

    if (!packageItem) {
      return res.status(404).json({ message: "Paket tidak ditemukan,!" });
    }

    const existingName = await Package.findOne({
      where: {
        name,
        id: { [Op.ne]: packageId },
      },
    });

    // if (existingName) {
    //   return res.status(400).json({
    //     status: "Failed",
    //     message: `Nama paket ${name} sudah digunakan oleh paket lain.`,
    //     errors: [{ param: "name", msg: "Nama paket sudah digunakan." }],
    //   });
    // }

    await packageItem.update({
      name,
      description,
      unit,
      price,
      estimated_duration,

      is_active: is_active !== undefined ? is_active : packageItem.is_active,
    });

    console.log(`✅ Paket ${packageItem.name} berhasil diupdate!`);

    return res.status(200).json({
      status: "Success",
      message: "Data paket layanan berhasil diupdate! 🔄",
      data: packageItem,
    });
  } catch (error) {
    console.error("❌ Package Update Error:", error);
    return res.status(500).json({ message: "Gagal mengupdate data paket." });
  }
};

const destroy = async (req, res) => {
  try {
    const packageId = req.params.id;
    const packageItem = await Package.findByPk(packageId);

    if (!packageItem) {
      return res.status(404).json({ message: "Paket tidak ditemukan,!" });
    }

    await packageItem.destroy();

    console.log(`🗑️ Paket ${packageItem.name} berhasil dihapus.`);

    return res.status(200).json({
      status: "Success",
      message: "Paket layanan berhasil dihapus! 👍",
    });
  } catch (error) {
    console.error("❌ Package Destroy Error:", error);
    return res.status(500).json({
      message:
        "Gagal menghapus paket. Mungkin masih ada transaksi yang terhubung?",
    });
  }
};

module.exports = {
  index,
  store,
  show,
  update,
  destroy,
};
