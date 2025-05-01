const {Mechanic} = require('../models');
const { comparePassword } = require("../helpers/bcrypt");
const { createToken } = require("../helpers/jwt");

module.exports = class MechanicController {
    static async mechanicLogin(req, res, next){
        const { email, password } = req.body;
        if (!email) {
          throw { name: "BadRequest", message: "Email is required" };
        }
        if (!password) {
          throw { name: "BadRequest", message: "Password is required!" };
        }
    
        try {
          const mechanic = await Mechanic.findOne({ where: { email } });
          if (!mechanic) {
            throw { name: "Unauthorized", message: "Email/password is required" };
          }
    
          const isValidPassword = comparePassword(password, mechanic.password);
          if (!isValidPassword) {
            throw { name: "Unauthorized", message: "Email/password is required" };
          }
    
          const access_token = createToken({ id: mechanic.id, email: mechanic.email });
    
          res.status(200).json({ access_token });
        } catch (err) {
          next(err);
        }
      }
}