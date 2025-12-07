const express = require("express");
const { body } = require("express-validator");
const {
  index,
  store,
  show,
  update,
  destroy,
} = require("../controllers/CustomerController");

const customerRoutes = express.Router();

const customerValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Nama wajib diisi.")
    .isLength({ max: 150 })
    .withMessage("Nama maksimal 150 karakter."),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Nomor telepon wajib diisi.")
    .isLength({ max: 20 })
    .withMessage("Nomor telepon maksimal 20 karakter."),
  body("address")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Alamat harus berupa teks."),
];

customerRoutes.get("/", index);

customerRoutes.post("/", customerValidationRules, store);

customerRoutes.get("/:id", show);

customerRoutes.put("/:id", customerValidationRules, update);

customerRoutes.delete("/:id", destroy);

module.exports = customerRoutes;
