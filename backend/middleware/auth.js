const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET missing");
    }
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    if (!req.user) return res.status(401).json({ message: "Invalid token" });
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authenticate;
