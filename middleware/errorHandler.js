const errorHandler = (err, req, res, next) => {
  void next;
  let statusCode = 500;
  let message = "Server Error";

  if (process.env.NODE_ENV === "development") console.error(err.stack || err);

  if (err.name === "CastError") {
    statusCode = 404;
    message = "Resource not found";
  } else if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate field value entered for ${field}`;
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  } else if (err.message) {
    message = err.message;
  }

  res.status(statusCode).json({ success: false, error: message });
};

export default errorHandler;
