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
    bufferToBase64,
    base64ToBuffer,
  }) {
    this.User = User;
    this.bcrypt = bcrypt;
    this.jwt = jwt;
    this.Op = Op;
    this.redis = redis;
    this.sharp = sharp;
    this.generateToken = generateToken;
    this.bufferToBase64 = bufferToBase64;
    this.base64ToBuffer = base64ToBuffer;
  }

  _generateProfileImageUrl(userId) {
    const imageToken = this.jwt.sign(
      { userId: userId },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return `user/profile/picture?token=${imageToken}`;
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

    let base64Image = null;

    if (userImageBuffer) {
      const compressedImageBuffer = await this._compressImage(userImageBuffer);
      base64Image = this.bufferToBase64(compressedImageBuffer);
    }

    const newUser = await this.User.create({
      first_name,
      last_name,
      url_user_image: base64Image,
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
      const compressedImageBuffer = await this._compressImage(imageBuffer);
      const base64Image = this.bufferToBase64(compressedImageBuffer);
      await user.update({ url_user_image: base64Image });
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
      throw new TooManyRequestsError(`Terlalu banyak percobaan login. Silahkan coba lagi nanti ${LOCKOUT_TIME_SECONDS / 60} menit`);
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
      first_name, last_name, email, phone
    });

    return user;
  }

  async getProfileImage(imageToken) {
    if (!imageToken) {
      throw new BadRequestError("Token tidak ditemukan");
    }

    let payload;

    try {
      payload = this.jwt.verify(imageToken, process.env.JWT_SECRET);
    } catch (error) {
      throw new AuthenticationError("Invalid Token");
    }

    const user = await this.User.findByPk(payload.userId);

    if (!user || !user.url_user_image) {
      throw new NotFoundError("Foto profil tidak ditemukan");
    }
    const imageBuffer = this.base64ToBuffer(user.url_user_image);

    return imageBuffer;
  }

  async getUserById(userId) {
    const user = await this._findUserOrFail(userId);
    return user;
  }

  async getProfileForResponse(userId) {
    const user = await this.getUserById(userId);

    const profileImageUrl = user.url_user_image
      ? this._generateProfileImageUrl(userId)
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
    return {user, accessToken};
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
