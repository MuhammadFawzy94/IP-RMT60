const { comparePassword } = require("../helpers/bcrypt");
const { createToken } = require("../helpers/jwt");
const {User} = require("../models");
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client();


module.exports = class UserController {
  static async register(req, res, next) {
    try {
      const { email, password, phoneNumber, address } = req.body;
      const newUser = await User.create({ email, password, phoneNumber, address });
      res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        phoneNumber: newUser.phoneNumber,
        address: newUser.address,
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

  static async googleLogin(req, res, next) {
    try {
      const { googleToken } = req.body;
      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: "811355563262-uucg049niqmltoos0jd7opkjapbr076f.apps.googleusercontent.com", 
    });
    const payload = ticket.getPayload();

    const user = await User.findOne({ where: { email: payload.email } });

    let userToAuthenticate;
if (!user) {
  userToAuthenticate = await User.create({
    email: payload.email,
    password: Math.random().toString(),
    phoneNumber: payload.phoneNumber || null,
    address: payload.address || null,
  });
} else {
  userToAuthenticate = user;
}
      const access_token = createToken({ id: user.id });
      res.json({ access_token });
    } catch (err) {
      next(err);
    }
  }
};
