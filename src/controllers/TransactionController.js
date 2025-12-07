const {
  Transaction,
  TransactionDetail,
  Customer,
  User,
  Package,
  sequelize,
} = require("../../models");
const { Op } = require("sequelize");
const { validationResult } = require("express-validator");

const index = async (req, res) => {
  try {
    const { search, page = 1, limit = 15, status } = req.query;

    const offset = (page - 1) * limit;

    let whereClause = {};
    if (search) {
      whereClause.invoice_code = { [Op.like]: `%${search}%` };
    }
    if (status) {
      whereClause.laundry_status = status;
    }

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "name", "phone"],
        },
        { model: User, as: "cashier", attributes: ["id", "name"] },
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [["createdAt", "DESC"]],
    });

    const lastPage = Math.ceil(count / limit);

    return res.status(200).json({
      status: "Success",
      message: "Data transaksi berhasil diambil! 🎉",
      data: transactions,
      meta: {
        total: count,
        per_page: parseInt(limit),
        current_page: parseInt(page),
        last_page: lastPage,
        from: offset + 1,
        to: offset + transactions.length,
        filters: { search, status },
      },
    });
  } catch (error) {
    console.error("❌ Transaction Index Error:", error);
    return res.status(500).json({ message: "Gagal mengambil data transaksi." });
  }
};

const getCreateData = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      attributes: ["id", "name", "phone", "address"],
    });

    const packages = await Package.findAll({
      where: { is_active: true },
    });

    const currentUserId = req.user ? req.user.id : null;

    return res.status(200).json({
      status: "Success",
      data: {
        customers,
        packages,
        currentUserId,
      },
    });
  } catch (error) {
    console.error("❌ Get Create Data Error:", error);
    return res
      .status(500)
      .json({ message: "Gagal memuat data persiapan transaksi." });
  }
};

const store = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn("⚠️ Validation Errors:", errors.array());
    return res.status(400).json({ status: "Failed", errors: errors.array() });
  }

  const cashierId = req.user ? req.user.id : 1;

  const {
    customer_id,
    drop_off_date,
    final_total_price,
    subtotal_before_discount,
    discount_amount = 0,
    max_duration = 2,
    payment_status = "pending",
    items,
  } = req.body;

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const invoiceCode = `INV-${dateStr}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;

  try {
    await sequelize.transaction(async (t) => {
      const transaction = await Transaction.create(
        {
          invoice_code: invoiceCode,
          customer_id: customer_id,
          user_id: cashierId,
          subtotal: subtotal_before_discount,
          discount_amount: discount_amount,
          total_price: final_total_price,
          drop_off_date: drop_off_date,

          estimated_pickup_date: new Date(
            new Date(drop_off_date).getTime() +
              max_duration * 24 * 60 * 60 * 1000
          )
            .toISOString()
            .slice(0, 10),

          laundry_status: "new",
          payment_status: payment_status,
        },
        { transaction: t }
      );

      const detailsToCreate = items.map((item) => ({
        TransactionId: transaction.id,
        package_id: item.package_id,
        qty_weight: item.qty_weight,
        price_per_unit: item.price_per_unit,
        subtotal: item.subtotal,
      }));

      const detailFields = [
        "TransactionId",
        "package_id",
        "qty_weight",
        "price_per_unit",
        "subtotal",
      ];

      await TransactionDetail.bulkCreate(detailsToCreate, {
        transaction: t,
        fields: detailFields,
      });
    });

    console.log(`✅ Transaksi ${invoiceCode} berhasil dibuat!`);

    return res.status(201).json({
      status: "Success",
      message: "Transaksi baru berhasil dibuat! 🎉",
      invoiceCode: invoiceCode,
    });
  } catch (error) {
    console.error("❌ Transaction Store Error (Rollback Otomatis):", error);
    return res
      .status(500)
      .json({ message: "Gagal menyimpan transaksi. Database rollback." });
  }
};

const show = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const transaction = await Transaction.findByPk(transactionId, {
      include: [
        { model: Customer, as: "customer" },
        { model: User, as: "cashier" },
        {
          model: TransactionDetail,
          as: "details",
          attributes: [
            "id",
            "TransactionId",
            "package_id",
            "qty_weight",
            "price_per_unit",
            "subtotal",
            "createdAt",
            "updatedAt",
          ],
          include: [{ model: Package, as: "package" }],
        },
      ],
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan,!" });
    }

    return res.status(200).json({
      status: "Success",
      data: transaction,
    });
  } catch (error) {
    console.error("❌ Transaction Show Error:", error);
    return res
      .status(500)
      .json({ message: "Gagal mengambil detail transaksi." });
  }
};

const updateStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "Failed", errors: errors.array() });
  }

  const transactionId = req.params.id;
  const { status } = req.body;

  try {
    const transaction = await Transaction.findByPk(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan." });
    }

    const updateFields = { laundry_status: status };
    if (status === "taken") {
      updateFields.actual_pickup_date = new Date();
    }

    await transaction.update(updateFields);

    console.log(
      `🧺 Status transaksi ${transaction.invoice_code} diubah menjadi ${status}`
    );

    return res.status(200).json({
      status: "Success",
      message: `Status cucian berhasil diubah menjadi ${status}! 🧺`,
      data: transaction,
    });
  } catch (error) {
    console.error("❌ Update Status Error:", error);
    return res.status(500).json({ message: "Gagal mengupdate status cucian." });
  }
};

const updatePayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "Failed", errors: errors.array() });
  }

  const transactionId = req.params.id;
  const { payment_status } = req.body;

  try {
    const transaction = await Transaction.findByPk(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan." });
    }

    await transaction.update({ payment_status });

    console.log(
      `💰 Status pembayaran ${transaction.invoice_code} diubah menjadi ${payment_status}`
    );

    return res.status(200).json({
      status: "Success",
      message: `Status pembayaran berhasil diubah menjadi ${payment_status}! 💰`,
      data: transaction,
    });
  } catch (error) {
    console.error("❌ Update Payment Error:", error);
    return res
      .status(500)
      .json({ message: "Gagal mengupdate status pembayaran." });
  }
};

module.exports = {
  index,
  getCreateData,
  store,
  show,
  updateStatus,
  updatePayment,
};
