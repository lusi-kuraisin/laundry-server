require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { User } = require("../../models");

const JWT_SECRET = process.env.JWT_SECRET || "laundry_secret_key_super_aman";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const clientType = req.headers["x-client-type"] || "web";

  try {
    const user = await User.findOne({ where: { email } });
    console.log(user);

    if (!user) {
      return res
        .status(401)
        .json({ status: "Error", message: "Email tidak ditemukan,." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "Error",
        message: "Password salah. Coba ingat-ingat lagi! 😘",
      });
    }

    const token = generateToken(user);

    if (clientType === "web") {
      console.log("Kirim Cookie ke Web berhasil.");
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });
    }

    console.log(`✨ ${user.name} berhasil login!`);

    res.status(200).json({
      status: "Success",
      message: `Selamat datang kembali, ${user.name}! 💖`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      ...(clientType === "web" && { token }),
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Login gagal." });
  }
};

const generateToken = (user) => {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    status: "Success",
    message: "Sampai jumpa lagi! Hati-hati di jalan ya 👋",
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Email tidak terdaftar." });
    }

    const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

    console.log(`📧 Link reset password untuk ${email}: ${resetUrl}`);

    res.status(200).json({
      status: "Success",
      message:
        "Link reset password sudah dikirim ke email kamu! Cek inbox ya 📧",
      debug_token: resetToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User tidak valid." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    user.password = passwordHash;
    await user.save();

    console.log(`🔒 Password untuk ${user.name} berhasil direset.`);

    res.status(200).json({
      status: "Success",
      message:
        "Password berhasil diubah! Silakan login dengan password baru ya 😘",
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(400)
        .json({ message: "Link reset sudah kadaluarsa, minta baru lagi ya!" });
    }
    res.status(500).json({ message: "Gagal reset password." });
  }
};

module.exports = {
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
};
