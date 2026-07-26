const {
  NotFoundError,
  ConflictError,
  BadRequestError,
  AuthenticationError,
  TooManyRequestsError,
} = require("../utils/index");

class UserService {
  constructor({
    User,
    bcrypt,
    jwt,
    Op,
    redis,
    sharp,
    generateToken,
    localStorageService,
  }) {
    this.User = User;
    this.bcrypt = bcrypt;
    this.jwt = jwt;
    this.Op = Op;
    this.redis = redis;
    this.sharp = sharp;
    this.generateToken = generateToken;
    this.storage = localStorageService;
  }

  _generateProfileImageUrl(filePath) {
    // Serve langsung via static route /uploads
    return `uploads/${filePath}`;
  }

  async _compressImage(buffer) {
    return this.sharp(buffer, {
      rotate: false,
    })
      .resize({ width: 500, height: 500 })
      .jpeg({ quality: 80 })
      .toBuffer();
  }

  async _findUserOrFail(userId) {
    const user = await this.User.findByPk(userId);
    if (!user) {
      throw new NotFoundError("User tidak ditemukan");
    }
    return user;
  }

  async registerUser(userData, userImageBuffer) {
    const { first_name, last_name, email, phone, password } = userData;
    const hashedPassword = this.bcrypt.hashSync(password, 10);

    const existingUser = await this.User.findOne({
      where: {
        [this.Op.or]: [{ email: email }, { phone: phone }],
      },
    });

    if (existingUser) {
      throw new ConflictError("User sudah tersedia");
    }

    let imagePath = null;

    if (userImageBuffer) {
      const compressedBuffer = await this._compressImage(userImageBuffer);
      const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
      imagePath = this.storage.saveImageLocally(
        compressedBuffer,
        "profiles",
        filename,
      );
    }

    const newUser = await this.User.create({
      first_name,
      last_name,
      url_user_image: imagePath,
      email,
      phone,
      password: hashedPassword,
      account_type_id: 1,
    });

    let accessToken = this.generateToken(newUser.id);

    return { newUser, accessToken };
  }

  async updatePhotoProfile(imageBuffer, userId) {
    const user = await this._findUserOrFail(userId);

    if (imageBuffer) {
      // Hapus foto lama dari disk jika ada
      if (user.url_user_image) {
        this.storage.deleteImageLocally(user.url_user_image);
      }

      const compressedBuffer = await this._compressImage(imageBuffer);
      const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
      const imagePath = this.storage.saveImageLocally(
        compressedBuffer,
        "profiles",
        filename,
      );
      await user.update({ url_user_image: imagePath });
    }

    return user;
  }

  async loginUser(userData, userIp) {
    const { emailorphone, password } = userData;
    const loginAttemptKey = `login_attempts:${userIp}`;
    const LOCKOUT_TIME_SECONDS = 5 * 60;
    const MAX_ATTEMPTS = 3;

    const attempts = await this.redis.get(loginAttemptKey);
    if (attempts && parseInt(attempts) >= MAX_ATTEMPTS) {
      throw new TooManyRequestsError(
        `Terlalu banyak percobaan login. Silahkan coba lagi nanti ${LOCKOUT_TIME_SECONDS / 60} menit`,
      );
    }

    const user = await this.User.findOne({
      where: {
        [this.Op.or]: [{ email: emailorphone }, { phone: emailorphone }],
      },
    });

    const handleFailedAttempt = async () => {
      const newAttempts = await this.redis.incr(loginAttemptKey);
      if (newAttempts === 1) {
        await this.redis.expire(loginAttemptKey, LOCKOUT_TIME_SECONDS);
      }
    };

    if (!user) {
      await handleFailedAttempt();
      throw new NotFoundError("User tidak ditemukan");
    }

    const isMatch = await this.bcrypt.compare(password, user.password);

    if (!isMatch) {
      await handleFailedAttempt();
      throw new AuthenticationError("Password salah");
    }

    await this.redis.del(loginAttemptKey);

    let accessToken = this.generateToken(user.id);

    return { user, accessToken };
  }

  async updateProfile(userData, userId) {
    const { first_name, last_name, email, phone } = userData;

    const user = await this._findUserOrFail(userId);

    await user.update({
      first_name,
      last_name,
      email,
      phone,
    });

    return user;
  }

  async getProfileImage(userId) {
    const user = await this._findUserOrFail(userId);

    if (!user.url_user_image) {
      throw new NotFoundError("Foto Profil Tidak Ditemukan");
    }

    const buffer = this.storage.readImageLocally(user.url_user_image)

    return buffer
  }

  async getUserById(userId) {
    const user = await this._findUserOrFail(userId);
    return user;
  }

  async getProfileForResponse(userId) {
    const user = await this.getUserById(userId);

    const profileImageUrl = user.url_user_image
      ? this._generateProfileImageUrl(user.url_user_image)
      : null;

    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      reward_status: user.reward_status,
      email: user.email,
      phone: user.phone,
      profile_image_url: profileImageUrl,
    };
  }

  async isEmailRegistered(userData) {
    const { email } = userData;
    const user = await this.User.findOne({ where: { email } });
    let accessToken = this.generateToken(user.id);
    return { user, accessToken };
  }

  async logoutUser(authHeader) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new BadRequestError("Token tidak ditemukan");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new BadRequestError("Token tidak ditemukan");
    }

    const decoded = this.jwt.decode(token);

    if (!decoded || !decoded.exp) {
      throw new BadRequestError("Token tidak valid");
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - now;

    if (expiresIn <= 0) {
      return true;
    }

    await this.redis.setEx(`blacklisted:${token}`, expiresIn, "true");
  }

  async updatePassword(password, userId) {
    const hashedPassword = this.bcrypt.hashSync(password, 10);
    const user = await this._findUserOrFail(userId);

    await user.update({ password: hashedPassword });
  }
}

module.exports = UserService;
