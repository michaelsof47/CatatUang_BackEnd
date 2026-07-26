class UserController {
  constructor({ UserService }) {
    this.UserService = UserService;
  }

  registerUser = async (req, res, next) => {
    const url_user_image = req.file?.buffer;

    try {
      const { newUser, accessToken } = await this.UserService.registerUser(
        req.body,
        url_user_image
      );

      res.status(201).json({
        message: "User berhasil terdaftar",
        user: newUser.id,
        token: accessToken,
      });
    } catch (error) {
      next(error);
    }
  };

  updatePhotoProfile = async (req, res, next) => {
    const url_user_image = req.file?.buffer;
    const userId = req.user.id;
    try {
      await this.UserService.updatePhotoProfile(url_user_image, userId);

      res.status(200).json({ message: "Foto profil berhasil diperbarui" });
    } catch (error) {
      next(error);
    }
  };

  loginUser = async (req, res, next) => {
    const userIp = req.ip || req.connection.remoteAddress;

    try {
      const { user, accessToken } = await this.UserService.loginUser(
        req.body,
        userIp
      );

      res.status(200).json({
        message: "Login berhasil",
        userId: user.id,
        token: accessToken,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req, res, next) => {
    const userId = req.user.id;
    try {
      const user = await this.UserService.updateProfile(req.body, userId);

      res
        .status(200)
        .json({ message: "Akun berhasil diperbarui", userId: user.id });
    } catch (error) {
      next(error);
    }
  };

  getProfileImage = async (req, res, next) => {
    const userId = req.user.id;

    try {
      const imageBuffer = await this.UserService.getProfileImage(userId);

      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      res.set("Content-Type", "image/jpeg");

      res.send(imageBuffer);
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req, res, next) => {
    try {
      const userProfile = await this.UserService.getProfileForResponse(
        req.user.id
      );
      res.status(200).json(userProfile);
    } catch (error) {
      next(error);
    }
  };

  isEmailRegistered = async (req, res, next) => {
    try {
      const isRegistered = await this.UserService.isEmailRegistered(req.body);

      if (isRegistered) {
        res
          .status(200)
          .json({
            message: "Silahkan Masuk",
            userId: isRegistered.user.id,
            token: isRegistered.accessToken,
          });
      } else {
        res.status(200).json({ message: "Silahkan Daftar" });
      }
    } catch (error) {
      next(error);
    }
  };

  logoutUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    try {
      await this.UserService.logoutUser(authHeader);

      res.status(200).json({ message: "Logout berhasil" });
    } catch (error) {
      next(error);
    }
  };

  updatePassword = async (req, res, next) => {
    const { password } = req.body;

    try {
      await this.UserService.updatePassword(password, req.user.id);

      res.status(200).json({ message: "Password berhasil diperbarui" });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = UserController;
