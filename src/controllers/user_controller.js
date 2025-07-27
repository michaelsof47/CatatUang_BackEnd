require("dotenv").config;
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const redis = require('../config/redis');
const { Op } = require("sequelize");
const client = require("../config/redis");

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

  const userIp = req.ip || req.connection.remoteAddress;
  const loginAttemptKey = `login_attempts:${userIp}`;
  const LOCKOUT_TIME_SECONDS = 5*60;

  try {
    const currentAttempts = await redis.get(loginAttemptKey);

    if(currentAttempts && parseInt(currentAttempts) >= 3) {
      return res.status(429).json({
        error: `Terlalu banyak percobaan login. Silahkan coba lagi nanti ${LOCKOUT_TIME_SECONDS / 60} menit`
      })
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: emailorphone }, { phone: emailorphone }],
      },
    });

    if (!user) {

      await redis.incr(loginAttemptKey);

      if(currentAttempts === null) {
        await redis.setEx(loginAttemptKey, LOCKOUT_TIME_SECONDS, 'true');
      }
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      await redis.incr(loginAttemptKey);

      if(currentAttempts === null) {
        await redis.setEx(loginAttemptKey, LOCKOUT_TIME_SECONDS, 'true');
      }
      return res.status(401).json({ error: "Password salah" });
    }

    await redis.del(loginAttemptKey);

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

exports.logoutUser = async (req, res) => {
  const authHeader = req.headers.authorization;

  if(!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(400).json({message: 'Token tidak ditemukan'});
  }

  const token = authHeader.split(' ')[1];

  if(!token) {
    return res.status(400).json({message: 'Token tidak ditemukan'});
  }

  try {
    const decoded = jwt.decode(token);

    if(!decoded || !decoded.exp) {
      return res.status(400).json({message: 'Token tidak valid'});
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - now;

    if(expiresIn <= 0) {
      return res.status(200).json({message: 'Logout berhasil'});
    }

    await redis.setEx(`blacklisted:${token}`, expiresIn, 'true');

    res.status(200).json({message: 'Logout berhasil'});
  } catch (error) {
    res.status(500).json({error: 'Internal Server Error'});
    console.error("Error logout user by ID: ", error);
  }
}
