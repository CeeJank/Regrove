function errorHandler(error, req, res, next) {
  console.error(error.message);

  return res.status(error.statusCode || 500).json({
    message: error.message || "Something went wrong",
  });
}

module.exports = errorHandler;
