require("dotenv").config;
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

exports.registerUser = async (req, res) => {
  const { first_name, last_name, email, phone, password } = req.body;
  console.log("email :", email, "phone :", phone);
  const url_user_image = req.file?.buffer;
  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    const checkUser = await User.findOne({
      where: {
        [Op.or]: [{ email: email }, { phone: phone }],
      },
    });

    if (!checkUser) {
      const newUser = await User.create({
        first_name,
        last_name,
        url_user_image,
        email,
        phone,
        password: hashedPassword,
        account_type_id: 1,
      });

      let accessToken = generateToken(newUser.id);

      res
        .status(201)
        .json({
          message: "User berhasil terdaftar",
          user: newUser.id,
          token: accessToken,
        });
    } else {
      res.status(404).json({ error: "User sudah tersedia" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error("Error registering user: ", error);
  }
};

exports.updatePhotoProfile = async (req, res) => {
  const url_user_image = req.file?.buffer;

  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    user.url_user_image = url_user_image;

    await user.save();

    res.status(200).json({ message: "Foto profil berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error("Error updating photo profile: ", error);
  }
};

exports.updateProfile = async (req, res) => {
  const {first_name, last_name, email, phone } = req.body;

  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    user.first_name = first_name;
    user.last_name = last_name;
    user.email = email;
    user.phone = phone;

    await user.save();

    res
      .status(200)
      .json({ message: "Akun berhasil diperbarui", userId: user.id });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error("Error updating user: ", error);
  }
};

exports.getProfileImage = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user || !user.url_user_image) {
      return res.status(404).send("Foto profil tidak ditemukan");
    }

    res.set("Content-Type", "image/jpeg");
    res.send(user.url_user_image);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error("Error fetching profile image: ", error);
  }
};

exports.loginUser = async (req, res) => {
  const { emailorphone, password } = req.body;

  try {
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: emailorphone }, { phone: emailorphone }],
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Password salah" });
    }

    let accessToken = generateToken(user.id);

    res
      .status(200)
      .json({ message: "Login berhasil", userId: user.id, token: accessToken });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error("Error logging in user: ", error);
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    res.status(200).json({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      reward_status: user.reward_status,
      email: user.email,
      phone: user.phone,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error("Error fetching user by ID: ", error);
  }
};

exports.isEmailRegistered = async (req, res) => {
  const { email } = req.body;

  try {
    const isEmailAvailable = await User.findOne({ where: { email } });

    if (isEmailAvailable) {
      const accessToken = generateToken(isEmailAvailable.id);
      return res.status(200).json({
        message: "Silahkan Masuk",
        userId: isEmailAvailable.id,
        token: accessToken,
      });
    } else {
      return res.status(200).json({ message: "Silahkan Daftar" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error("Error fetching user by ID: ", error);
  }
};
