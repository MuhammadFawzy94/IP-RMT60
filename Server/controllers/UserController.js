const { comparePassword } = require("../helpers/bcrypt");
const { createToken } = require("../helpers/jwt");
const {User} = require("../models");


module.exports = class UserController {
  static async register(req, res, next) {
    try {
      const { email, password } = req.body;
      const newUser = await User.create({ email, password });
      res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    const { email, password } = req.body;
    if (!email) {
      throw { name: "BadRequest", message: "Email is required" };
    }
    if (!password) {
      throw { name: "BadRequest", message: "Password is required!" };
    }

    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw { name: "Unauthorized", message: "Email/password is required" };
      }

      const isValidPassword = comparePassword(password, user.password);
      if (!isValidPassword) {
        throw { name: "Unauthorized", message: "Email/password is required" };
      }

      const access_token = createToken({ id: user.id, email: user.email });

      res.status(200).json({ access_token });
    } catch (err) {
      next(err);
    }
  }
};
