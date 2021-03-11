const jwt = require("jsonwebtoken");
const Users = require("../model/users");
require("dotenv").config();
const { httpCode } = require("../helpers/constants");
const SECRET_KEY = process.env.JWT_SECRET;

const reg = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await Users.findByEmail(email);
    if (user) {
      return res.status(httpCode.CONFLICT).json({
        Status: "409 Conflict",
        code: httpCode.CONFLICT,
        ContentType: "application/json",
        ResponseBody: {
          message: "Email in use",
        },
      });
    }

    const newUser = await Users.create(req.body);
    return res.status(httpCode.CREATED).json({
      code: httpCode.CREATED,
      Status: "201 Created",
      ContentType: "application/json",
      ResponseBody: {
        user: {
          id: newUser.id,
          email: newUser.email,
          subscription: "free",
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findByEmail(email);
    if (!user || !user.validPassword(password)) {
      return res.status(httpCode.UNAUTHORIZED).json({
        Status: "400 Bad request",
        code: httpCode.UNAUTHORIZED,
        ContentType: "application/json",
        ResponseBody: {
          message: "Ошибка от Joi или другой валидационной библиотеки",
        },
      });
    }
    const id = user._id;
    const payload = { id };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "2h" });
    await Users.updateToken(id, token);
    return res.status(httpCode.CREATED).json({
      code: httpCode.OK,
      Status: "201 OK",
      ContentType: "application/json",
      ResponseBody: {
        token,
        user: {
          email: email,
          subscription: "free",
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  const id = req.user.id;
  await Users.updateToken(id, null);
  return res.status(httpCode.NO_CONTENT).json({ message: "Nothing" });
};

module.exports = { reg, login, logout };
