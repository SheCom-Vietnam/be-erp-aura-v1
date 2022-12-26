const jwt = require("jsonwebtoken");
const catchAsync = require("../helpers/catchAsync");
const AppError = require("../helpers/appError");
const { promisify } = require("util");
const supabase = require("../config/supabase");
module.exports = catchAsync(async (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    return next(new AppError("Missing header in request", 401));
  }
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return next(
      new AppError(
        "Missing account token in header of request.Please login again",
        401
      )
    );
  }
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_TOKEN_SECRET
  );

  if (!decoded.id) {
    return next(new AppError("Unauthorized.You dont' have permission", 401));
  }

  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .match({ phone: decoded.id, position: "staff" });
  if (data.length === 0) {
    return next(
      new AppError(
        "User belong with this token does not exist.Login Again",
        401
      )
    );
  }
  req.user = data[0];
  next();
});
