const jwt = require("jsonwebtoken");
const Users = require("../model/users");
const fs = require("fs").promises;
const path = require("path");
const Jimp = require("jimp");
const cloudinary = require("cloudinary").v2;
const { promisify } = require("util");
require("dotenv").config();

const { httpCode } = require("../helpers/constants");
const createFolderIsExist = require("../helpers/create-dir");

const SECRET_KEY = process.env.JWT_SECRET;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const uploadCloud = promisify(cloudinary.uploader.upload);
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
          avatar: newUser.avatar,
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

const avatars = async (req, res, next) => {
  try {
    const id = req.user.id;
    // const avatarUrl = await saveAvatarToStatic(req);
    const {
      public_id: imgIdCloud,
      secure_url: avatarUrl,
    } = await saveAvatarToCloud(req);
    // await Users.updateAvatar(id, avatarUrl);
    await Users.updateAvatar(id, avatarUrl, imgIdCloud);
    return res.json({
      status: "success",
      code: httpCode.OK,
      data: {
        avatarUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

const saveAvatarToStatic = async (req) => {
  const id = req.user.id;
  const AVATARS_OF_USERS = process.env.AVATARS_OF_USERS;
  const pathFile = req.file.path;
  const newNameAvatar = `${Date.now()}-${req.file.originalname}`;
  const img = await Jimp.read(pathFile);
  await img
    .autocrop()
    .cover(250, 250, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE)
    .writeAsync(pathFile);
  await createFolderIsExist(path.join(AVATARS_OF_USERS, id));
  await fs.rename(pathFile, path.join(AVATARS_OF_USERS, id, newNameAvatar));
  const avatarUrl = path.normalize(path.join(id, newNameAvatar));
  try {
    await fs.unlink(
      path.join(process.cwd(), AVATARS_OF_USERS, req.user.avatar)
    );
  } catch (error) {
    console.log(error.message);
  }
  return avatarUrl;
};

const saveAvatarToCloud = async (req) => {
  const pathFile = req.file.path;
  const result = await uploadCloud(pathFile, {
    folder: "Photo",
    transformation: { width: 250, height: 250, crop: "fill" },
  });
  cloudinary.uploader.destroy(req.user.imgIdCloud, (error, result) => {
    console.log(error, result);
  });
  try {
    await fs.unlink(pathFile);
  } catch (error) {
    console.log(error.message);
  }
  return result;
};
module.exports = { reg, login, logout, avatars };
