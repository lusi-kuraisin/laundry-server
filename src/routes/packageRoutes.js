const express = require("express");
const { body } = require("express-validator");
const {
  index,
  store,
  show,
  update,
  destroy,
} = require("../controllers/PackageController");

const packageRoutes = express.Router();

const packageValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Nama paket wajib diisi.")
    .isLength({ max: 100 })
    .withMessage("Nama maksimal 100 karakter."),
  body("description")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Deskripsi harus berupa teks."),

  body("unit")
    .notEmpty()
    .withMessage("Satuan wajib diisi.")
    .isIn(["kg", "pcs", "item"])
    .withMessage('Satuan harus "kg", "pcs", atau "item".'),

  body("price")
    .notEmpty()
    .withMessage("Harga wajib diisi.")
    .isFloat({ min: 0 })
    .withMessage("Harga harus berupa angka dan tidak boleh negatif."),

  body("estimated_duration")
    .notEmpty()
    .withMessage("Estimasi durasi wajib diisi.")
    .isInt({ min: 1 })
    .withMessage("Durasi harus berupa bilangan bulat positif."),

  body("is_active")
    .optional()
    .isBoolean({ strict: true })
    .withMessage("Status aktif harus bernilai boolean (true/false)."),
];

packageRoutes.get("/", index);

packageRoutes.post("/", packageValidationRules, store);

packageRoutes.get("/:id", show);

packageRoutes.put("/:id", packageValidationRules, update);

packageRoutes.delete("/:id", destroy);

module.exports = packageRoutes;
