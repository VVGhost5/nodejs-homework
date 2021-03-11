const passport = require("passport");
require("../config/passport");
const { httpCode } = require("./constants");

const guard = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (error, user) => {
    const [, token] = req.get("Authorization").split(" ");
    if (!user || error || token !== user.token) {
      return res.status(httpCode.FORBIDDEN).json({
        Status: "403 Bad forbidden",
        code: httpCode.FORBIDDEN,
        ContentType: "application/json",
        ResponseBody: {
          message: "Access is denied",
        },
      });
    }
    req.user = user;
    return next();
  })(req, res, next);
};

module.exports = guard;
