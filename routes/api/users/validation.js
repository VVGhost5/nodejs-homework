const Joi = require("joi");
const { httpCode } = require("../../../helpers/constants");

const schemaCreateUser = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(20).required(),
});

const schemaUpdateUser = Joi.object({
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).max(20).required(),
}).min(1);

const validate = (schema, obj, next) => {
  const { error } = schema.validate(obj);
  if (error) {
    const [{ message }] = error.details;
    return next({
      status: 400,
      message: `Filed: ${message.replace(/"/g, "")}`,
    });
  }
  next();
};

module.exports.createUserValidation = (req, _res, next) => {
  return validate(schemaCreateUser, req.body, next);
};

module.exports.updateUserValidation = (req, _res, next) => {
  return validate(schemaUpdateUser, req.body, next);
};

module.exports.validateUploadAvatar = (req, res, next) => {
  if (!req.file) {
    return res.status(httpCode.BAD_REQUEST).json({
      status: "error",
      code: httpCode.BAD_REQUEST,
      data: "Bad request",
      message: "Field of avatar with file not found",
    });
  }
  next();
};
