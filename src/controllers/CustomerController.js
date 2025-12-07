const { Customer } = require("../../models");
const { Op } = require("sequelize");
const { validationResult } = require("express-validator");
// const { v4: uuidv4 } = require("uuid");

const index = async (req, res) => {
  try {
    const { search, page = 1, limit = 15 } = req.query;

    const offset = (page - 1) * limit;

    let whereClause = {};
    if (search) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    const { count, rows: customers } = await Customer.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: offset,
      order: [["createdAt", "DESC"]],
    });

    const lastPage = Math.ceil(count / limit);

    return res.status(200).json({
      status: "Success",
      message: "Data pelanggan berhasil diambil! 🎉",
      data: customers,
      meta: {
        total: count,
        per_page: parseInt(limit),
        current_page: parseInt(page),
        last_page: lastPage,
        from: offset + 1,
        to: offset + customers.length,
      },
    });
  } catch (error) {
    console.error("❌ Customer Index Error:", error);
    return res.status(500).json({ message: "Gagal mengambil data pelanggan." });
  }
};

const store = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn("⚠️ Validation Errors:", errors.array());
    return res.status(400).json({ status: "Failed", errors: errors.array() });
  }

  const { name, phone, address } = req.body;

  try {
    const existingPhone = await Customer.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({
        status: "Failed",
        message: `Nomor telepon ${phone} sudah terdaftar.`,
        errors: [{ param: "phone", msg: "Nomor telepon sudah digunakan." }],
      });
    }

    const newCustomer = await Customer.create({
      name,
      phone,
      address,
    });

    console.log(`✅ Customer ${name} berhasil ditambahkan!`);

    return res.status(201).json({
      status: "Success",
      message: "Pelanggan baru berhasil ditambahkan! 💖",
      data: newCustomer,
    });
  } catch (error) {
    console.error("❌ Customer Store Error:", error);
    return res.status(500).json({ message: "Gagal menyimpan data pelanggan." });
  }
};

const show = async (req, res) => {
  try {
    const customerId = req.params.id;
    const customer = await Customer.findByPk(customerId);

    if (!customer) {
      return res.status(404).json({ message: "Pelanggan tidak ditemukan,!" });
    }

    return res.status(200).json({
      status: "Success",
      data: customer,
    });
  } catch (error) {
    console.error("❌ Customer Show Error:", error);
    return res
      .status(500)
      .json({ message: "Gagal mengambil detail pelanggan." });
  }
};

const update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn("⚠️ Validation Errors:", errors.array());
    return res.status(400).json({ status: "Failed", errors: errors.array() });
  }

  const customerId = req.params.id;
  const { name, phone, address } = req.body;

  try {
    const customer = await Customer.findByPk(customerId);

    if (!customer) {
      return res.status(404).json({ message: "Pelanggan tidak ditemukan,!" });
    }

    const existingPhone = await Customer.findOne({
      where: {
        phone,
        id: { [Op.ne]: customerId },
      },
    });

    if (existingPhone) {
      return res.status(400).json({
        status: "Failed",
        message: `Nomor telepon ${phone} sudah digunakan oleh pelanggan lain.`,
        errors: [{ param: "phone", msg: "Nomor telepon sudah digunakan." }],
      });
    }

    await customer.update({ name, phone, address });

    console.log(`✅ Customer ${customer.name} berhasil diupdate!`);

    return res.status(200).json({
      status: "Success",
      message: "Data pelanggan berhasil diupdate! ✨",
      data: customer,
    });
  } catch (error) {
    console.error("❌ Customer Update Error:", error);
    return res
      .status(500)
      .json({ message: "Gagal mengupdate data pelanggan." });
  }
};

const destroy = async (req, res) => {
  try {
    const customerId = req.params.id;
    const customer = await Customer.findByPk(customerId);

    if (!customer) {
      return res.status(404).json({ message: "Pelanggan tidak ditemukan,!" });
    }

    await customer.destroy();

    console.log(`🗑️ Customer ${customer.name} berhasil dihapus.`);

    return res.status(200).json({
      status: "Success",
      message: "Pelanggan berhasil dihapus! 👍",
    });
  } catch (error) {
    console.error("❌ Customer Destroy Error:", error);
    return res.status(500).json({ message: "Gagal menghapus pelanggan." });
  }
};

module.exports = {
  index,
  store,
  show,
  update,
  destroy,
};
