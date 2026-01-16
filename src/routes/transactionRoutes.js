const express = require("express");
const { body, param } = require("express-validator");
const {
  index,
  getCreateData,
  store,
  show,
  updateStatus,
  updatePayment,
} = require("../controllers/TransactionController");

const transactionRoutes = express.Router();

const storeValidationRules = [
  body("customer_id")
    .isInt()
    .withMessage("ID Pelanggan harus integer.")
    .exists()
    .withMessage("ID Pelanggan wajib diisi."),
  body("drop_off_date")
    .isDate()
    .withMessage("Tanggal masuk tidak valid.")
    .exists()
    .withMessage("Tanggal masuk wajib diisi."),
  body("final_total_price")
    .isFloat({ min: 0 })
    .withMessage("Total harga tidak valid.")
    .exists()
    .withMessage("Total harga wajib diisi."),

  body("items")
    .isArray({ min: 1 })
    .withMessage("Minimal harus ada 1 item layanan."),
  body("items.*.package_id")
    .isInt()
    .withMessage("ID Paket harus integer.")
    .exists()
    .withMessage("ID Paket wajib diisi."),
  body("items.*.qty_weight")
    .isFloat({ min: 0.01 })
    .withMessage("Kuantitas/berat minimal 0.01.")
    .exists()
    .withMessage("Kuantitas/berat wajib diisi."),
  body("items.*.price_per_unit")
    .isFloat({ min: 0 })
    .withMessage("Harga satuan tidak valid.")
    .exists()
    .withMessage("Harga satuan wajib diisi."),
  body("items.*.subtotal")
    .isFloat({ min: 0 })
    .withMessage("Subtotal tidak valid.")
    .exists()
    .withMessage("Subtotal wajib diisi."),

  body("discount_amount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Diskon harus angka positif."),
  body("payment_status")
    .optional()
    .isIn(["pending", "paid"])
    .withMessage("Status pembayaran tidak valid."),
];

transactionRoutes.get("/", index);

transactionRoutes.get("/create-data", getCreateData);

transactionRoutes.post("/", storeValidationRules, store);

transactionRoutes.get("/:id", show);

transactionRoutes.put(
  "/:id/status",
  [
    body("status")
      .isIn(["processing", "done", "taken"])
      .withMessage("Status cucian tidak valid."),
  ],
  updateStatus
);

transactionRoutes.put(
  "/:id/payment",
  [
    body("payment_status")
      .isIn(["pending", "paid"])
      .withMessage("Status pembayaran tidak valid."),
  ],
  updatePayment
);

module.exports = transactionRoutes;
