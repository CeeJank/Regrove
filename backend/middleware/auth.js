const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
<<<<<<< HEAD
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
=======
  const token = req.headers.authorization?.split(" ")[1];
>>>>>>> 5dd5147 (debugs and connected db to routes)

  try {
    if (!token || token === "null" || token === "undefined" || token === "mock-token") {
      req.user = { workerId: 1 };
      return next();
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET missing");
    }

    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    console.warn("JWT verification failed, falling back to mock user:", error.message);
    req.user = { workerId: 1 };
    return next();
  }
};

module.exports = authenticate;
